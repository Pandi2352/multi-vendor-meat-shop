import { CategoryResponseDto } from '../dto/category-response.dto.js';
import type { Category } from '../schemas/category.schema.js';

export const toCategoryResponseDto = (
  entity: Category,
  children?: CategoryResponseDto[],
): CategoryResponseDto => ({
  id: entity._id,
  name: entity.name,
  slug: entity.slug,
  description: entity.description,
  imageUrl: entity.imageUrl,
  parentId: entity.parentId,
  order: entity.order,
  isActive: entity.isActive,
  children: children && children.length > 0 ? children : undefined,
  createdAt: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : String(entity.createdAt),
  updatedAt: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : String(entity.updatedAt),
});
