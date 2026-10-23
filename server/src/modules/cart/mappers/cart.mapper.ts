import { CartItemResponseDto, CartResponseDto } from '../dto/cart-response.dto.js';
import type { Cart, CartItem } from '../schemas/cart.schema.js';

export const toCartItemResponseDto = (
  item: CartItem,
  stockInfo?: { isAvailable: boolean; availableStockGrams?: number },
): CartItemResponseDto => ({
  productId: item.productId,
  name: item.name,
  grams: item.grams,
  quantity: item.quantity,
  totalGrams: item.grams * item.quantity,
  cutType: item.cutType,
  preparation: item.preparation,
  pricePerKgPaise: item.pricePerKgPaise,
  lineTotalPaise: item.lineTotalPaise,
  notes: item.notes,
  isAvailable: stockInfo ? stockInfo.isAvailable : true,
  availableStockGrams: stockInfo?.availableStockGrams,
});

export const toCartResponseDto = (
  cart: Cart,
  shopName?: string,
  stockMap?: Map<string, { isAvailable: boolean; availableStockGrams: number }>,
): CartResponseDto => {
  const items = cart.items.map((item) =>
    toCartItemResponseDto(item, stockMap?.get(item.productId)),
  );

  const totalGrams = items.reduce((sum, item) => sum + item.totalGrams, 0);
  const subtotalPaise = items.reduce((sum, item) => sum + item.lineTotalPaise, 0);

  return {
    id: cart._id,
    customerId: cart.customerId,
    shopId: cart.shopId,
    shopName,
    items,
    itemCount: items.length,
    totalGrams,
    subtotalPaise,
    updatedAt: cart.updatedAt instanceof Date ? cart.updatedAt.toISOString() : String(cart.updatedAt),
  };
};
