import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ToInt, Trim } from '#common/transformers';
import { IsGrams } from '#common/validators';

export class SetOpeningStockDto {
  @ApiProperty({ format: 'uuid', description: 'Product UUID v7 id' })
  @IsUUID('7')
  productId!: string;

  @ApiProperty({ description: 'Opening stock quantity in grams (e.g. 20000 = 20kg)', example: 20000 })
  @ToInt()
  @IsGrams({ min: 0 })
  openingGrams!: number;

  @ApiPropertyOptional({ example: '2026-10-23', description: 'Batch date in YYYY-MM-DD (defaults to current date in IST)' })
  @IsOptional()
  @Trim()
  @IsString()
  batchDate?: string;

  @ApiPropertyOptional({ example: 'Morning delivery from Namakkal farm' })
  @IsOptional()
  @Trim()
  @IsString()
  notes?: string;
}
