import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrdersService } from './orders.service.js';
import { OrderFulfilmentService } from './order-fulfilment.service.js';
import type { OrderRepository } from '../repositories/order.repository.js';
import type { OrderEventRepository } from '../repositories/order-event.repository.js';
import type { OrderNumberService } from './order-number.service.js';
import type { CartService } from '#modules/cart';
import type { CouponsService } from '#modules/coupons';
import type { InventoryService } from '#modules/inventory';
import type { ShopsService } from '#modules/shops';
import { AppException, ErrorCode } from '#common/exceptions';
import { InventoryMovementType, OrderStatus, PaymentMethod, PaymentStatus, Role } from '#common/enums';
import type { Order } from '../schemas/order.schema.js';

describe('OrdersModule Services', () => {
  let ordersService: OrdersService;
  let fulfilmentService: OrderFulfilmentService;
  let mockOrderRepo: Record<string, ReturnType<typeof vi.fn>>;
  let mockEventRepo: Record<string, ReturnType<typeof vi.fn>>;
  let mockOrderNumberService: Record<string, ReturnType<typeof vi.fn>>;
  let mockCartService: Record<string, ReturnType<typeof vi.fn>>;
  let mockCoupons: Record<string, ReturnType<typeof vi.fn>>;
  let mockInventory: Record<string, ReturnType<typeof vi.fn>>;
  let mockShops: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    mockOrderRepo = {
      create: vi.fn(),
      findByIdOrThrow: vi.fn(),
      updateByIdOrThrow: vi.fn(),
      findCustomerOrders: vi.fn(),
      findShopOrders: vi.fn(),
      findAdminOrders: vi.fn(),
    };

    mockEventRepo = {
      create: vi.fn(),
      findByOrderId: vi.fn(),
    };

    mockOrderNumberService = {
      generateNextOrderNumber: vi.fn(),
    };

    mockCartService = {
      getCheckoutQuote: vi.fn(),
      clearCart: vi.fn(),
    };

    mockCoupons = {
      recordCouponUsage: vi.fn(),
      validateAndCalculateDiscount: vi.fn(),
    };

    mockInventory = {
      commitStock: vi.fn(),
      adjustStock: vi.fn(),
    };

    mockShops = {
      getShopById: vi.fn(),
    };

    ordersService = new OrdersService(
      mockOrderRepo as unknown as OrderRepository,
      mockEventRepo as unknown as OrderEventRepository,
      mockOrderNumberService as unknown as OrderNumberService,
      mockCartService as unknown as CartService,
      mockCoupons as unknown as CouponsService,
      mockInventory as unknown as InventoryService,
      mockShops as unknown as ShopsService,
    );

    fulfilmentService = new OrderFulfilmentService(
      mockOrderRepo as unknown as OrderRepository,
      mockEventRepo as unknown as OrderEventRepository,
      mockInventory as unknown as InventoryService,
      mockShops as unknown as ShopsService,
    );
  });

  describe('OrdersService.createOrder', () => {
    it('creates an order, commits inventory, generates order number, and clears cart', async () => {
      mockCartService.getCheckoutQuote.mockResolvedValue({
        shopId: 'shop-1',
        shopName: 'Murugan Meat Shop',
        items: [
          {
            productId: 'prod-1',
            name: 'Broiler Chicken',
            grams: 500,
            quantity: 2,
            pricePerKgPaise: 24000,
            lineTotalPaise: 24000,
          },
        ],
        subtotalPaise: 24000,
        deliveryFeePaise: 3000,
        packagingFeePaise: 1500,
        discountPaise: 0,
        totalPaise: 28500,
        totalWeightGrams: 1000,
      });

      mockOrderNumberService.generateNextOrderNumber.mockResolvedValue('TN-20261023-0001');

      const createdOrder: Order = {
        _id: 'ord-1',
        orderNumber: 'TN-20261023-0001',
        customerId: 'cust-1',
        shopId: 'shop-1',
        items: [
          {
            productId: 'prod-1',
            name: 'Broiler Chicken',
            grams: 500,
            quantity: 2,
            pricePerKgPaise: 24000,
            lineTotalPaise: 24000,
          },
        ],
        totals: {
          subtotalPaise: 24000,
          deliveryFeePaise: 3000,
          packagingFeePaise: 1500,
          discountPaise: 0,
          totalPaise: 28500,
          totalWeightGrams: 1000,
        },
        deliveryAddress: {
          text: '12 Gandhi Street, T. Nagar',
          pincode: '600017',
          district: 'Chennai',
          location: { lat: 13.04, lng: 80.23 },
        },
        status: OrderStatus.PLACED,
        payment: {
          method: PaymentMethod.COD,
          status: PaymentStatus.COD_PENDING,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrderRepo.create.mockResolvedValue(createdOrder);
      mockEventRepo.create.mockResolvedValue({
        _id: 'ev-1',
        orderId: 'ord-1',
        fromStatus: OrderStatus.PLACED,
        toStatus: OrderStatus.PLACED,
        actorId: 'cust-1',
        actorRole: Role.CUSTOMER,
        createdAt: new Date(),
      });

      const res = await ordersService.createOrder('cust-1', {
        deliveryAddress: {
          text: '12 Gandhi Street, T. Nagar',
          pincode: '600017',
          district: 'Chennai',
          location: { lat: 13.04, lng: 80.23 },
        },
        paymentMethod: PaymentMethod.COD,
      });

      expect(mockInventory.commitStock).toHaveBeenCalledWith(
        'shop-1',
        'prod-1',
        1000, // 500g * 2
        expect.any(String),
        'cust-1',
      );
      expect(mockOrderNumberService.generateNextOrderNumber).toHaveBeenCalled();
      expect(mockCartService.clearCart).toHaveBeenCalledWith('cust-1');
      expect(res.orderNumber).toBe('TN-20261023-0001');
      expect(res.status).toBe(OrderStatus.PLACED);
      expect(res.payment.status).toBe(PaymentStatus.COD_PENDING);
    });
  });

  describe('OrdersService.cancelCustomerOrder', () => {
    it('restocks inventory when order is cancelled in PLACED status', async () => {
      const order: Order = {
        _id: 'ord-1',
        orderNumber: 'TN-20261023-0001',
        customerId: 'cust-1',
        shopId: 'shop-1',
        items: [
          {
            productId: 'prod-1',
            name: 'Broiler Chicken',
            grams: 500,
            quantity: 2,
            pricePerKgPaise: 24000,
            lineTotalPaise: 24000,
          },
        ],
        totals: {
          subtotalPaise: 24000,
          deliveryFeePaise: 3000,
          packagingFeePaise: 1500,
          discountPaise: 0,
          totalPaise: 28500,
          totalWeightGrams: 1000,
        },
        deliveryAddress: {
          text: '12 Gandhi Street',
          pincode: '600017',
          district: 'Chennai',
          location: { lat: 13.04, lng: 80.23 },
        },
        status: OrderStatus.PLACED,
        payment: { method: PaymentMethod.COD, status: PaymentStatus.COD_PENDING },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrderRepo.findByIdOrThrow.mockResolvedValue(order);
      mockOrderRepo.updateByIdOrThrow.mockResolvedValue({
        ...order,
        status: OrderStatus.CANCELLED,
        cancelReason: 'Plans changed',
      });
      mockEventRepo.findByOrderId.mockResolvedValue([]);

      const result = await ordersService.cancelCustomerOrder('cust-1', 'ord-1', {
        reason: 'Plans changed',
      });

      expect(mockInventory.adjustStock).toHaveBeenCalledWith(
        'shop-1',
        'cust-1',
        expect.objectContaining({
          productId: 'prod-1',
          grams: 1000,
          type: InventoryMovementType.RETURNED,
        }),
      );
      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('rejects cancellation when order is already ACCEPTED by vendor', async () => {
      mockOrderRepo.findByIdOrThrow.mockResolvedValue({
        _id: 'ord-1',
        customerId: 'cust-1',
        status: OrderStatus.ACCEPTED,
        items: [],
      });

      await expect(
        ordersService.cancelCustomerOrder('cust-1', 'ord-1', { reason: 'Too late' }),
      ).rejects.toThrow(AppException);
    });
  });

  describe('OrderFulfilmentService.updateVendorOrderStatus', () => {
    it('vendor accepts order and then updates actual packed weight', async () => {
      const order: Order = {
        _id: 'ord-1',
        orderNumber: 'TN-20261023-0001',
        customerId: 'cust-1',
        shopId: 'shop-1',
        items: [
          {
            productId: 'prod-1',
            name: 'Mutton Curry Cut',
            grams: 500,
            quantity: 1,
            pricePerKgPaise: 80000,
            lineTotalPaise: 40000,
          },
        ],
        totals: {
          subtotalPaise: 40000,
          deliveryFeePaise: 0,
          packagingFeePaise: 1500,
          discountPaise: 0,
          totalPaise: 41500,
          totalWeightGrams: 500,
        },
        deliveryAddress: {
          text: '12 Gandhi Street',
          pincode: '600017',
          district: 'Chennai',
          location: { lat: 13.04, lng: 80.23 },
        },
        status: OrderStatus.PLACED,
        payment: { method: PaymentMethod.COD, status: PaymentStatus.COD_PENDING },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrderRepo.findByIdOrThrow.mockResolvedValue(order);
      mockOrderRepo.updateByIdOrThrow.mockResolvedValue({
        ...order,
        status: OrderStatus.ACCEPTED,
      });
      mockEventRepo.findByOrderId.mockResolvedValue([]);

      const accepted = await fulfilmentService.updateVendorOrderStatus(
        'shop-1',
        'vendor-user-1',
        Role.VENDOR_OWNER,
        'ord-1',
        { status: OrderStatus.ACCEPTED },
      );

      expect(accepted.status).toBe(OrderStatus.ACCEPTED);
      expect(mockEventRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'ord-1',
          fromStatus: OrderStatus.PLACED,
          toStatus: OrderStatus.ACCEPTED,
          actorRole: Role.VENDOR_OWNER,
        }),
      );
    });

    it('vendor rejection releases inventory stock back to shop', async () => {
      const order: Order = {
        _id: 'ord-1',
        orderNumber: 'TN-20261023-0001',
        customerId: 'cust-1',
        shopId: 'shop-1',
        items: [
          {
            productId: 'prod-1',
            name: 'Mutton Curry Cut',
            grams: 500,
            quantity: 1,
            pricePerKgPaise: 80000,
            lineTotalPaise: 40000,
          },
        ],
        totals: {
          subtotalPaise: 40000,
          deliveryFeePaise: 0,
          packagingFeePaise: 1500,
          discountPaise: 0,
          totalPaise: 41500,
          totalWeightGrams: 500,
        },
        deliveryAddress: {
          text: '12 Gandhi Street',
          pincode: '600017',
          district: 'Chennai',
          location: { lat: 13.04, lng: 80.23 },
        },
        status: OrderStatus.PLACED,
        payment: { method: PaymentMethod.COD, status: PaymentStatus.COD_PENDING },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOrderRepo.findByIdOrThrow.mockResolvedValue(order);
      mockOrderRepo.updateByIdOrThrow.mockResolvedValue({
        ...order,
        status: OrderStatus.REJECTED,
        rejectReason: 'Out of fresh stock',
      });
      mockEventRepo.findByOrderId.mockResolvedValue([]);

      await fulfilmentService.updateVendorOrderStatus(
        'shop-1',
        'vendor-user-1',
        Role.VENDOR_OWNER,
        'ord-1',
        { status: OrderStatus.REJECTED, reason: 'Out of fresh stock' },
      );

      expect(mockInventory.adjustStock).toHaveBeenCalledWith(
        'shop-1',
        'vendor-user-1',
        expect.objectContaining({
          productId: 'prod-1',
          grams: 500,
          type: InventoryMovementType.RETURNED,
        }),
      );
    });
  });
});
