import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CartService } from './cart.service.js';
import type { CartRepository } from '../repositories/cart.repository.js';
import type { ProductsService } from '#modules/products';
import type { ShopsService } from '#modules/shops';
import type { InventoryService } from '#modules/inventory';
import type { CouponsService } from '#modules/coupons';
import { AppException, ErrorCode } from '#common/exceptions';
import { ShopStatus } from '#common/enums';

describe('CartService', () => {
  let service: CartService;
  let mockCartRepo: Record<string, ReturnType<typeof vi.fn>>;
  let mockProducts: Record<string, ReturnType<typeof vi.fn>>;
  let mockShops: Record<string, ReturnType<typeof vi.fn>>;
  let mockInventory: Record<string, ReturnType<typeof vi.fn>>;
  let mockCoupons: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(() => {
    mockCartRepo = {
      findByCustomerId: vi.fn(),
      create: vi.fn(),
      updateByIdOrThrow: vi.fn(),
      clearCart: vi.fn(),
    };

    mockProducts = {
      getPublicProduct: vi.fn(),
    };

    mockShops = {
      getShopById: vi.fn(),
    };

    mockInventory = {
      getTodayStock: vi.fn(),
    };

    mockCoupons = {
      validateAndCalculateDiscount: vi.fn(),
      recordCouponUsage: vi.fn(),
    };

    service = new CartService(
      mockCartRepo as unknown as CartRepository,
      mockProducts as unknown as ProductsService,
      mockShops as unknown as ShopsService,
      mockInventory as unknown as InventoryService,
      mockCoupons as unknown as CouponsService,
    );
  });

  it('adds item to cart and calculates line total in paise', async () => {
    mockProducts.getPublicProduct.mockResolvedValue({
      id: 'prod-1',
      shopId: 'shop-1',
      name: 'Country Chicken',
      pricePerKgPaise: 40000,
      minGrams: 250,
      maxGrams: 5000,
      stepGrams: 250,
    });

    mockShops.getShopById.mockResolvedValue({
      id: 'shop-1',
      name: 'Best Butcher',
    });

    mockCartRepo.findByCustomerId.mockResolvedValue({
      _id: 'cart-1',
      customerId: 'cust-1',
      shopId: 'shop-1',
      items: [],
    });

    mockInventory.getTodayStock.mockResolvedValue({
      availableGrams: 10000,
    });

    mockCartRepo.updateByIdOrThrow.mockImplementation((_id, update) => ({
      _id: 'cart-1',
      customerId: 'cust-1',
      shopId: 'shop-1',
      items: update.items,
      updatedAt: new Date(),
    }));

    const result = await service.addItem('cust-1', {
      shopId: 'shop-1',
      productId: 'prod-1',
      grams: 500,
      quantity: 1,
    });

    // 500g of ₹400/kg (40000 paise) = 20000 paise (₹200)
    expect(result.items).toHaveLength(1);
    expect(result.items[0].lineTotalPaise).toBe(20000);
    expect(result.subtotalPaise).toBe(20000);
  });

  it('throws AppException CART_SHOP_MISMATCH when adding item from a different shop without clear flag', async () => {
    mockProducts.getPublicProduct.mockResolvedValue({
      id: 'prod-2',
      shopId: 'shop-2',
      minGrams: 250,
      maxGrams: 5000,
      stepGrams: 250,
    });

    mockShops.getShopById.mockResolvedValue({ id: 'shop-2', name: 'Other Shop' });

    mockCartRepo.findByCustomerId.mockResolvedValue({
      _id: 'cart-1',
      customerId: 'cust-1',
      shopId: 'shop-1',
      items: [{ productId: 'prod-1', grams: 500, quantity: 1, lineTotalPaise: 20000 }],
    });

    await expect(
      service.addItem('cust-1', {
        shopId: 'shop-2',
        productId: 'prod-2',
        grams: 500,
        clearPreviousShop: false,
      }),
    ).rejects.toThrow(
      expect.objectContaining({
        code: ErrorCode.CART_SHOP_MISMATCH,
      }),
    );
  });

  it('calculates checkout quote with subtotal, delivery fee, and packaging fee', async () => {
    mockCartRepo.findByCustomerId.mockResolvedValue({
      _id: 'cart-1',
      customerId: 'cust-1',
      shopId: 'shop-1',
      items: [
        {
          productId: 'prod-1',
          name: 'Mutton Curry Cut',
          grams: 1000,
          quantity: 1,
          pricePerKgPaise: 80000,
          lineTotalPaise: 80000,
        },
      ],
      updatedAt: new Date(),
    });

    mockShops.getShopById.mockResolvedValue({
      id: 'shop-1',
      name: 'Madina Meats',
      status: ShopStatus.OPEN,
      minOrderPaise: 20000,
      deliveryFeePaise: 4000,
      deliveryRadiusKm: 10,
    });

    mockInventory.getTodayStock.mockResolvedValue({
      availableGrams: 5000,
    });

    const quote = await service.getCheckoutQuote('cust-1', {});
    expect(quote.subtotalPaise).toBe(80000);
    expect(quote.deliveryFeePaise).toBe(4000);
    expect(quote.packagingFeePaise).toBe(1500);
    // 80000 + 4000 + 1500 = 85500 paise
    expect(quote.totalPaise).toBe(85500);
    expect(quote.minOrderMet).toBe(true);
  });
});
