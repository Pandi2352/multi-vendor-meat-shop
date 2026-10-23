import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ToInt, Trim } from '#common/transformers';
import { InventoryMovementType } from '#common/enums';
import { IsGrams } from '#common/validators';

export class AdjustStockDto {
  @ApiProperty({ format: 'uuid', description: 'Product UUID v7 id' })
  @IsUUID('7')
  productId!: string;

  @ApiProperty({
    enum: [InventoryMovementType.RECEIVED, InventoryMovementType.WASTAGE, InventoryMovementType.ADJUSTMENT],
    description: 'Type of stock adjustment',
  })
  @IsEnum(InventoryMovementType)
  type!: InventoryMovementType;

  @ApiProperty({ description: 'Quantity in grams to adjust', example: 5000 })
  @ToInt()
  @IsGrams({ min: 1 })
  grams!: number;

  @ApiPropertyOptional({ example: 'End of day trim wastage / additional afternoon delivery' })
  @IsOptional()
  @Trim()
  @IsString()
  notes?: string;
}
