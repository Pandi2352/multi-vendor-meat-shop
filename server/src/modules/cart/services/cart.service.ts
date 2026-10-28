import { Injectable } from '@nestjs/common';
import { AppException, ErrorCode, NotFoundAppException } from '#common/exceptions';
import { haversineKm, priceForGrams } from '#common/utils';
import { ShopStatus } from '#common/enums';
import { ProductsService } from '#modules/products';
import { ShopsService } from '#modules/shops';
import { InventoryService } from '#modules/inventory';
import { CouponsService } from '#modules/coupons';
import { CartRepository } from '../repositories/cart.repository.js';
import type { Cart, CartItem } from '../schemas/cart.schema.js';
import { AddCartItemDto } from '../dto/add-cart-item.dto.js';
import { CheckoutQuoteQueryDto } from '../dto/checkout-quote-query.dto.js';
import { CartResponseDto } from '../dto/cart-response.dto.js';
import { CheckoutQuoteResponseDto } from '../dto/checkout-quote-response.dto.js';
import { toCartResponseDto } from '../mappers/cart.mapper.js';

const PACKAGING_FEE_PAISE = 1500; // ₹15 for food-grade chilled insulation pouch

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepo: CartRepository,
    private readonly products: ProductsService,
    private readonly shops: ShopsService,
    private readonly inventory: InventoryService,
    private readonly coupons: CouponsService,
  ) {}

  private async getOrCreateCart(customerId: string): Promise<Cart> {
    const existing = await this.cartRepo.findByCustomerId(customerId);
    if (existing) return existing;

    return this.cartRepo.create({
      customerId,
      shopId: null,
      items: [],
    });
  }

  async getCart(customerId: string): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCart(customerId);
    return this.formatCartWithStock(cart);
  }

  async addItem(customerId: string, dto: AddCartItemDto): Promise<CartResponseDto> {
    const product = await this.products.getPublicProduct(dto.productId);

    if (product.shopId !== dto.shopId) {
      throw new AppException(ErrorCode.BAD_REQUEST, {
        message: 'Product does not belong to the selected shop',
      });
    }

    if (dto.grams < product.minGrams || dto.grams > product.maxGrams || dto.grams % product.stepGrams !== 0) {
      throw new AppException(ErrorCode.BAD_REQUEST, {
        message: `Order weight must be between ${product.minGrams}g and ${product.maxGrams}g in steps of ${product.stepGrams}g`,
      });
    }

    const shop = await this.shops.getShopById(dto.shopId);
    const cart = await this.getOrCreateCart(customerId);

    // Single-shop cart enforcement
    if (cart.shopId && cart.shopId !== dto.shopId && cart.items.length > 0) {
      if (!dto.clearPreviousShop) {
        throw new AppException(ErrorCode.CART_SHOP_MISMATCH, {
          message: 'Your cart contains meat from another shop. Clear your cart to switch shops.',
          details: { currentShopId: cart.shopId, newShopId: dto.shopId },
        });
      }
      cart.items = [];
      cart.shopId = dto.shopId;
    }

    const quantity = dto.quantity ?? 1;
    const requestedTotalGrams = dto.grams * quantity;

    // Check live daily stock
    const stock = await this.inventory.getTodayStock(dto.shopId, dto.productId);
    if (stock.availableGrams < requestedTotalGrams) {
      throw new AppException(ErrorCode.OUT_OF_STOCK, {
        message: 'Requested weight exceeds available fresh inventory for today',
        details: { availableGrams: stock.availableGrams, requestedGrams: requestedTotalGrams },
      });
    }

    const lineTotalPaise = priceForGrams(product.pricePerKgPaise, dto.grams) * quantity;

    // Check if item with same product, weight, and cuts exists
    const existingIndex = cart.items.findIndex(
      (item) => item.productId === dto.productId && item.grams === dto.grams && item.cutType === dto.cutType && item.preparation === dto.preparation,
    );

    const newItem: CartItem = {
      productId: dto.productId,
      name: product.name,
      grams: dto.grams,
      quantity,
      cutType: dto.cutType,
      preparation: dto.preparation,
      pricePerKgPaise: product.pricePerKgPaise,
      lineTotalPaise,
      notes: dto.notes,
    };

    if (existingIndex >= 0) {
      cart.items[existingIndex] = newItem;
    } else {
      cart.items.push(newItem);
    }

    cart.shopId = dto.shopId;
    const updated = await this.cartRepo.updateByIdOrThrow(cart._id, {
      shopId: cart.shopId,
      items: cart.items,
    });

    return this.formatCartWithStock(updated, shop.name);
  }

  async removeItem(customerId: string, productId: string): Promise<CartResponseDto> {
    const cart = await this.getOrCreateCart(customerId);
    const updatedItems = cart.items.filter((item) => item.productId !== productId);
    const shopId = updatedItems.length > 0 ? cart.shopId : null;

    const updated = await this.cartRepo.updateByIdOrThrow(cart._id, {
      shopId,
      items: updatedItems,
    });

    return this.formatCartWithStock(updated);
  }

  async clearCart(customerId: string): Promise<{ cleared: boolean }> {
    await this.cartRepo.clearCart(customerId);
    return { cleared: true };
  }

  async getCheckoutQuote(
    customerId: string,
    query: CheckoutQuoteQueryDto,
  ): Promise<CheckoutQuoteResponseDto> {
    const cart = await this.getOrCreateCart(customerId);

    if (!cart.shopId || cart.items.length === 0) {
      throw new AppException(ErrorCode.BAD_REQUEST, { message: 'Cart is empty' });
    }

    const shop = await this.shops.getShopById(cart.shopId);
    if (shop.status !== ShopStatus.OPEN) {
      throw new AppException(ErrorCode.SHOP_CLOSED, {
        message: `${shop.name} is currently closed`,
      });
    }

    const cartDto = await this.formatCartWithStock(cart, shop.name);
    const unavailable = cartDto.items.find((item) => !item.isAvailable);
    if (unavailable) {
      throw new AppException(ErrorCode.OUT_OF_STOCK, {
        message: `${unavailable.name} is out of stock for today's batch`,
        details: { productId: unavailable.productId },
      });
    }

    const subtotalPaise = cartDto.subtotalPaise;
    const minOrderMet = subtotalPaise >= shop.minOrderPaise;
    if (!minOrderMet) {
      throw new AppException(ErrorCode.MIN_ORDER_NOT_MET, {
        message: `Minimum order for ${shop.name} is ₹${shop.minOrderPaise / 100}`,
        details: { minOrderPaise: shop.minOrderPaise, currentSubtotalPaise: subtotalPaise },
      });
    }

    let isServiceable = true;
    let distanceKm: number | undefined;

    if (query.lat !== undefined && query.lng !== undefined && shop.address?.location) {
      const shopCoords = { lat: shop.address.location.lat, lng: shop.address.location.lng };
      distanceKm = Math.round(haversineKm({ lat: query.lat, lng: query.lng }, shopCoords) * 10) / 10;
      isServiceable = distanceKm <= shop.serviceRadiusKm;

      if (!isServiceable) {
        throw new AppException(ErrorCode.SHOP_NOT_SERVICEABLE, {
          message: `Your location is outside ${shop.name}'s delivery radius of ${shop.serviceRadiusKm} km`,
          details: { distanceKm, deliveryRadiusKm: shop.serviceRadiusKm },
        });
      }
    }

    const isFreeDelivery = shop.freeDeliveryAbovePaise !== undefined && subtotalPaise >= shop.freeDeliveryAbovePaise;
    const deliveryFeePaise = isFreeDelivery ? 0 : shop.deliveryFeePaise;
    const packagingFeePaise = PACKAGING_FEE_PAISE;
    let discountPaise = 0;
    let appliedCouponCode: string | undefined;

    if (query.couponCode) {
      const res = await this.coupons.validateAndCalculateDiscount(query.couponCode, subtotalPaise, customerId, shop.id);
      discountPaise = res.discountPaise;
      appliedCouponCode = res.coupon.code;
    }

    const totalPaise = Math.max(0, subtotalPaise + deliveryFeePaise + packagingFeePaise - discountPaise);

    return {
      shopId: shop.id,
      shopName: shop.name,
      items: cartDto.items,
      itemCount: cartDto.itemCount,
      totalWeightGrams: cartDto.totalGrams,
      subtotalPaise,
      deliveryFeePaise,
      packagingFeePaise,
      discountPaise,
      couponCode: appliedCouponCode,
      totalPaise,
      minOrderPaise: shop.minOrderPaise,
      minOrderMet,
      isServiceable,
      distanceKm,
    };
  }

  private async formatCartWithStock(cart: Cart, knownShopName?: string): Promise<CartResponseDto> {
    let shopName = knownShopName;
    if (!shopName && cart.shopId) {
      try {
        shopName = (await this.shops.getShopById(cart.shopId)).name;
      } catch {
        // Shop may no longer exist
      }
    }

    const stockMap = new Map<string, { isAvailable: boolean; availableStockGrams: number }>();
    if (cart.shopId) {
      for (const item of cart.items) {
        const stock = await this.inventory.getTodayStock(cart.shopId, item.productId);
        stockMap.set(item.productId, {
          isAvailable: stock.availableGrams >= item.grams * item.quantity,
          availableStockGrams: stock.availableGrams,
        });
      }
    }

    return toCartResponseDto(cart, shopName, stockMap);
  }
}
