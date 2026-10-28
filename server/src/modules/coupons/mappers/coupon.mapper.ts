import type { Coupon } from '../schemas/coupon.schema.js';
import type { CouponResponseDto } from '../dto/coupon-response.dto.js';

export function toCouponResponseDto(c: Coupon): CouponResponseDto {
  return {
    id: c._id,
    code: c.code,
    description: c.description,
    discountType: c.discountType,
    discountValue: c.discountValue,
    minOrderPaise: c.minOrderPaise,
    maxDiscountPaise: c.maxDiscountPaise,
    validUntil: c.validUntil.toISOString(),
    isActive: c.isActive,
  };
}
