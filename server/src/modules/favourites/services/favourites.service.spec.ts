import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FavouritesService } from './favourites.service.js';
import type { FavouriteRepository } from '../repositories/favourite.repository.js';
import type { ProductsService } from '#modules/products';
import type { ShopsService } from '#modules/shops';
import type { InventoryService } from '#modules/inventory';

describe('FavouritesService', () => {
  let service: FavouritesService;
  let favouriteRepo: Partial<FavouriteRepository>;
  let products: Partial<ProductsService>;
  let shops: Partial<ShopsService>;
  let inventory: Partial<InventoryService>;

  beforeEach(() => {
    favouriteRepo = {
      findByCustomerAndProduct: vi.fn(),
      create: vi.fn(),
      deleteByCustomerAndProduct: vi.fn(),
      findCustomerProductIds: vi.fn(),
      findByCustomerId: vi.fn(),
    };

    products = {
      getPublicProduct: vi.fn(),
    };

    shops = {
      getShopById: vi.fn(),
    };

    inventory = {
      getTodayStock: vi.fn(),
    };

    service = new FavouritesService(
      favouriteRepo as FavouriteRepository,
      products as ProductsService,
      shops as ShopsService,
      inventory as InventoryService,
    );
  });

  it('toggles favourite on when not previously favourited', async () => {
    vi.mocked(favouriteRepo.findByCustomerAndProduct!).mockResolvedValue(null);
    vi.mocked(products.getPublicProduct!).mockResolvedValue({
      id: 'prod-1',
      shopId: 'shop-1',
      name: 'Mutton Curry Cut',
    } as any);

    const result = await service.toggleFavourite('cust-1', 'prod-1');

    expect(result).toEqual({ isFavourited: true, productId: 'prod-1' });
    expect(favouriteRepo.create).toHaveBeenCalledWith({
      customerId: 'cust-1',
      productId: 'prod-1',
      shopId: 'shop-1',
    });
  });

  it('toggles favourite off when already favourited', async () => {
    vi.mocked(favouriteRepo.findByCustomerAndProduct!).mockResolvedValue({
      _id: 'fav-1',
      customerId: 'cust-1',
      productId: 'prod-1',
    } as any);
    vi.mocked(favouriteRepo.deleteByCustomerAndProduct!).mockResolvedValue(true);

    const result = await service.toggleFavourite('cust-1', 'prod-1');

    expect(result).toEqual({ isFavourited: false, productId: 'prod-1' });
    expect(favouriteRepo.deleteByCustomerAndProduct).toHaveBeenCalledWith('cust-1', 'prod-1');
  });

  it('returns customer favourite product IDs', async () => {
    vi.mocked(favouriteRepo.findCustomerProductIds!).mockResolvedValue(['prod-1', 'prod-2']);

    const ids = await service.getCustomerFavouriteIds('cust-1');

    expect(ids).toEqual(['prod-1', 'prod-2']);
    expect(favouriteRepo.findCustomerProductIds).toHaveBeenCalledWith('cust-1');
  });

  it('returns enriched favourites with live stock and stall name', async () => {
    vi.mocked(favouriteRepo.findByCustomerId!).mockResolvedValue([
      { _id: 'fav-1', customerId: 'cust-1', productId: 'prod-1', createdAt: new Date() } as any,
    ]);
    vi.mocked(products.getPublicProduct!).mockResolvedValue({
      id: 'prod-1',
      name: 'Country Chicken',
      categoryName: 'Chicken',
      shopId: 'shop-1',
      pricePerKgPaise: 42000,
      imageUrl: 'https://example.com/chicken.jpg',
      minGrams: 500,
      maxGrams: 2000,
      stepGrams: 250,
    } as any);
    vi.mocked(shops.getShopById!).mockResolvedValue({
      id: 'shop-1',
      name: 'Chettinad Stall',
    } as any);
    vi.mocked(inventory.getTodayStock!).mockResolvedValue({
      availableGrams: 5000,
    } as any);

    const list = await service.getCustomerFavourites('cust-1');

    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      productId: 'prod-1',
      productName: 'Country Chicken',
      shopName: 'Chettinad Stall',
      pricePerKgPaise: 42000,
      isAvailable: true,
      availableGrams: 5000,
    });
  });
});
