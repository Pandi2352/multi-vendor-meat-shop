import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DeliveryStatus, OrderStatus, PaymentMethod, PaymentStatus, Role } from '#common/enums';
import { AppException, ErrorCode } from '#common/exceptions';
import { sha256 } from '#common/utils';
import { DeliveryTasksService } from './delivery-tasks.service.js';
import type { DeliveryTaskRepository } from '../repositories/delivery-task.repository.js';
import type { OrderRepository, OrderEventRepository } from '#modules/orders';

describe('DeliveryTasksService', () => {
  let service: DeliveryTasksService;
  let taskRepo: Partial<Record<keyof DeliveryTaskRepository, ReturnType<typeof vi.fn>>>;
  let orderRepo: Partial<Record<keyof OrderRepository, ReturnType<typeof vi.fn>>>;
  let eventRepo: Partial<Record<keyof OrderEventRepository, ReturnType<typeof vi.fn>>>;

  const mockOrder = {
    _id: 'order-123',
    orderNumber: 'TN-20261023-0001',
    customerId: 'cust-123',
    shopId: 'shop-123',
    shopName: 'Madurai Fresh Mutton Stall',
    status: OrderStatus.READY,
    payment: { method: PaymentMethod.COD, status: PaymentStatus.COD_PENDING },
    totals: { totalPaise: 42500 },
    deliveryAddress: { text: '12 Gandhi Rd', pincode: '600017', district: 'Chennai', label: 'Home' },
  };

  beforeEach(() => {
    taskRepo = {
      findByOrderId: vi.fn(),
      findById: vi.fn(),
      findByIdOrThrow: vi.fn(),
      create: vi.fn(),
      updateByIdOrThrow: vi.fn(),
      findTasks: vi.fn(),
    };
    orderRepo = {
      findById: vi.fn(),
      findByIdOrThrow: vi.fn(),
      updateByIdOrThrow: vi.fn(),
    };
    eventRepo = {
      create: vi.fn(),
    };
    const shops = {
      getShopById: vi.fn().mockResolvedValue({
        name: 'Madurai Fresh Mutton Stall',
        address: { line1: '45 Anna Salai', pincode: '600017', district: 'Chennai' },
      }),
    };

    service = new DeliveryTasksService(
      taskRepo as unknown as DeliveryTaskRepository,
      orderRepo as unknown as OrderRepository,
      eventRepo as unknown as OrderEventRepository,
      shops as never,
    );
  });

  it('creates task with 4-digit OTP and hashed proof for ready order', async () => {
    taskRepo.findByOrderId!.mockResolvedValue(null);
    orderRepo.findByIdOrThrow!.mockResolvedValue(mockOrder as never);

    taskRepo.create!.mockImplementation(async (data) => ({
      _id: 'task-123',
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const result = await service.createOrGetTaskForOrder('order-123');

    expect(result.orderNumber).toBe('TN-20261023-0001');
    expect(result.codAmountPaise).toBe(42500);
    expect(result.otpPlain).toHaveLength(4);
    expect(taskRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: 'order-123',
        status: DeliveryStatus.UNASSIGNED,
      }),
    );
  });

  it('assigns delivery partner to task', async () => {
    const existingTask = {
      _id: 'task-123',
      orderId: 'order-123',
      orderNumber: 'TN-20261023-0001',
      shopId: 'shop-123',
      shopName: 'Shop',
      customerId: 'cust-123',
      status: DeliveryStatus.UNASSIGNED,
      pickupAddress: { text: 'Shop', pincode: '600017', district: 'Chennai' },
      deliveryAddress: { text: '12 Gandhi Rd', pincode: '600017', district: 'Chennai' },
      codAmountPaise: 42500,
      codCollected: false,
      otpHash: sha256('1234'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    taskRepo.findByIdOrThrow!.mockResolvedValue(existingTask as never);
    taskRepo.updateByIdOrThrow!.mockImplementation(async (_id, data) => ({
      ...existingTask,
      ...data,
    }));

    const result = await service.assignPartner('task-123', {
      partnerId: 'partner-123',
      partnerName: 'Karthik',
      partnerPhone: '+919876543210',
    });

    expect(result.status).toBe(DeliveryStatus.ASSIGNED);
    expect(result.partnerName).toBe('Karthik');
  });

  it('transitions order to OUT_FOR_DELIVERY when partner picks up from shop', async () => {
    const task = {
      _id: 'task-123',
      orderId: 'order-123',
      orderNumber: 'TN-20261023-0001',
      shopId: 'shop-123',
      shopName: 'Shop',
      customerId: 'cust-123',
      partnerId: 'partner-123',
      status: DeliveryStatus.ASSIGNED,
      pickupAddress: { text: 'Shop', pincode: '600017', district: 'Chennai' },
      deliveryAddress: { text: '12 Gandhi Rd', pincode: '600017', district: 'Chennai' },
      codAmountPaise: 42500,
      codCollected: false,
      otpHash: sha256('1234'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    taskRepo.findByIdOrThrow!.mockResolvedValue(task as never);
    taskRepo.updateByIdOrThrow!.mockImplementation(async (_id, data) => ({ ...task, ...data }));
    orderRepo.findById!.mockResolvedValue(mockOrder as never);

    await service.pickupOrder('task-123', 'partner-123');

    expect(orderRepo.updateByIdOrThrow).toHaveBeenCalledWith(
      'order-123',
      expect.objectContaining({ status: OrderStatus.OUT_FOR_DELIVERY }),
    );
  });

  it('verifies 4-digit OTP, confirms COD collection, and marks order DELIVERED', async () => {
    const otp = '5678';
    const task = {
      _id: 'task-123',
      orderId: 'order-123',
      orderNumber: 'TN-20261023-0001',
      shopId: 'shop-123',
      shopName: 'Shop',
      customerId: 'cust-123',
      partnerId: 'partner-123',
      status: DeliveryStatus.PICKED_UP,
      pickupAddress: { text: 'Shop', pincode: '600017', district: 'Chennai' },
      deliveryAddress: { text: '12 Gandhi Rd', pincode: '600017', district: 'Chennai' },
      codAmountPaise: 42500,
      codCollected: false,
      otpHash: sha256(otp),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    taskRepo.findByIdOrThrow!.mockResolvedValue(task as never);
    taskRepo.updateByIdOrThrow!.mockImplementation(async (_id, data) => ({ ...task, ...data }));
    orderRepo.findById!.mockResolvedValue({ ...mockOrder, status: OrderStatus.OUT_FOR_DELIVERY } as never);

    await service.verifyOtpAndDeliver('task-123', 'partner-123', {
      otp: '5678',
      collectedCod: true,
    });

    expect(orderRepo.updateByIdOrThrow).toHaveBeenCalledWith(
      'order-123',
      expect.objectContaining({
        status: OrderStatus.DELIVERED,
        payment: expect.objectContaining({ status: PaymentStatus.COD_COLLECTED }),
      }),
    );
  });

  it('throws error when OTP is incorrect', async () => {
    const task = {
      _id: 'task-123',
      partnerId: 'partner-123',
      status: DeliveryStatus.PICKED_UP,
      otpHash: sha256('5678'),
    };

    taskRepo.findByIdOrThrow!.mockResolvedValue(task as never);

    await expect(
      service.verifyOtpAndDeliver('task-123', 'partner-123', { otp: '0000', collectedCod: true }),
    ).rejects.toThrow(AppException);
  });
});
