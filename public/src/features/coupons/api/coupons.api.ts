import { http } from '@/lib/http';

export interface CouponResponse {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FLAT_PAISE';
  discountValue: number;
  minOrderPaise: number;
  maxDiscountPaise?: number;
  validUntil: string;
  applicableShopIds: string[];
}

export interface ApplyCouponBody {
  code: string;
  subtotalPaise: number;
  shopId?: string;
}

export interface ApplyCouponResponse {
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FLAT_PAISE';
  discountValue: number;
  discountPaise: number;
  subtotalPaise: number;
  newTotalPaise: number;
}

export const couponsApi = {
  listAvailable: (shopId?: string): Promise<CouponResponse[]> =>
    http.get<CouponResponse[]>('/api/v1/coupons/available', { params: { shopId } }),

  apply: (body: ApplyCouponBody): Promise<ApplyCouponResponse> =>
    http.post<ApplyCouponResponse>('/api/v1/coupons/apply', body),
};
