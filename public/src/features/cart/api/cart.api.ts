import { http } from '@/lib/http';
import type { components } from '@/types/api.generated';

export type CartResponse = components['schemas']['CartResponseDto'];
export type CartItem = components['schemas']['CartItemResponseDto'];
export type CheckoutQuoteResponse = components['schemas']['CheckoutQuoteResponseDto'];
export type AddCartItemBody = components['schemas']['AddCartItemDto'];

export const cartApi = {
  getCart: (): Promise<CartResponse> => http.get<CartResponse>('/api/v1/cart'),

  addItem: (body: AddCartItemBody): Promise<CartResponse> =>
    http.post<CartResponse>('/api/v1/cart/items', body),

  removeItem: (productId: string): Promise<CartResponse> =>
    http.delete<CartResponse>(`/api/v1/cart/items/${encodeURIComponent(productId)}`),

  clearCart: (): Promise<{ cleared: boolean }> => http.delete<{ cleared: boolean }>('/api/v1/cart'),

  getCheckoutQuote: (params?: {
    lat?: number;
    lng?: number;
    couponCode?: string;
  }): Promise<CheckoutQuoteResponse> =>
    http.get<CheckoutQuoteResponse>('/api/v1/checkout/quote', { params }),
};
