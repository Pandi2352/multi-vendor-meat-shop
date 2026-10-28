import { http, type PaginatedResponse } from '@/lib/http';

export interface ReviewResponse {
  id: string;
  shopId: string;
  orderId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment?: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface RatingSummaryResponse {
  averageRating: number;
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface CreateReviewRequest {
  rating: number;
  comment?: string;
}

export interface QueryReviewsParams extends Record<string, unknown> {
  page?: number;
  limit?: number;
  rating?: number;
}

export const reviewsApi = {
  createReview: (orderId: string, body: CreateReviewRequest): Promise<ReviewResponse> =>
    http.post<ReviewResponse>(`/orders/${orderId}/review`, body),

  getOrderReview: (orderId: string): Promise<ReviewResponse | null> =>
    http.get<ReviewResponse | null>(`/orders/${orderId}/review`),

  getShopReviews: (
    shopId: string,
    params?: QueryReviewsParams,
  ): Promise<PaginatedResponse<ReviewResponse>> =>
    http.getPaginated<ReviewResponse>(`/shops/${shopId}/reviews`, params),

  getShopRatingSummary: (shopId: string): Promise<RatingSummaryResponse> =>
    http.get<RatingSummaryResponse>(`/shops/${shopId}/reviews/summary`),
};
