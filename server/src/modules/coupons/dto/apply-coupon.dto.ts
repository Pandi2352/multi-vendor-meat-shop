import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Trim } from '#common/transformers';
import { CouponDiscountType } from '#common/enums';

export class ApplyCouponDto {
  @ApiProperty({ example: 'FIRSTMEAT50', description: 'Coupon code to validate and apply' })
  @Trim()
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Optional shopId to verify applicability' })
  @IsOptional()
  @Trim()
  @IsString()
  shopId?: string;
}

export class ApplyCouponResponseDto {
  @ApiProperty({ example: 'FIRSTMEAT50' })
  code!: string;

  @ApiProperty({ example: 'Flat ₹50 off on orders above ₹200' })
  description!: string;

  @ApiProperty({ enum: CouponDiscountType, example: CouponDiscountType.FLAT_PAISE })
  discountType!: CouponDiscountType;

  @ApiProperty({ example: 5000, description: 'Percentage rate or flat paise rate' })
  discountValue!: number;

  @ApiProperty({ example: 5000, description: 'Calculated savings in paise' })
  discountPaise!: number;

  @ApiProperty({ example: 25000, description: 'Current items subtotal in paise' })
  subtotalPaise!: number;

  @ApiProperty({ example: 24000, description: 'Final order total payable in paise' })
  newTotalPaise!: number;
}
