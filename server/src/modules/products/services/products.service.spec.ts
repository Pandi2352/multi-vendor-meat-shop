import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductsService } from './products.service.js';
import type { ProductRepository } from '../repositories/product.repository.js';
import type { CategoriesService } from '#modules/categories';
import { ConflictAppException, NotFoundAppException } from '#common/exceptions';
import { ProductStatus, SellMode } from '#common/enums';

describe('ProductsService', () => {
  let service: ProductsService;
  let mockProductRepo: Record<string, ReturnType<typeof vi.fn>>;
  let mockCategoriesService: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    mockProductRepo = {
      findActiveByShop: vi.fn(),
      findById: vi.fn(),
      findOne: vi.fn(),
      findByShopAndSlug: vi.fn(),
      create: vi.fn(),
      updateById: vi.fn(),
      paginate: vi.fn(),
    };

    mockCategoriesService = {
      getCategoryById: vi.fn(),
    };

    service = new ProductsService(
      mockProductRepo as unknown as ProductRepository,
      mockCategoriesService as unknown as CategoriesService,
    );
  });

  it('lists active products for a shop', async () => {
    const products = [
      {
        _id: 'prod-1',
        shopId: 'shop-1',
        categoryId: 'cat-1',
        name: 'Broiler Chicken Curry Cut',
        slug: 'broiler-chicken-curry-cut',
        pricePerKgPaise: 28000,
        status: ProductStatus.ACTIVE,
        sellMode: SellMode.FIXED_WEIGHT,
        minGrams: 250,
        maxGrams: 5000,
        stepGrams: 250,
        allowedWeightsGrams: [250, 500, 1000],
        shelfLifeDays: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockProductRepo.findActiveByShop.mockResolvedValue(products);

    const result = await service.listActiveForShop('shop-1');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Broiler Chicken Curry Cut');
    expect(result[0].pricePerKgPaise).toBe(28000);
  });

  it('throws ConflictAppException when product with duplicate slug exists in shop', async () => {
    mockCategoriesService.getCategoryById.mockResolvedValue({ id: 'cat-1' });
    mockProductRepo.findByShopAndSlug.mockResolvedValue({ _id: 'prod-existing', slug: 'chicken-curry-cut' });

    await expect(
      service.createForVendor('shop-1', {
        categoryId: 'cat-1',
        name: 'Chicken Curry Cut',
        pricePerKgPaise: 30000,
      }),
    ).rejects.toThrow(ConflictAppException);
  });

  it('throws NotFoundAppException when public product is inactive', async () => {
    mockProductRepo.findById.mockResolvedValue({
      _id: 'prod-inactive',
      status: ProductStatus.INACTIVE,
    });

    await expect(service.getPublicProduct('prod-inactive')).rejects.toThrow(NotFoundAppException);
  });
});
