import { Injectable } from '@nestjs/common';
import { AppException, ErrorCode, NotFoundAppException } from '#common/exceptions';
import { DeliveryStatus, OrderStatus, PaymentStatus, Role } from '#common/enums';
import { generateOtp, safeCompare, sha256 } from '#common/utils';
import type { PaginatedResult } from '#common/dto';
import { OrderRepository, OrderEventRepository } from '#modules/orders';
import { ShopsService } from '#modules/shops';
import { FinanceService } from '#modules/finance';
import { DeliveryTaskRepository } from '../repositories/delivery-task.repository.js';
import type { DeliveryTask } from '../schemas/delivery-task.schema.js';
import type { AssignDeliveryTaskDto } from '../dto/assign-delivery-task.dto.js';
import type { VerifyDeliveryOtpDto } from '../dto/verify-delivery-otp.dto.js';
import type { QueryDeliveryTasksDto } from '../dto/query-delivery-tasks.dto.js';
import { toDeliveryTaskResponseDto } from '../mappers/delivery-task.mapper.js';
import type { DeliveryTaskResponseDto } from '../dto/delivery-task-response.dto.js';

@Injectable()
export class DeliveryTasksService {
  constructor(
    private readonly taskRepo: DeliveryTaskRepository,
    private readonly orderRepo: OrderRepository,
    private readonly eventRepo: OrderEventRepository,
    private readonly shops: ShopsService,
    private readonly finance: FinanceService,
  ) {}

  async createOrGetTaskForOrder(orderId: string): Promise<DeliveryTaskResponseDto> {
    const existing = await this.taskRepo.findByOrderId(orderId);
    if (existing) {
      return toDeliveryTaskResponseDto(existing, true);
    }

    const order = await this.orderRepo.findByIdOrThrow(orderId);
    const shop = await this.shops.getShopById(order.shopId);
    const plainOtp = generateOtp(4);
    const otpHash = sha256(plainOtp);

    const task = await this.taskRepo.create({
      orderId: order._id,
      orderNumber: order.orderNumber,
      shopId: order.shopId,
      shopName: shop.name,
      customerId: order.customerId,
      status: DeliveryStatus.UNASSIGNED,
      pickupAddress: {
        text: shop.address.line1,
        pincode: shop.address.pincode,
        district: shop.address.district,
        label: 'Shop Counter',
      },
      deliveryAddress: {
        text: order.deliveryAddress.text,
        pincode: order.deliveryAddress.pincode,
        district: order.deliveryAddress.district,
        label: order.deliveryAddress.label,
      },
      codAmountPaise: order.totals.totalPaise,
      codCollected: false,
      otpHash,
      otpPlain: plainOtp,
    });

    return toDeliveryTaskResponseDto(task, true);
  }

  async assignPartner(taskId: string, dto: AssignDeliveryTaskDto): Promise<DeliveryTaskResponseDto> {
    const task = await this.taskRepo.findByIdOrThrow(taskId);

    if (task.status === DeliveryStatus.DELIVERED || task.status === DeliveryStatus.FAILED) {
      throw new AppException(ErrorCode.DELIVERY_INVALID_STATE, {
        message: 'Cannot assign a finished task',
      });
    }

    const updated = await this.taskRepo.updateByIdOrThrow(task._id, {
      partnerId: dto.partnerId,
      partnerName: dto.partnerName,
      partnerPhone: dto.partnerPhone,
      assignedAt: new Date(),
      status: DeliveryStatus.ASSIGNED,
    });

    return toDeliveryTaskResponseDto(updated, false);
  }

  async pickupOrder(taskId: string, partnerId: string): Promise<DeliveryTaskResponseDto> {
    const task = await this.taskRepo.findByIdOrThrow(taskId);

    if (task.partnerId && task.partnerId !== partnerId) {
      throw new AppException(ErrorCode.FORBIDDEN, {
        message: 'You are not the assigned courier for this pickup',
      });
    }

    const updated = await this.taskRepo.updateByIdOrThrow(task._id, {
      status: DeliveryStatus.PICKED_UP,
      pickedUpAt: new Date(),
    });

    const order = await this.orderRepo.findById(task.orderId);
    if (order && order.status === OrderStatus.READY) {
      await this.orderRepo.updateByIdOrThrow(order._id, {
        status: OrderStatus.OUT_FOR_DELIVERY,
      });

      await this.eventRepo.create({
        orderId: order._id,
        fromStatus: OrderStatus.READY,
        toStatus: OrderStatus.OUT_FOR_DELIVERY,
        actorId: partnerId,
        actorRole: Role.DELIVERY_PARTNER,
        reason: 'Order picked up from butcher counter, in transit',
      });
    }

    return toDeliveryTaskResponseDto(updated, false);
  }

  async verifyOtpAndDeliver(
    taskId: string,
    partnerId: string,
    dto: VerifyDeliveryOtpDto,
  ): Promise<DeliveryTaskResponseDto> {
    const task = await this.taskRepo.findByIdOrThrow(taskId);

    if (task.partnerId && task.partnerId !== partnerId) {
      throw new AppException(ErrorCode.FORBIDDEN, {
        message: 'You are not assigned to complete this delivery',
      });
    }

    const computedHash = sha256(dto.otp);
    if (!safeCompare(computedHash, task.otpHash)) {
      throw new AppException(ErrorCode.DELIVERY_OTP_INVALID, {
        message: 'Invalid 4-digit delivery OTP. Please verify with customer.',
      });
    }

    if (task.codAmountPaise > 0 && !dto.collectedCod) {
      throw new AppException(ErrorCode.BUSINESS_RULE_VIOLATION, {
        message: 'Cash on Delivery amount must be collected before completing delivery',
      });
    }

    const updated = await this.taskRepo.updateByIdOrThrow(task._id, {
      status: DeliveryStatus.DELIVERED,
      deliveredAt: new Date(),
      codCollected: true,
    });

    const order = await this.orderRepo.findById(task.orderId);
    if (order) {
      const payment = { ...order.payment };
      payment.status = PaymentStatus.COD_COLLECTED;
      payment.paidAt = new Date();

      await this.orderRepo.updateByIdOrThrow(order._id, {
        status: OrderStatus.DELIVERED,
        payment,
      });

      const totalAmountPaise =
        order.totals?.totalPaise ?? task.codAmountPaise;

      await this.finance.recordOrderDelivered({
        orderId: order._id,
        orderNumber: order.orderNumber,
        shopId: order.shopId,
        totalAmountPaise,
      });

      await this.eventRepo.create({
        orderId: order._id,
        fromStatus: order.status,
        toStatus: OrderStatus.DELIVERED,
        actorId: partnerId,
        actorRole: Role.DELIVERY_PARTNER,
        reason: `Delivered with verified OTP. COD collected: ₹${(task.codAmountPaise / 100).toFixed(0)}`,
      });
    }

    return toDeliveryTaskResponseDto(updated, false);
  }

  async getTasks(query: QueryDeliveryTasksDto): Promise<PaginatedResult<DeliveryTaskResponseDto>> {
    const paginated = await this.taskRepo.findTasks(query, {
      status: query.status,
      partnerId: query.partnerId,
      shopId: query.shopId,
      date: query.date,
    });
    return paginated.map((t: DeliveryTask) => toDeliveryTaskResponseDto(t, false));
  }

  async getTaskById(taskId: string): Promise<DeliveryTaskResponseDto> {
    const task = await this.taskRepo.findByIdOrThrow(taskId);
    return toDeliveryTaskResponseDto(task, true);
  }

  async getCustomerTaskByOrderId(orderId: string, customerId: string): Promise<DeliveryTaskResponseDto> {
    let task = await this.taskRepo.findByOrderId(orderId);
    if (!task) {
      const order = await this.orderRepo.findByIdOrThrow(orderId);
      if (order.customerId !== customerId) {
        throw new NotFoundAppException('DeliveryTask', orderId);
      }
      return this.createOrGetTaskForOrder(orderId);
    }
    if (task.customerId !== customerId) {
      throw new NotFoundAppException('DeliveryTask', orderId);
    }
    return toDeliveryTaskResponseDto(task, true);
  }
}
