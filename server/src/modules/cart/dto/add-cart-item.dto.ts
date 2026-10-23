import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ToBoolean, ToInt, Trim } from '#common/transformers';
import { CutType, PreparationOption } from '#common/enums';
import { IsGrams } from '#common/validators';

export class AddCartItemDto {
  @ApiProperty({ format: 'uuid', description: 'Butcher shop UUID v7' })
  @IsUUID('7')
  shopId!: string;

  @ApiProperty({ format: 'uuid', description: 'Product UUID v7' })
  @IsUUID('7')
  productId!: string;

  @ApiProperty({ description: 'Order portion weight in integer grams (e.g. 500 = 500g)', example: 500 })
  @ToInt()
  @IsGrams({ min: 50 })
  grams!: number;

  @ApiPropertyOptional({ description: 'Number of portions of this weight (default 1)', example: 1, default: 1 })
  @IsOptional()
  @ToInt()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ enum: CutType, example: CutType.CURRY_CUT })
  @IsOptional()
  @IsEnum(CutType)
  cutType?: CutType;

  @ApiPropertyOptional({ enum: PreparationOption, example: PreparationOption.CLEANED })
  @IsOptional()
  @IsEnum(PreparationOption)
  preparation?: PreparationOption;

  @ApiPropertyOptional({ example: 'Please pack in 2 separate pouches' })
  @IsOptional()
  @Trim()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'If true, automatically clears any existing cart items from another shop',
    default: false,
  })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  clearPreviousShop?: boolean;
}
