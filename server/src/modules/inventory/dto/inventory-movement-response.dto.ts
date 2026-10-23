import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InventoryMovementType } from '#common/enums';

export class InventoryMovementResponseDto {
  @ApiProperty({ example: '0199f3c8-6a1e-7b2a-9c3d-4e5f60718293' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  shopId!: string;

  @ApiProperty({ format: 'uuid' })
  productId!: string;

  @ApiProperty({ enum: InventoryMovementType, example: InventoryMovementType.RESERVED })
  type!: InventoryMovementType;

  @ApiProperty({ description: 'Movement delta in grams', example: 1000 })
  grams!: number;

  @ApiProperty({ description: 'Available stock in grams after movement', example: 19000 })
  availableGramsAfter!: number;

  @ApiProperty({ description: 'Reserved stock in grams after movement', example: 1000 })
  reservedGramsAfter!: number;

  @ApiProperty({ example: 'ORDER' })
  referenceType!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  referenceId!: string | null;

  @ApiProperty({ example: 'usr-123' })
  actorId!: string;

  @ApiPropertyOptional({ example: 'Customer cart reservation hold' })
  notes?: string;

  @ApiProperty({ example: '2026-10-23T06:30:00.000Z' })
  createdAt!: string;
}
