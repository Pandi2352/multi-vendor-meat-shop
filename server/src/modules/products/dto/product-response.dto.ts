import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CutType, PreparationOption, ProductStatus, SellMode, Unit } from '#common/enums';

export class ProductResponseDto {
  @ApiProperty({ example: '0199f3c8-6a1e-7b2a-9c3d-4e5f60718293' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  shopId!: string;

  @ApiProperty({ format: 'uuid' })
  categoryId!: string;

  @ApiProperty({ example: 'Country Chicken Curry Cut' })
  name!: string;

  @ApiProperty({ example: 'country-chicken-curry-cut' })
  slug!: string;

  @ApiPropertyOptional({ example: 'Farm fresh country chicken cut into medium curry pieces' })
  description?: string;

  @ApiProperty({ type: [String], example: ['https://images.example.com/products/chicken.jpg'] })
  images!: string[];

  @ApiProperty({ enum: SellMode, example: SellMode.FIXED_WEIGHT })
  sellMode!: SellMode;

  @ApiProperty({ enum: Unit, example: Unit.GRAM })
  unit!: Unit;

  @ApiPropertyOptional({ enum: CutType, example: CutType.CURRY_CUT })
  cutType?: CutType;

  @ApiProperty({ enum: PreparationOption, isArray: true })
  allowedPreparation!: PreparationOption[];

  @ApiProperty({ description: 'Price per kg in paise', example: 42000 })
  pricePerKgPaise!: number;

  @ApiPropertyOptional({ description: 'MRP per kg in paise', example: 48000 })
  mrpPerKgPaise?: number;

  @ApiProperty({ description: 'Min weight in grams', example: 250 })
  minGrams!: number;

  @ApiProperty({ description: 'Max weight in grams', example: 5000 })
  maxGrams!: number;

  @ApiProperty({ description: 'Step interval in grams', example: 250 })
  stepGrams!: number;

  @ApiProperty({ type: [Number], example: [250, 500, 1000] })
  allowedWeightsGrams!: number[];

  @ApiPropertyOptional({ description: 'Piece price in paise if SellMode is PIECE', example: 1500 })
  piecePricePaise?: number;

  @ApiProperty({ enum: ProductStatus, example: ProductStatus.ACTIVE })
  status!: ProductStatus;

  @ApiProperty({ example: true })
  isFreshDaily!: boolean;

  @ApiPropertyOptional({ example: '0-4°C' })
  storageTemp?: string;

  @ApiProperty({ example: 1 })
  shelfLifeDays!: number;

  @ApiProperty({ example: '2026-10-23T06:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-10-23T06:00:00.000Z' })
  updatedAt!: string;
}
