import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DisputesService } from './disputes.service.js';
import type { DisputeRepository } from '../repositories/dispute.repository.js';
import type { OrderRepository } from '#modules/orders';
import type { FinanceService } from '#modules/finance';
import type { UserRepository } from '#modules/users';
import { DisputeReason, DisputeStatus, OrderStatus } from '#common/enums';
import { AppException, ForbiddenAppException } from '#common/exceptions';

describe('DisputesService', () => {
  let service: DisputesService;
  let mockDisputeRepo: Record<string, ReturnType<typeof vi.fn>>;
  let mockOrderRepo: Record<string, ReturnType<typeof vi.fn>>;
  let mockFinance: Record<string, ReturnType<typeof vi.fn>>;
  let mockUserRepo: Record<string, ReturnType<typeof vi.fn>>;

  const mockOrder = {
    _id: '018f0000-0000-7000-8000-000000000001',
    orderNumber: 'ORD-20261026-0001',
    customerId: 'cust-123',
    shopId: 'shop-456',
    status: OrderStatus.DELIVERED,
    deliveryAddress: { label: 'Home' },
  };

  const mockDispute = {
    _id: '018f0000-0000-7000-8000-000000000002',
    ticketNumber: 'TKT-20261026-0001',
    orderId: '018f0000-0000-7000-8000-000000000001',
    orderNumber: 'ORD-20261026-0001',
    shopId: 'shop-456',
    customerId: 'cust-123',
    customerName: 'Pandi Selvam',
    customerPhone: '+919842100000',
    reason: DisputeReason.QUALITY_FRESHNESS,
    status: DisputeStatus.OPEN,
    customerComments: 'Meat arrived without proper ice chilling',
    evidencePhotoUrls: [],
    claimedAmountPaise: 40000,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockDisputeRepo = {
      create: vi.fn(),
      findByIdOrThrow: vi.fn(),
      findByCustomerId: vi.fn(),
      findByOrderId: vi.fn(),
      updateByIdOrThrow: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    };

    mockOrderRepo = {
      findByIdOrThrow: vi.fn(),
      updateById: vi.fn(),
    };

    mockFinance = {
      recordDisputeRefundDebit: vi.fn(),
    };

    mockUserRepo = {
      findById: vi.fn(),
    };

    service = new DisputesService(
      mockDisputeRepo as unknown as DisputeRepository,
      mockOrderRepo as unknown as OrderRepository,
      mockFinance as unknown as FinanceService,
      mockUserRepo as unknown as UserRepository,
    );
  });

  describe('create ticket', () => {
    it('creates dispute and updates order status to DISPUTED', async () => {
      mockOrderRepo.findByIdOrThrow.mockResolvedValue(mockOrder);
      mockDisputeRepo.findByOrderId.mockResolvedValue([]);
      mockUserRepo.findById.mockResolvedValue({ name: 'Pandi Selvam', phone: '+919842100000' });
      mockDisputeRepo.create.mockResolvedValue(mockDispute);

      const res = await service.create(
        {
          orderId: mockOrder._id,
          reason: DisputeReason.QUALITY_FRESHNESS,
          customerComments: 'Meat arrived without proper ice chilling',
          claimedAmountPaise: 40000,
        },
        'cust-123',
      );

      expect(res.ticketNumber).toBe(mockDispute.ticketNumber);
      expect(mockOrderRepo.updateById).toHaveBeenCalledWith(mockOrder._id, {
        status: OrderStatus.DISPUTED,
      });
    });

    it('throws ForbiddenAppException if customer does not own order', async () => {
      mockOrderRepo.findByIdOrThrow.mockResolvedValue(mockOrder);

      await expect(
        service.create(
          {
            orderId: mockOrder._id,
            reason: DisputeReason.QUALITY_FRESHNESS,
            customerComments: 'Not mine',
            claimedAmountPaise: 10000,
          },
          'other-cust',
        ),
      ).rejects.toThrowError(ForbiddenAppException);
    });

    it('throws AppException if active dispute already exists for order', async () => {
      mockOrderRepo.findByIdOrThrow.mockResolvedValue(mockOrder);
      mockDisputeRepo.findByOrderId.mockResolvedValue([mockDispute]);

      await expect(
        service.create(
          {
            orderId: mockOrder._id,
            reason: DisputeReason.UNDERWEIGHT,
            customerComments: 'Another issue',
            claimedAmountPaise: 20000,
          },
          'cust-123',
        ),
      ).rejects.toThrowError(AppException);
    });
  });

  describe('customer queries', () => {
    it('lists disputes for customer', async () => {
      mockDisputeRepo.findByCustomerId.mockResolvedValue([mockDispute]);

      const result = await service.listCustomerDisputes('cust-123');
      expect(result).toHaveLength(1);
      expect(result[0].ticketNumber).toBe('TKT-20261026-0001');
    });

    it('gets customer dispute if customerId matches', async () => {
      mockDisputeRepo.findByIdOrThrow.mockResolvedValue(mockDispute);

      const result = await service.getCustomerDispute('cust-123', mockDispute._id);
      expect(result.id).toBe(mockDispute._id);
    });

    it('throws ForbiddenAppException if customerId does not match dispute', async () => {
      mockDisputeRepo.findByIdOrThrow.mockResolvedValue(mockDispute);

      await expect(service.getCustomerDispute('other-cust', mockDispute._id)).rejects.toThrowError(
        ForbiddenAppException,
      );
    });
  });
});
