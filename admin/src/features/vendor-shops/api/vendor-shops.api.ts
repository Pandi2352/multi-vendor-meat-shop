import { http, type PaginatedResponse } from '@/lib/http';

export interface ShopAddress {
  line1: string;
  line2?: string;
  locality: string;
  city: string;
  district: string;
  pincode: string;
}

export interface ShopProfile {
  id: string;
  vendorId: string;
  name: string;
  slug: string;
  description?: string;
  phone: string;
  address: ShopAddress;
  status: 'OPEN' | 'CLOSED' | 'PAUSED';
  openingTime: string;
  closingTime: string;
  serviceRadiusKm: number;
  minOrderPaise: number;
  deliveryFeePaise: number;
  freeDeliveryAbovePaise?: number;
}

export interface UpdateShopPayload {
  name?: string;
  description?: string;
  phone?: string;
  openingTime?: string;
  closingTime?: string;
  serviceRadiusKm?: number;
  deliveryFeePaise?: number;
  status?: 'OPEN' | 'CLOSED' | 'PAUSED';
}

export const vendorShopsApi = {
  getMyShop: (): Promise<ShopProfile> =>
    http.get<ShopProfile>('/vendor/shops/me'),

  updateMyShop: (data: UpdateShopPayload): Promise<ShopProfile> =>
    http.patch<ShopProfile>('/vendor/shops/me', data),

  listAllShops: (): Promise<PaginatedResponse<ShopProfile>> =>
    http.getPaginated<ShopProfile>('/shops', { limit: 100 }),
};
