import { http } from '@/lib/http';
import type { components } from '@/types/api.generated';

export type Shop = components['schemas']['ShopResponseDto'];

export const shopsApi = {
  getNearby: (params: { lat: number; lng: number; radiusKm?: number }): Promise<Shop[]> =>
    http.get<Shop[]>('/api/v1/shops/nearby', { params }),

  getById: (id: string): Promise<Shop> =>
    http.get<Shop>(`/api/v1/shops/${encodeURIComponent(id)}`),
};
