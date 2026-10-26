import { http, type PaginatedResponse } from '@/lib/http';

export type CutType =
  | 'CURRY_CUT'
  | 'BIRYANI_CUT'
  | 'BONELESS'
  | 'WITH_BONE'
  | 'WHOLE'
  | 'BREAST'
  | 'LEG'
  | 'WINGS'
  | 'LIVER'
  | 'GIZZARD'
  | 'MINCE'
  | 'SOUP_PIECES'
  | 'FILLET'
  | 'STEAK';

export type PreparationOption =
  | 'CLEANED'
  | 'SKIN_ON'
  | 'SKIN_OFF'
  | 'SMALL_PIECES'
  | 'MEDIUM_PIECES'
  | 'LARGE_PIECES'
  | 'SCALED'
  | 'GUTTED';

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ARCHIVED';
export type SellMode = 'FIXED_WEIGHT' | 'VARIABLE_WEIGHT' | 'PIECE';

export interface VendorProduct {
  id: string;
  shopId: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  images: string[];
  sellMode: SellMode;
  unit: 'GRAM' | 'PIECE';
  cutType?: CutType;
  allowedPreparation: PreparationOption[];
  pricePerKgPaise: number;
  mrpPerKgPaise?: number;
  minGrams: number;
  maxGrams: number;
  stepGrams: number;
  allowedWeightsGrams: number[];
  piecePricePaise?: number;
  status: ProductStatus;
  isFreshDaily: boolean;
  storageTemp?: string;
  shelfLifeDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface CreateProductPayload {
  categoryId: string;
  name: string;
  description?: string;
  images?: string[];
  sellMode?: SellMode;
  cutType?: CutType;
  allowedPreparation?: PreparationOption[];
  pricePerKgPaise: number;
  mrpPerKgPaise?: number;
  minGrams?: number;
  maxGrams?: number;
  stepGrams?: number;
  allowedWeightsGrams?: number[];
  status?: ProductStatus;
  isFreshDaily?: boolean;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export const productsApi = {
  list: (params?: Record<string, unknown>): Promise<PaginatedResponse<VendorProduct>> =>
    http.getPaginated<VendorProduct>('/vendor/products', params),

  getById: (id: string): Promise<VendorProduct> =>
    http.get<VendorProduct>(`/vendor/products/${encodeURIComponent(id)}`),

  create: (data: CreateProductPayload): Promise<VendorProduct> =>
    http.post<VendorProduct>('/vendor/products', data),

  update: (id: string, data: UpdateProductPayload): Promise<VendorProduct> =>
    http.patch<VendorProduct>(`/vendor/products/${encodeURIComponent(id)}`, data),

  archive: (id: string): Promise<VendorProduct> =>
    http.delete<VendorProduct>(`/vendor/products/${encodeURIComponent(id)}`),

  listCategories: (): Promise<CategoryItem[]> =>
    http.get<CategoryItem[]>('/categories'),
};
