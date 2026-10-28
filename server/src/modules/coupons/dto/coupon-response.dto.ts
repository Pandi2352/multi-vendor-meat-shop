import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CouponDiscountType } from '#common/enums';

export class CouponResponseDto {
  @ApiProperty({ format: 'uuid', example: '0199f3c8-6a1e-7b2a-9c3d-4e5f60718293' })
  id!: string;

  @ApiProperty({ example: 'VIRUDHUNAGAR20' })
  code!: string;

  @ApiProperty({ example: '20% off up to ₹100 on fresh mutton & chicken' })
  description!: string;

  @ApiProperty({ enum: CouponDiscountType, example: CouponDiscountType.PERCENTAGE })
  discountType!: CouponDiscountType;

  @ApiProperty({ example: 20 })
  discountValue!: number;

  @ApiProperty({ example: 30000, description: 'Minimum subtotal in paise to qualify' })
  minOrderPaise!: number;

  @ApiPropertyOptional({ example: 10000, description: 'Maximum discount cap in paise' })
  maxDiscountPaise?: number;

  @ApiProperty({ example: '2026-12-31T23:59:59.000Z' })
  validUntil!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;
}
