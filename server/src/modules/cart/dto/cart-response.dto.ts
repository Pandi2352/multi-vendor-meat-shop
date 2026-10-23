import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CutType, PreparationOption } from '#common/enums';

export class CartItemResponseDto {
  @ApiProperty({ format: 'uuid' })
  productId!: string;

  @ApiProperty({ example: 'Country Chicken Curry Cut' })
  name!: string;

  @ApiProperty({ description: 'Weight in grams per portion', example: 500 })
  grams!: number;

  @ApiProperty({ description: 'Portion quantity', example: 1 })
  quantity!: number;

  @ApiProperty({ description: 'Total weight for this line item in grams', example: 500 })
  totalGrams!: number;

  @ApiPropertyOptional({ enum: CutType, example: CutType.CURRY_CUT })
  cutType?: CutType;

  @ApiPropertyOptional({ enum: PreparationOption, example: PreparationOption.CLEANED })
  preparation?: PreparationOption;

  @ApiProperty({ description: 'Price per kg in paise', example: 42000 })
  pricePerKgPaise!: number;

  @ApiProperty({ description: 'Total price for this line item in paise', example: 21000 })
  lineTotalPaise!: number;

  @ApiPropertyOptional({ example: 'Please pack separately' })
  notes?: string;

  @ApiProperty({ description: 'True if available in stock for today', example: true })
  isAvailable!: boolean;

  @ApiPropertyOptional({ description: 'Available stock in grams for today', example: 18000 })
  availableStockGrams?: number;
}

export class CartResponseDto {
  @ApiProperty({ example: '0199f3c8-6a1e-7b2a-9c3d-4e5f60718293' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  customerId!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  shopId!: string | null;

  @ApiPropertyOptional({ example: 'Al-Madina Mutton & Chicken Stalls' })
  shopName?: string;

  @ApiProperty({ type: [CartItemResponseDto] })
  items!: CartItemResponseDto[];

  @ApiProperty({ description: 'Total unique items in cart', example: 2 })
  itemCount!: number;

  @ApiProperty({ description: 'Total weight of all items in grams', example: 1500 })
  totalGrams!: number;

  @ApiProperty({ description: 'Sum of all item line totals in integer paise', example: 48000 })
  subtotalPaise!: number;

  @ApiProperty({ example: '2026-10-23T08:00:00.000Z' })
  updatedAt!: string;
}
