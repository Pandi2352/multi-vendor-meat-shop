import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';
import { ToBoolean, ToInt, Trim } from '#common/transformers';
import { CutType, PreparationOption, ProductStatus, SellMode, Unit } from '#common/enums';
import { IsGrams, IsPaise } from '#common/validators';

export class CreateProductDto {
  @ApiProperty({ format: 'uuid', description: 'Category UUID v7 id' })
  @IsUUID('7')
  categoryId!: string;

  @ApiProperty({ example: 'Country Chicken Curry Cut' })
  @Trim()
  @IsString()
  @Length(2, 100)
  name!: string;

  @ApiPropertyOptional({ example: 'country-chicken-curry-cut' })
  @IsOptional()
  @Trim()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'Farm fresh country chicken cut into medium curry pieces' })
  @IsOptional()
  @Trim()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [String], example: ['https://images.example.com/products/chicken.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ enum: SellMode, default: SellMode.FIXED_WEIGHT })
  @IsOptional()
  @IsEnum(SellMode)
  sellMode?: SellMode;

  @ApiPropertyOptional({ enum: Unit, default: Unit.GRAM })
  @IsOptional()
  @IsEnum(Unit)
  unit?: Unit;

  @ApiPropertyOptional({ enum: CutType, default: CutType.CURRY_CUT })
  @IsOptional()
  @IsEnum(CutType)
  cutType?: CutType;

  @ApiPropertyOptional({ enum: PreparationOption, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(PreparationOption, { each: true })
  allowedPreparation?: PreparationOption[];

  @ApiProperty({ description: 'Price per kilogram in paise (e.g. 42000 = ₹420)', example: 42000 })
  @ToInt()
  @IsPaise()
  pricePerKgPaise!: number;

  @ApiPropertyOptional({ description: 'Original MRP per kg in paise', example: 48000 })
  @IsOptional()
  @ToInt()
  @IsPaise()
  mrpPerKgPaise?: number;

  @ApiPropertyOptional({ description: 'Minimum order weight in grams', example: 250, default: 250 })
  @IsOptional()
  @ToInt()
  @IsGrams({ min: 50 })
  minGrams?: number;

  @ApiPropertyOptional({ description: 'Maximum order weight in grams', example: 5000, default: 5000 })
  @IsOptional()
  @ToInt()
  @IsGrams({ min: 50 })
  maxGrams?: number;

  @ApiPropertyOptional({ description: 'Weight step interval in grams', example: 250, default: 250 })
  @IsOptional()
  @ToInt()
  @IsGrams({ min: 50 })
  stepGrams?: number;

  @ApiPropertyOptional({ type: [Number], example: [250, 500, 1000] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  allowedWeightsGrams?: number[];

  @ApiPropertyOptional({ description: 'Price per piece in paise if SellMode is PIECE', example: 1500 })
  @IsOptional()
  @ToInt()
  @IsPaise()
  piecePricePaise?: number;

  @ApiPropertyOptional({ enum: ProductStatus, default: ProductStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  isFreshDaily?: boolean;

  @ApiPropertyOptional({ example: '0-4°C', default: '0-4°C' })
  @IsOptional()
  @Trim()
  @IsString()
  storageTemp?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @ToInt()
  @IsInt()
  @Min(1)
  shelfLifeDays?: number;
}
