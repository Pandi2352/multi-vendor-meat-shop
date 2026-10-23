import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CartItemResponseDto } from './cart-response.dto.js';

export class CheckoutQuoteResponseDto {
  @ApiProperty({ format: 'uuid' })
  shopId!: string;

  @ApiProperty({ example: 'Al-Madina Mutton & Chicken Stalls' })
  shopName!: string;

  @ApiProperty({ type: [CartItemResponseDto] })
  items!: CartItemResponseDto[];

  @ApiProperty({ description: 'Total item count', example: 2 })
  itemCount!: number;

  @ApiProperty({ description: 'Total order weight in grams', example: 1500 })
  totalWeightGrams!: number;

  @ApiProperty({ description: 'Items subtotal in paise', example: 48000 })
  subtotalPaise!: number;

  @ApiProperty({ description: 'Delivery fee in paise', example: 4000 })
  deliveryFeePaise!: number;

  @ApiProperty({ description: 'Packaging / ice box fee in paise', example: 1500 })
  packagingFeePaise!: number;

  @ApiProperty({ description: 'Discount applied in paise', example: 0 })
  discountPaise!: number;

  @ApiProperty({ description: 'Grand total payable in paise', example: 53500 })
  totalPaise!: number;

  @ApiProperty({ description: 'Shop minimum order requirement in paise', example: 20000 })
  minOrderPaise!: number;

  @ApiProperty({ description: 'True when subtotal meets minOrderPaise', example: true })
  minOrderMet!: boolean;

  @ApiProperty({ description: 'True if customer location is within shop service radius', example: true })
  isServiceable!: boolean;

  @ApiPropertyOptional({ description: 'Distance to delivery location in km', example: 2.4 })
  distanceKm?: number;
}
