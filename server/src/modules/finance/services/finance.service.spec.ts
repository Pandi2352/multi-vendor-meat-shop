import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppException, ErrorCode } from '#common/exceptions';
import { LedgerDirection, LedgerEntryType, SettlementStatus } from '#common/enums';
import { FinanceService } from './finance.service.js';
import type { CommissionRepository } from '../repositories/commission.repository.js';
import type { LedgerEntryRepository } from '../repositories/ledger-entry.repository.js';
import type { SettlementRepository } from '../repositories/settlement.repository.js';

describe('FinanceService', () => {
  let service: FinanceService;
  let commissionRepo: Partial<Record<keyof CommissionRepository, ReturnType<typeof vi.fn>>>;
  let ledgerRepo: Partial<Record<keyof LedgerEntryRepository, ReturnType<typeof vi.fn>>>;
  let settlementRepo: Partial<Record<keyof SettlementRepository, ReturnType<typeof vi.fn>>>;

  const config = {
    business: {
      defaultCommissionBps: 1000, // 10%
    },
  };

  beforeEach(() => {
    commissionRepo = {
      findByOrderId: vi.fn(),
      findPendingByShop: vi.fn(),
      create: vi.fn(),
      updateByIdOrThrow: vi.fn(),
    };
    ledgerRepo = {
      getLatestBalance: vi.fn(),
      findRecentByShop: vi.fn(),
      create: vi.fn(),
    };
    settlementRepo = {
      findByShop: vi.fn(),
      findBySettlementNumber: vi.fn(),
      create: vi.fn(),
    };

    service = new FinanceService(
      config as never,
      commissionRepo as unknown as CommissionRepository,
      ledgerRepo as unknown as LedgerEntryRepository,
      settlementRepo as unknown as SettlementRepository,
    );
  });

  describe('recordOrderDelivered', () => {
    it('calculates 10% commission on delivered COD order and writes ledger entry', async () => {
      commissionRepo.findByOrderId!.mockResolvedValue(null);
      ledgerRepo.getLatestBalance!.mockResolvedValue(20000); // 200 INR existing
      commissionRepo.create!.mockImplementation(async (data) => ({
        _id: 'comm-1',
        ...data,
        createdAt: new Date(),
      }));

      const res = await service.recordOrderDelivered({
        orderId: 'ord-123',
        orderNumber: 'ORD-261023-ABCDE',
        shopId: 'shop-456',
        totalAmountPaise: 50000, // ₹500
      });

      expect(res.grossAmountPaise).toBe(50000);
      expect(res.commissionAmountPaise).toBe(5000); // 10% = ₹50
      expect(res.netVendorAmountPaise).toBe(45000); // ₹450
      expect(commissionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'ord-123',
          grossAmountPaise: 50000,
          commissionAmountPaise: 5000,
          netVendorAmountPaise: 45000,
          status: 'PENDING',
        }),
      );
      expect(ledgerRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          shopId: 'shop-456',
          direction: LedgerDirection.CREDIT,
          entryType: LedgerEntryType.SALE,
          amountPaise: 45000,
          balanceAfterPaise: 65000, // 20000 + 45000
        }),
      );
    });

    it('is idempotent when order commission is already recorded', async () => {
      commissionRepo.findByOrderId!.mockResolvedValue({
        _id: 'comm-existing',
        orderId: 'ord-123',
        grossAmountPaise: 50000,
        commissionAmountPaise: 5000,
        netVendorAmountPaise: 45000,
        createdAt: new Date(),
      });

      const res = await service.recordOrderDelivered({
        orderId: 'ord-123',
        orderNumber: 'ORD-261023-ABCDE',
        shopId: 'shop-456',
        totalAmountPaise: 50000,
      });

      expect(res.id).toBe('comm-existing');
      expect(ledgerRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('createSettlement', () => {
    it('creates settlement and debits ledger balance', async () => {
      const pendingComms = [
        {
          _id: 'c1',
          grossAmountPaise: 40000,
          commissionAmountPaise: 4000,
          netVendorAmountPaise: 36000,
          createdAt: new Date(),
        },
        {
          _id: 'c2',
          grossAmountPaise: 60000,
          commissionAmountPaise: 6000,
          netVendorAmountPaise: 54000,
          createdAt: new Date(),
        },
      ];
      commissionRepo.findPendingByShop!.mockResolvedValue(pendingComms);
      ledgerRepo.getLatestBalance!.mockResolvedValue(90000);
      settlementRepo.create!.mockImplementation(async (data) => ({
        _id: 'set-1',
        ...data,
      }));

      const res = await service.createSettlement({
        shopId: 'shop-456',
        utrNumber: 'HDFC987654321',
      });

      expect(res.orderCount).toBe(2);
      expect(res.grossSalesPaise).toBe(100000);
      expect(res.commissionDeductedPaise).toBe(10000);
      expect(res.netPayoutPaise).toBe(90000);
      expect(res.status).toBe(SettlementStatus.SETTLED);
      expect(commissionRepo.updateByIdOrThrow).toHaveBeenCalledTimes(2);
      expect(ledgerRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: LedgerDirection.DEBIT,
          entryType: LedgerEntryType.PAYOUT,
          amountPaise: 90000,
          balanceAfterPaise: 0,
        }),
      );
    });

    it('throws when no pending orders exist to settle', async () => {
      commissionRepo.findPendingByShop!.mockResolvedValue([]);

      await expect(
        service.createSettlement({ shopId: 'shop-empty' }),
      ).rejects.toThrow(AppException);
    });
  });
});
