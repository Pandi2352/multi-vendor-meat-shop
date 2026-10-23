import { ProductResponseDto } from '../dto/product-response.dto.js';
import type { Product } from '../schemas/product.schema.js';

export const toProductResponseDto = (entity: Product): ProductResponseDto => ({
  id: entity._id,
  shopId: entity.shopId,
  categoryId: entity.categoryId,
  name: entity.name,
  slug: entity.slug,
  description: entity.description,
  images: entity.images || [],
  sellMode: entity.sellMode,
  unit: entity.unit,
  cutType: entity.cutType,
  allowedPreparation: entity.allowedPreparation || [],
  pricePerKgPaise: entity.pricePerKgPaise,
  mrpPerKgPaise: entity.mrpPerKgPaise,
  minGrams: entity.minGrams,
  maxGrams: entity.maxGrams,
  stepGrams: entity.stepGrams,
  allowedWeightsGrams: entity.allowedWeightsGrams || [],
  piecePricePaise: entity.piecePricePaise,
  status: entity.status,
  isFreshDaily: entity.isFreshDaily,
  storageTemp: entity.storageTemp,
  shelfLifeDays: entity.shelfLifeDays,
  createdAt: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : String(entity.createdAt),
  updatedAt: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : String(entity.updatedAt),
});
