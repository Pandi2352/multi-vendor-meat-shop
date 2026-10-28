import { Injectable } from '@nestjs/common';
import { ProductsService } from '#modules/products';
import { ShopsService } from '#modules/shops';
import { InventoryService } from '#modules/inventory';
import { FavouriteRepository } from '../repositories/favourite.repository.js';
import { FavouriteItemResponseDto, ToggleFavouriteResponseDto } from '../dto/favourite-response.dto.js';

@Injectable()
export class FavouritesService {
  constructor(
    private readonly favouriteRepo: FavouriteRepository,
    private readonly products: ProductsService,
    private readonly shops: ShopsService,
    private readonly inventory: InventoryService,
  ) {}

  async toggleFavourite(
    customerId: string,
    productId: string,
  ): Promise<ToggleFavouriteResponseDto> {
    const existing = await this.favouriteRepo.findByCustomerAndProduct(customerId, productId);

    if (existing) {
      await this.favouriteRepo.deleteByCustomerAndProduct(customerId, productId);
      return { isFavourited: false, productId };
    }

    const product = await this.products.getPublicProduct(productId);
    await this.favouriteRepo.create({
      customerId,
      productId,
      shopId: product.shopId,
    });

    return { isFavourited: true, productId };
  }

  async getCustomerFavouriteIds(customerId: string): Promise<string[]> {
    return this.favouriteRepo.findCustomerProductIds(customerId);
  }

  async getCustomerFavourites(customerId: string): Promise<FavouriteItemResponseDto[]> {
    const favourites = await this.favouriteRepo.findByCustomerId(customerId);
    const results: FavouriteItemResponseDto[] = [];

    for (const fav of favourites) {
      try {
        const product = await this.products.getPublicProduct(fav.productId);
        const shop = await this.shops.getShopById(product.shopId);
        const stock = await this.inventory.getTodayStock(product.shopId, product.id);

        results.push({
          id: fav._id,
          productId: product.id,
          productName: product.name,
          categoryName: undefined,
          shopId: product.shopId,
          shopName: shop.name,
          pricePerKgPaise: product.pricePerKgPaise,
          imageUrl: product.images?.[0],
          minGrams: product.minGrams,
          maxGrams: product.maxGrams,
          stepGrams: product.stepGrams,
          isAvailable: stock.availableGrams >= product.minGrams,
          availableGrams: stock.availableGrams,
          createdAt: fav.createdAt,
        });
      } catch {
        // Product may have been deactivated or removed
        continue;
      }
    }

    return results;
  }

  async removeFavourite(
    customerId: string,
    productId: string,
  ): Promise<{ removed: boolean }> {
    const removed = await this.favouriteRepo.deleteByCustomerAndProduct(customerId, productId);
    return { removed };
  }
}
