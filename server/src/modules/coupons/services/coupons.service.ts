import { Injectable } from '@nestjs/common';
import { AppException, ErrorCode } from '#common/exceptions';
import { CouponDiscountType } from '#common/enums';
import { CouponRepository } from '../repositories/coupon.repository.js';
import type { Coupon } from '../schemas/coupon.schema.js';
import type { CouponResponseDto } from '../dto/coupon-response.dto.js';
import { toCouponResponseDto } from '../mappers/coupon.mapper.js';

export interface CouponValidationResult {
  coupon: Coupon;
  discountPaise: number;
}

@Injectable()
export class CouponsService {
  constructor(private readonly couponRepo: CouponRepository) {}

  async listAvailable(shopId?: string): Promise<CouponResponseDto[]> {
    const coupons = await this.couponRepo.findAvailable(shopId);
    return coupons.map(toCouponResponseDto);
  }

  async validateAndCalculateDiscount(
    code: string,
    subtotalPaise: number,
    customerId: string,
    shopId?: string,
  ): Promise<CouponValidationResult> {
    const normalizedCode = code.trim().toUpperCase();
    const coupon = await this.couponRepo.findByCode(normalizedCode);

    if (!coupon || !coupon.isActive) {
      throw new AppException(ErrorCode.COUPON_INVALID, {
        message: `Coupon code '${code}' is invalid or inactive`,
      });
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      throw new AppException(ErrorCode.COUPON_EXPIRED, {
        message: `Coupon code '${coupon.code}' has expired`,
      });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new AppException(ErrorCode.COUPON_LIMIT_REACHED, {
        message: `Coupon code '${coupon.code}' has reached its total usage limit`,
      });
    }

    const customerUsageCount = coupon.usedCustomerIds.filter((id) => id === customerId).length;
    if (customerUsageCount >= coupon.perCustomerLimit) {
      throw new AppException(ErrorCode.COUPON_LIMIT_REACHED, {
        message: `You have already used coupon '${coupon.code}' the maximum allowed number of times`,
      });
    }

    if (subtotalPaise < coupon.minOrderPaise) {
      const minINR = Math.round(coupon.minOrderPaise / 100);
      throw new AppException(ErrorCode.MIN_ORDER_NOT_MET, {
        message: `Coupon '${coupon.code}' requires a minimum order value of ₹${minINR}`,
      });
    }

    if (coupon.applicableShopIds && coupon.applicableShopIds.length > 0 && shopId) {
      if (!coupon.applicableShopIds.includes(shopId)) {
        throw new AppException(ErrorCode.COUPON_INVALID, {
          message: `Coupon '${coupon.code}' is not applicable for this butcher shop`,
        });
      }
    }

    let discountPaise = 0;
    if (coupon.discountType === CouponDiscountType.FLAT_PAISE) {
      discountPaise = Math.min(coupon.discountValue, subtotalPaise);
    } else if (coupon.discountType === CouponDiscountType.PERCENTAGE) {
      const calculated = Math.round((subtotalPaise * coupon.discountValue) / 100);
      discountPaise = coupon.maxDiscountPaise
        ? Math.min(calculated, coupon.maxDiscountPaise)
        : calculated;
    }

    return {
      coupon,
      discountPaise: Math.min(discountPaise, subtotalPaise),
    };
  }

  async recordCouponUsage(code: string, customerId: string): Promise<void> {
    await this.couponRepo.recordUsage(code, customerId);
  }
}
