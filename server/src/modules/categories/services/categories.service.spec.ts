import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoriesService } from './categories.service.js';
import type { CategoryRepository } from '../repositories/category.repository.js';
import { ConflictAppException, NotFoundAppException } from '#common/exceptions';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let mockCategoryRepo: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    mockCategoryRepo = {
      findBySlug: vi.fn(),
      findById: vi.fn(),
      findActiveList: vi.fn(),
      create: vi.fn(),
      updateById: vi.fn(),
      paginate: vi.fn(),
    };

    service = new CategoriesService(mockCategoryRepo as unknown as CategoryRepository);
  });

  it('builds hierarchical category tree with parent and children', async () => {
    const categories = [
      {
        _id: 'cat-parent-1',
        name: 'Chicken',
        slug: 'chicken',
        parentId: null,
        order: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: 'cat-child-1',
        name: 'Country Chicken',
        slug: 'country-chicken',
        parentId: 'cat-parent-1',
        order: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockCategoryRepo.findActiveList.mockResolvedValue(categories);

    const tree = await service.listCategoriesTree();
    expect(tree).toHaveLength(1);
    expect(tree[0].name).toBe('Chicken');
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children?.[0].name).toBe('Country Chicken');
  });

  it('throws ConflictAppException when creating duplicate slug', async () => {
    mockCategoryRepo.findBySlug.mockResolvedValue({ _id: 'cat-1', slug: 'mutton' });

    await expect(
      service.createCategory({ name: 'Mutton', slug: 'mutton' }),
    ).rejects.toThrow(ConflictAppException);
  });

  it('throws NotFoundAppException when category not found by id', async () => {
    mockCategoryRepo.findById.mockResolvedValue(null);

    await expect(service.getCategoryById('non-existent')).rejects.toThrow(NotFoundAppException);
  });
});
