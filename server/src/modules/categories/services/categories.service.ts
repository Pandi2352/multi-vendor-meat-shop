import { Injectable } from '@nestjs/common';
import { AppException, ConflictAppException, ErrorCode, NotFoundAppException } from '#common/exceptions';
import { slugify } from '#common/utils';
import { PaginatedResult } from '#common/dto';
import { CategoryRepository } from '../repositories/category.repository.js';
import { CreateCategoryDto } from '../dto/create-category.dto.js';
import { UpdateCategoryDto } from '../dto/update-category.dto.js';
import { QueryCategoriesDto } from '../dto/query-categories.dto.js';
import { CategoryResponseDto } from '../dto/category-response.dto.js';
import { toCategoryResponseDto } from '../mappers/category.mapper.js';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoryRepo: CategoryRepository) {}

  async listCategoriesTree(): Promise<CategoryResponseDto[]> {
    const all = await this.categoryRepo.findActiveList();
    const topLevel = all.filter((c) => !c.parentId);
    const childrenMap = new Map<string, CategoryResponseDto[]>();

    for (const item of all) {
      if (item.parentId) {
        const list = childrenMap.get(item.parentId) ?? [];
        list.push(toCategoryResponseDto(item));
        childrenMap.set(item.parentId, list);
      }
    }

    return topLevel.map((parent) =>
      toCategoryResponseDto(parent, childrenMap.get(parent._id)),
    );
  }

  async listAdminCategories(query: QueryCategoriesDto): Promise<PaginatedResult<CategoryResponseDto>> {
    const filter: Record<string, unknown> = {};
    if (query.parentId !== undefined) filter.parentId = query.parentId;
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.q) filter.name = { $regex: query.q, $options: 'i' };

    const result = await this.categoryRepo.paginate(filter, query, {
      sortable: ['order', 'name', 'createdAt'],
      defaultSort: 'order',
    });

    return result.map((c) => toCategoryResponseDto(c));
  }

  async getCategoryById(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepo.findById(id);
    if (!category) throw new NotFoundAppException('Category', id);
    return toCategoryResponseDto(category);
  }

  async getCategoryBySlug(slug: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepo.findBySlug(slug);
    if (!category) {
      throw new AppException(ErrorCode.NOT_FOUND, {
        message: `Category with slug '${slug}' not found`,
      });
    }
    return toCategoryResponseDto(category);
  }

  async createCategory(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    const existing = await this.categoryRepo.findBySlug(slug);
    if (existing) {
      throw new ConflictAppException(`Category with slug '${slug}' already exists`);
    }

    if (dto.parentId) {
      const parent = await this.categoryRepo.findById(dto.parentId);
      if (!parent) throw new NotFoundAppException('Parent Category', dto.parentId);
    }

    const created = await this.categoryRepo.create({
      name: dto.name,
      slug,
      description: dto.description,
      imageUrl: dto.imageUrl,
      parentId: dto.parentId || null,
      order: dto.order ?? 0,
      isActive: dto.isActive ?? true,
    });

    return toCategoryResponseDto(created);
  }

  async updateCategory(id: string, dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.categoryRepo.findById(id);
    if (!category) throw new NotFoundAppException('Category', id);

    let slug: string | undefined;
    if (dto.slug || dto.name) {
      slug = dto.slug ? slugify(dto.slug) : slugify(dto.name!);
      const existing = await this.categoryRepo.findBySlug(slug);
      if (existing && existing._id !== id) {
        throw new ConflictAppException(`Category with slug '${slug}' already exists`);
      }
    }

    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new AppException(ErrorCode.BAD_REQUEST, {
          message: 'Category cannot be its own parent',
        });
      }
      const parent = await this.categoryRepo.findById(dto.parentId);
      if (!parent) throw new NotFoundAppException('Parent Category', dto.parentId);
    }

    const updated = await this.categoryRepo.updateById(id, {
      ...dto,
      ...(slug ? { slug } : {}),
    });

    if (!updated) throw new NotFoundAppException('Category', id);
    return toCategoryResponseDto(updated);
  }

  async deleteCategory(id: string): Promise<{ deleted: boolean }> {
    const category = await this.categoryRepo.findById(id);
    if (!category) throw new NotFoundAppException('Category', id);

    // Soft deactivate
    await this.categoryRepo.updateById(id, { isActive: false });
    return { deleted: true };
  }
}
