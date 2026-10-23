import { http, type PaginatedResponse } from '@/lib/http';
import type { components } from '@/types/api.generated';

export type InventoryBatch = components['schemas']['InventoryBatchResponseDto'];
export type InventoryMovement = components['schemas']['InventoryMovementResponseDto'];
export type SetOpeningStockBody = components['schemas']['SetOpeningStockDto'];
export type AdjustStockBody = components['schemas']['AdjustStockDto'];
export type Product = components['schemas']['ProductResponseDto'];

export const inventoryApi = {
  listTodayStock: (): Promise<InventoryBatch[]> =>
    http.get<InventoryBatch[]>('/api/v1/vendor/inventory'),

  getProductStock: (productId: string): Promise<InventoryBatch> =>
    http.get<InventoryBatch>(`/api/v1/vendor/inventory/${encodeURIComponent(productId)}`),

  setOpeningStock: (body: SetOpeningStockBody): Promise<InventoryBatch> =>
    http.post<InventoryBatch>('/api/v1/vendor/inventory/opening', body),

  adjustStock: (body: AdjustStockBody): Promise<InventoryBatch> =>
    http.post<InventoryBatch>('/api/v1/vendor/inventory/adjust', body),

  getMovements: (productId: string, limit = 50): Promise<InventoryMovement[]> =>
    http.get<InventoryMovement[]>(`/api/v1/vendor/inventory/${encodeURIComponent(productId)}/movements?limit=${limit}`),

  listProducts: (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Product>> =>
    http.getPaginated<Product>('/api/v1/vendor/products', params as Record<string, unknown>),
};
