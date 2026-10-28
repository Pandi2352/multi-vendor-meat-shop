import { http } from '@/lib/http';

export interface FavouriteItem {
  id: string;
  productId: string;
  productName: string;
  categoryName?: string;
  shopId: string;
  shopName: string;
  pricePerKgPaise: number;
  imageUrl?: string;
  minGrams: number;
  maxGrams: number;
  stepGrams: number;
  isAvailable: boolean;
  availableGrams: number;
  createdAt: string;
}

export interface ToggleFavouriteResult {
  isFavourited: boolean;
  productId: string;
}

export const favouritesApi = {
  getFavourites: (): Promise<FavouriteItem[]> =>
    http.get<FavouriteItem[]>('/api/v1/favourites'),

  getFavouriteIds: (): Promise<string[]> =>
    http.get<string[]>('/api/v1/favourites/ids'),

  toggleFavourite: (productId: string): Promise<ToggleFavouriteResult> =>
    http.post<ToggleFavouriteResult>(`/api/v1/favourites/${encodeURIComponent(productId)}/toggle`),

  removeFavourite: (productId: string): Promise<{ removed: boolean }> =>
    http.delete<{ removed: boolean }>(`/api/v1/favourites/${encodeURIComponent(productId)}`),
};
