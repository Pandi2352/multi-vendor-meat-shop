import { http } from '@/lib/http';
import type { components } from '@/types/api.generated';

export type Product = components['schemas']['ProductResponseDto'];

export const productsApi = {
  listForShop: (shopId: string, categoryId?: string): Promise<Product[]> =>
    http.get<Product[]>(`/api/v1/shops/${encodeURIComponent(shopId)}/products`, {
      params: categoryId ? { categoryId } : undefined,
    }),

  getById: (id: string): Promise<Product> =>
    http.get<Product>(`/api/v1/products/${encodeURIComponent(id)}`),
};
