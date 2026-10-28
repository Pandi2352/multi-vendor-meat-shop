import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty({ format: 'uuid', example: '018f3a52-7b5c-7d92-881b-85fa7d7b5b5c' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  shopId!: string;

  @ApiProperty({ format: 'uuid' })
  orderId!: string;

  @ApiProperty({ format: 'uuid' })
  customerId!: string;

  @ApiProperty({ example: 'Selvam P.' })
  customerName!: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  rating!: number;

  @ApiPropertyOptional({ example: 'Fresh meat and prompt delivery.' })
  comment?: string;

  @ApiProperty({ example: true })
  isVerifiedPurchase!: boolean;

  @ApiProperty({ example: '2026-10-28T10:00:00.000Z' })
  createdAt!: string;
}

export class RatingDistributionDto {
  @ApiProperty({ example: 2 })
  1!: number;

  @ApiProperty({ example: 1 })
  2!: number;

  @ApiProperty({ example: 3 })
  3!: number;

  @ApiProperty({ example: 8 })
  4!: number;

  @ApiProperty({ example: 25 })
  5!: number;
}

export class ShopRatingSummaryDto {
  @ApiProperty({ example: 4.8 })
  averageRating!: number;

  @ApiProperty({ example: 39 })
  totalReviews!: number;

  @ApiProperty({ type: RatingDistributionDto })
  distribution!: RatingDistributionDto;
}
