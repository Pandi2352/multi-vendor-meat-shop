import { Injectable } from '@nestjs/common';
import { ForbiddenAppException } from '#common/exceptions';
import { InventoryMovementType, OrderStatus, PaymentMethod, PaymentStatus, Role } from '#common/enums';
import { PaginatedResult } from '#common/dto';
import { InventoryService } from '#modules/inventory';
import { ShopsService } from '#modules/shops';
import { OrderRepository } from '../repositories/order.repository.js';
import { OrderEventRepository } from '../repositories/order-event.repository.js';
import { ORDER_STATUS_MACHINE } from '../constants/order.constants.js';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto.js';
import { QueryAdminOrdersDto, QueryVendorOrdersDto } from '../dto/query-orders.dto.js';
import { OrderResponseDto } from '../dto/order-response.dto.js';
import { toOrderResponseDto } from '../mappers/order.mapper.js';

@Injectable()
export class OrderFulfilmentService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly eventRepo: OrderEventRepository,
    private readonly inventory: InventoryService,
    private readonly shops: ShopsService,
  ) {}

  async getVendorOrders(
    shopId: string,
    query: QueryVendorOrdersDto,
  ): Promise<PaginatedResult<OrderResponseDto>> {
    const paginated = await this.orderRepo.findShopOrders(shopId, query, query.status, query.date);
    return paginated.map((o) => toOrderResponseDto(o));
  }

  async getVendorOrder(shopId: string, orderId: string): Promise<OrderResponseDto> {
    const order = await this.orderRepo.findByIdOrThrow(orderId);
    if (order.shopId !== shopId) {
      throw new ForbiddenAppException('Order does not belong to your shop');
    }
    const events = await this.eventRepo.findByOrderId(order._id);
    return toOrderResponseDto(order, events);
  }

  async updateVendorOrderStatus(
    shopId: string,
    vendorUserId: string,
    vendorRole: Role,
    orderId: string,
    dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    const order = await this.orderRepo.findByIdOrThrow(orderId);
    if (order.shopId !== shopId) {
      throw new ForbiddenAppException('Order does not belong to your shop');
    }

    ORDER_STATUS_MACHINE.assertTransition(order.status, dto.status, vendorRole);
    const prevStatus = order.status;

    if (dto.status === OrderStatus.REJECTED) {
      for (const item of order.items) {
        await this.inventory.adjustStock(order.shopId, vendorUserId, {
          productId: item.productId,
          grams: item.grams * item.quantity,
          type: InventoryMovementType.RETURNED,
          notes: `Restocked from rejected order ${order.orderNumber}`,
        });
      }
    }

    const items = [...order.items];
    if (dto.actualPackedWeights) {
      for (const item of items) {
        if (dto.actualPackedWeights[item.productId] !== undefined) {
          item.actualPackedGrams = dto.actualPackedWeights[item.productId];
        }
      }
    }

    const paymentUpdate = { ...order.payment };
    if (dto.status === OrderStatus.DELIVERED && order.payment.method === PaymentMethod.COD) {
      paymentUpdate.status = PaymentStatus.COD_COLLECTED;
      paymentUpdate.paidAt = new Date();
    }

    const updated = await this.orderRepo.updateByIdOrThrow(order._id, {
      status: dto.status,
      items,
      payment: paymentUpdate,
      rejectReason: dto.status === OrderStatus.REJECTED ? dto.reason : order.rejectReason,
    });

    await this.eventRepo.create({
      orderId: order._id,
      fromStatus: prevStatus,
      toStatus: dto.status,
      actorId: vendorUserId,
      actorRole: vendorRole,
      reason: dto.reason,
    });

    const events = await this.eventRepo.findByOrderId(order._id);
    return toOrderResponseDto(updated, events);
  }

  async getAdminOrders(query: QueryAdminOrdersDto): Promise<PaginatedResult<OrderResponseDto>> {
    const paginated = await this.orderRepo.findAdminOrders(query, {
      shopId: query.shopId,
      customerId: query.customerId,
      status: query.status,
      date: query.date,
    });
    return paginated.map((o) => toOrderResponseDto(o));
  }

  async getAdminOrder(orderId: string): Promise<OrderResponseDto> {
    const order = await this.orderRepo.findByIdOrThrow(orderId);
    const events = await this.eventRepo.findByOrderId(order._id);
    const shop = await this.shops.getShopById(order.shopId);
    return toOrderResponseDto(order, events, shop.name);
  }

  async updateAdminOrderStatus(
    adminUserId: string,
    adminRole: Role,
    orderId: string,
    dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    const order = await this.orderRepo.findByIdOrThrow(orderId);
    ORDER_STATUS_MACHINE.assertTransition(order.status, dto.status, adminRole);
    const prevStatus = order.status;

    if (dto.status === OrderStatus.CANCELLED || dto.status === OrderStatus.REJECTED) {
      for (const item of order.items) {
        await this.inventory.adjustStock(order.shopId, adminUserId, {
          productId: item.productId,
          grams: item.grams * item.quantity,
          type: InventoryMovementType.RETURNED,
          notes: `Restocked by admin from order ${order.orderNumber}`,
        });
      }
    }

    const updated = await this.orderRepo.updateByIdOrThrow(order._id, {
      status: dto.status,
      cancelReason: dto.status === OrderStatus.CANCELLED ? dto.reason : order.cancelReason,
      rejectReason: dto.status === OrderStatus.REJECTED ? dto.reason : order.rejectReason,
    });

    await this.eventRepo.create({
      orderId: order._id,
      fromStatus: prevStatus,
      toStatus: dto.status,
      actorId: adminUserId,
      actorRole: adminRole,
      reason: dto.reason,
    });

    const events = await this.eventRepo.findByOrderId(order._id);
    return toOrderResponseDto(updated, events);
  }
}
