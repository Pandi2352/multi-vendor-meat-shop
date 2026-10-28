import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CouponsService } from './coupons.service.js';
import { CouponRepository } from '../repositories/coupon.repository.js';
import { CouponDiscountType } from '#common/enums';
import { AppException, ErrorCode } from '#common/exceptions';

describe('CouponsService', () => {
  let service: CouponsService;
  let repo: {
    findByCode: ReturnType<typeof vi.fn>;
    findAvailable: ReturnType<typeof vi.fn>;
    recordUsage: ReturnType<typeof vi.fn>;
  };

  const createMockCoupon = (overrides = {}) => ({
    _id: '018f0000-0000-7000-8000-000000000001',
    code: 'FIRSTMEAT50',
    description: 'Flat ₹50 off',
    discountType: CouponDiscountType.FLAT_PAISE,
    discountValue: 5000,
    minOrderPaise: 20000,
    maxDiscountPaise: 5000,
    usageLimit: 100,
    usedCount: 0,
    perCustomerLimit: 1,
    usedCustomerIds: [],
    validFrom: new Date(Date.now() - 86400000),
    validUntil: new Date(Date.now() + 86400000),
    isActive: true,
    applicableShopIds: [],
    ...overrides,
  });

  beforeEach(() => {
    repo = {
      findByCode: vi.fn(),
      findAvailable: vi.fn(),
      recordUsage: vi.fn(),
    };
    service = new CouponsService(repo as unknown as CouponRepository);
  });

  describe('validateAndCalculateDiscount', () => {
    it('calculates flat discount correctly', async () => {
      repo.findByCode.mockResolvedValue(createMockCoupon());

      const result = await service.validateAndCalculateDiscount(
        'firstmeat50',
        25000,
        'cust-1',
      );

      expect(result.coupon.code).toBe('FIRSTMEAT50');
      expect(result.discountPaise).toBe(5000);
    });

    it('calculates percentage discount capped at maxDiscountPaise', async () => {
      repo.findByCode.mockResolvedValue(
        createMockCoupon({
          code: 'PERCENT20',
          discountType: CouponDiscountType.PERCENTAGE,
          discountValue: 20,
          minOrderPaise: 10000,
          maxDiscountPaise: 3000, // max 3000 paise (₹30)
        }),
      );

      // 20% of 20000 is 4000, but capped at 3000
      const result = await service.validateAndCalculateDiscount(
        'PERCENT20',
        20000,
        'cust-1',
      );

      expect(result.coupon.code).toBe('PERCENT20');
      expect(result.discountPaise).toBe(3000);
    });

    it('throws COUPON_INVALID if coupon not found or inactive', async () => {
      repo.findByCode.mockResolvedValue(null);

      await expect(
        service.validateAndCalculateDiscount('INVALID', 20000, 'cust-1'),
      ).rejects.toThrowError(AppException);
    });

    it('throws COUPON_EXPIRED if coupon has passed validUntil', async () => {
      repo.findByCode.mockResolvedValue(
        createMockCoupon({
          validUntil: new Date(Date.now() - 1000),
        }),
      );

      await expect(
        service.validateAndCalculateDiscount('FIRSTMEAT50', 25000, 'cust-1'),
      ).rejects.toThrowError(AppException);
    });

    it('throws COUPON_MIN_ORDER_NOT_MET if subtotal below minOrderPaise', async () => {
      repo.findByCode.mockResolvedValue(createMockCoupon({ minOrderPaise: 30000 }));

      await expect(
        service.validateAndCalculateDiscount('FIRSTMEAT50', 20000, 'cust-1'),
      ).rejects.toThrowError(AppException);
    });

    it('throws COUPON_LIMIT_REACHED if customer already exceeded perCustomerLimit', async () => {
      repo.findByCode.mockResolvedValue(
        createMockCoupon({
          perCustomerLimit: 1,
          usedCustomerIds: ['cust-1'],
        }),
      );

      await expect(
        service.validateAndCalculateDiscount('FIRSTMEAT50', 25000, 'cust-1'),
      ).rejects.toThrowError(AppException);
    });
  });
});
