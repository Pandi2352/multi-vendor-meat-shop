import { Injectable } from '@nestjs/common';
import { AppException, ErrorCode, ForbiddenAppException } from '#common/exceptions';
import { InventoryMovementType, OrderStatus, PaymentMethod, PaymentStatus, Role, ShopStatus } from '#common/enums';
import { generateId } from '#common/utils';
import { PaginatedResult } from '#common/dto';
import { CartService } from '#modules/cart';
import { CouponsService } from '#modules/coupons';
import { InventoryService } from '#modules/inventory';
import { ShopsService } from '#modules/shops';
import { OrderRepository } from '../repositories/order.repository.js';
import { OrderEventRepository } from '../repositories/order-event.repository.js';
import { OrderNumberService } from './order-number.service.js';
import { type OrderItem } from '../schemas/order.schema.js';
import { CANCELLABLE_STATUSES, ORDER_STATUS_MACHINE } from '../constants/order.constants.js';
import { CreateOrderDto } from '../dto/create-order.dto.js';
import { CancelOrderDto } from '../dto/cancel-order.dto.js';
import { QueryCustomerOrdersDto } from '../dto/query-orders.dto.js';
import { OrderResponseDto } from '../dto/order-response.dto.js';
import { ReorderResponseDto } from '../dto/reorder-response.dto.js';
import { toOrderResponseDto } from '../mappers/order.mapper.js';

@Injectable()
export class OrdersService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly eventRepo: OrderEventRepository,
    private readonly orderNumberService: OrderNumberService,
    private readonly cartService: CartService,
    private readonly coupons: CouponsService,
    private readonly inventory: InventoryService,
    private readonly shops: ShopsService,
  ) {}

  async createOrder(customerId: string, dto: CreateOrderDto): Promise<OrderResponseDto> {
    const quote = await this.cartService.getCheckoutQuote(customerId, {
      lat: dto.deliveryAddress.location.lat,
      lng: dto.deliveryAddress.location.lng,
      couponCode: dto.couponCode,
    });

    const orderId = generateId();
    const orderNumber = await this.orderNumberService.generateNextOrderNumber();

    // Commit fresh daily inventory deduction atomically for each item in the order
    for (const item of quote.items) {
      await this.inventory.commitStock(
        quote.shopId,
        item.productId,
        item.grams * item.quantity,
        orderId,
        customerId,
      );
    }

    const orderItems: OrderItem[] = quote.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      grams: item.grams,
      quantity: item.quantity,
      cutType: item.cutType,
      preparation: item.preparation,
      pricePerKgPaise: item.pricePerKgPaise,
      lineTotalPaise: item.lineTotalPaise,
      notes: item.notes,
    }));

    const isCod = dto.paymentMethod === PaymentMethod.COD;
    const initialStatus = isCod ? OrderStatus.PLACED : OrderStatus.PENDING_PAYMENT;
    const initialPaymentStatus = isCod ? PaymentStatus.COD_PENDING : PaymentStatus.PENDING;

    const order = await this.orderRepo.create({
      _id: orderId,
      orderNumber,
      customerId,
      shopId: quote.shopId,
      items: orderItems,
      totals: {
        subtotalPaise: quote.subtotalPaise,
        deliveryFeePaise: quote.deliveryFeePaise,
        packagingFeePaise: quote.packagingFeePaise,
        discountPaise: quote.discountPaise,
        totalPaise: quote.totalPaise,
        totalWeightGrams: quote.totalWeightGrams,
      },
      deliveryAddress: {
        text: dto.deliveryAddress.text,
        pincode: dto.deliveryAddress.pincode,
        district: dto.deliveryAddress.district,
        location: { lat: dto.deliveryAddress.location.lat, lng: dto.deliveryAddress.location.lng },
        label: dto.deliveryAddress.label,
      },
      customerNotes: dto.customerNotes,
      status: initialStatus,
      payment: { method: dto.paymentMethod, status: initialPaymentStatus },
      slot: dto.slot,
      couponCode: quote.couponCode,
    });

    if (quote.couponCode) {
      await this.coupons.recordCouponUsage(quote.couponCode, customerId);
    }

    const event = await this.eventRepo.create({
      orderId: order._id,
      fromStatus: initialStatus,
      toStatus: initialStatus,
      actorId: customerId,
      actorRole: Role.CUSTOMER,
      reason: isCod ? 'Order placed with Cash on Delivery' : 'Order created, pending payment',
    });

    await this.cartService.clearCart(customerId);

    return toOrderResponseDto(order, [event], quote.shopName);
  }

  async getCustomerOrders(
    customerId: string,
    query: QueryCustomerOrdersDto,
  ): Promise<PaginatedResult<OrderResponseDto>> {
    const paginated = await this.orderRepo.findCustomerOrders(customerId, query, query.status);
    return paginated.map((o) => toOrderResponseDto(o));
  }

  async getCustomerOrder(customerId: string, orderId: string): Promise<OrderResponseDto> {
    const order = await this.orderRepo.findByIdOrThrow(orderId);
    if (order.customerId !== customerId) {
      throw new ForbiddenAppException('You do not have access to this order');
    }
    const events = await this.eventRepo.findByOrderId(order._id);
    const shop = await this.shops.getShopById(order.shopId);
    return toOrderResponseDto(order, events, shop.name);
  }

  async cancelCustomerOrder(
    customerId: string,
    orderId: string,
    dto: CancelOrderDto,
  ): Promise<OrderResponseDto> {
    const order = await this.orderRepo.findByIdOrThrow(orderId);
    if (order.customerId !== customerId) {
      throw new ForbiddenAppException('You do not have access to this order');
    }

    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      throw new AppException(ErrorCode.ORDER_NOT_CANCELLABLE, {
        message: `Order cannot be cancelled once it is ${order.status.toLowerCase()}`,
      });
    }

    ORDER_STATUS_MACHINE.assertTransition(order.status, OrderStatus.CANCELLED, Role.CUSTOMER);
    const prevStatus = order.status;

    // Return committed stock back to shop available daily stock
    for (const item of order.items) {
      await this.inventory.adjustStock(order.shopId, customerId, {
        productId: item.productId,
        grams: item.grams * item.quantity,
        type: InventoryMovementType.RETURNED,
        notes: `Restocked from cancelled order ${order.orderNumber}`,
      });
    }

    const updated = await this.orderRepo.updateByIdOrThrow(order._id, {
      status: OrderStatus.CANCELLED,
      cancelReason: dto.reason || 'Cancelled by customer',
    });

    await this.eventRepo.create({
      orderId: order._id,
      fromStatus: prevStatus,
      toStatus: OrderStatus.CANCELLED,
      actorId: customerId,
      actorRole: Role.CUSTOMER,
      reason: dto.reason,
    });

    const events = await this.eventRepo.findByOrderId(order._id);
    return toOrderResponseDto(updated, events);
  }

  async reorderCustomerOrder(
    customerId: string,
    orderId: string,
  ): Promise<ReorderResponseDto> {
    const order = await this.orderRepo.findByIdOrThrow(orderId);
    if (order.customerId !== customerId) {
      throw new ForbiddenAppException('You do not have access to this order');
    }

    const shop = await this.shops.getShopById(order.shopId);
    if (shop.status !== ShopStatus.OPEN) {
      throw new AppException(ErrorCode.SHOP_CLOSED, {
        message: `${shop.name} is currently closed`,
      });
    }

    // Clear cart first so we can cleanly populate with reorder items
    await this.cartService.clearCart(customerId);

    let itemsAdded = 0;
    const skippedItems: Array<{ productName: string; reason: string }> = [];

    for (const item of order.items) {
      try {
        await this.cartService.addItem(customerId, {
          shopId: order.shopId,
          productId: item.productId,
          grams: item.grams,
          quantity: item.quantity,
          cutType: item.cutType,
          preparation: item.preparation,
          notes: item.notes,
          clearPreviousShop: true,
        });
        itemsAdded++;
      } catch (err: unknown) {
        const message = err instanceof AppException ? err.message : 'Item unavailable';
        skippedItems.push({
          productName: item.name,
          reason: message,
        });
      }
    }

    if (itemsAdded === 0) {
      throw new AppException(ErrorCode.OUT_OF_STOCK, {
        message: 'None of the items from this order are available today',
        details: { skippedItems },
      });
    }

    const cart = await this.cartService.getCart(customerId);

    return {
      success: true,
      shopId: order.shopId,
      shopName: shop.name,
      itemsAdded,
      skippedItems,
      cart,
    };
  }
}
