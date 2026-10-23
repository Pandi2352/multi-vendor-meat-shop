import { ApiProperty } from '@nestjs/swagger';

export class InventoryBatchResponseDto {
  @ApiProperty({ example: '0199f3c8-6a1e-7b2a-9c3d-4e5f60718293' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  shopId!: string;

  @ApiProperty({ format: 'uuid' })
  productId!: string;

  @ApiProperty({ example: '2026-10-23' })
  batchDate!: string;

  @ApiProperty({ description: 'Available stock in grams', example: 18500 })
  availableGrams!: number;

  @ApiProperty({ description: 'Reserved stock in grams', example: 1500 })
  reservedGrams!: number;

  @ApiProperty({ description: 'Original opening stock in grams', example: 20000 })
  totalOpeningGrams!: number;

  @ApiProperty({ example: '2026-10-23T18:29:59.999Z' })
  expiresAt!: string;

  @ApiProperty({ example: 'IN_STOCK', enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK'] })
  status!: string;

  @ApiProperty({ example: '2026-10-23T04:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-10-23T07:15:00.000Z' })
  updatedAt!: string;
}
