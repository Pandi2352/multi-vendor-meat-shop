import { InventoryBatchResponseDto } from '../dto/inventory-batch-response.dto.js';
import { InventoryMovementResponseDto } from '../dto/inventory-movement-response.dto.js';
import type { InventoryBatch } from '../schemas/inventory-batch.schema.js';
import type { InventoryMovement } from '../schemas/inventory-movement.schema.js';

export const getBatchStatus = (availableGrams: number): string => {
  if (availableGrams <= 0) return 'OUT_OF_STOCK';
  if (availableGrams <= 2000) return 'LOW_STOCK';
  return 'IN_STOCK';
};

export const toInventoryBatchResponseDto = (
  entity: InventoryBatch,
): InventoryBatchResponseDto => ({
  id: entity._id,
  shopId: entity.shopId,
  productId: entity.productId,
  batchDate: entity.batchDate,
  availableGrams: entity.availableGrams,
  reservedGrams: entity.reservedGrams,
  totalOpeningGrams: entity.totalOpeningGrams,
  expiresAt: entity.expiresAt instanceof Date ? entity.expiresAt.toISOString() : String(entity.expiresAt),
  status: getBatchStatus(entity.availableGrams),
  createdAt: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : String(entity.createdAt),
  updatedAt: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : String(entity.updatedAt),
});

export const toInventoryMovementResponseDto = (
  entity: InventoryMovement,
): InventoryMovementResponseDto => ({
  id: entity._id,
  shopId: entity.shopId,
  productId: entity.productId,
  type: entity.type,
  grams: entity.grams,
  availableGramsAfter: entity.availableGramsAfter,
  reservedGramsAfter: entity.reservedGramsAfter,
  referenceType: entity.referenceType,
  referenceId: entity.referenceId,
  actorId: entity.actorId,
  notes: entity.notes,
  createdAt: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : String(entity.createdAt),
});
