import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DeliveryStatus } from '#common/enums';
import { DeliveryEarningsService } from './delivery-earnings.service.js';
import type { DeliveryTaskRepository } from '../repositories/delivery-task.repository.js';

describe('DeliveryEarningsService', () => {
  let service: DeliveryEarningsService;
  let taskRepo: Partial<Record<keyof DeliveryTaskRepository, ReturnType<typeof vi.fn>>>;

  beforeEach(() => {
    taskRepo = {
      findPartnerDeliveredTasks: vi.fn(),
    };
    service = new DeliveryEarningsService(taskRepo as unknown as DeliveryTaskRepository);
  });

  it('calculates total trips, earnings, and cash in hand accurately', async () => {
    const today = new Date();
    taskRepo.findPartnerDeliveredTasks!.mockResolvedValue([
      {
        _id: 'task-1',
        orderId: 'order-1',
        orderNumber: 'TN-001',
        shopId: 'shop-1',
        shopName: 'Shop A',
        customerId: 'cust-1',
        partnerId: 'partner-1',
        partnerName: 'Selvam',
        partnerPhone: '+919842188888',
        status: DeliveryStatus.DELIVERED,
        pickupAddress: { text: 'Shop', pincode: '600001', district: 'Chennai', label: 'Shop' },
        deliveryAddress: { text: 'Home', pincode: '600001', district: 'Chennai', label: 'Home' },
        codAmountPaise: 50000,
        codCollected: true,
        deliveredAt: today,
        createdAt: today,
        updatedAt: today,
      },
      {
        _id: 'task-2',
        orderId: 'order-2',
        orderNumber: 'TN-002',
        shopId: 'shop-1',
        shopName: 'Shop A',
        customerId: 'cust-2',
        partnerId: 'partner-1',
        partnerName: 'Selvam',
        partnerPhone: '+919842188888',
        status: DeliveryStatus.DELIVERED,
        pickupAddress: { text: 'Shop', pincode: '600001', district: 'Chennai', label: 'Shop' },
        deliveryAddress: { text: 'Home', pincode: '600001', district: 'Chennai', label: 'Home' },
        codAmountPaise: 30000,
        codCollected: true,
        deliveredAt: today,
        createdAt: today,
        updatedAt: today,
      },
    ] as never);

    const result = await service.getPartnerEarnings('partner-1');

    expect(result.completedTripsCount).toBe(2);
    expect(result.totalEarningsPaise).toBe(8000); // 2 * 4000
    expect(result.cashInHandPaise).toBe(80000); // 50000 + 30000
    expect(result.todayTripsCount).toBe(2);
    expect(result.todayEarningsPaise).toBe(8000);
    expect(result.todayCashInHandPaise).toBe(80000);
    expect(result.recentTrips).toHaveLength(2);
  });
});
