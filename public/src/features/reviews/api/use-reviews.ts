import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewsApi, type CreateReviewRequest, type QueryReviewsParams } from './reviews.api';
import { reviewKeys } from './keys';

export function useOrderReview(orderId?: string) {
  return useQuery({
    queryKey: reviewKeys.order(orderId || ''),
    queryFn: () => reviewsApi.getOrderReview(orderId!),
    enabled: Boolean(orderId),
  });
}

export function useShopReviews(shopId?: string, params?: QueryReviewsParams) {
  return useQuery({
    queryKey: reviewKeys.shopList(shopId || '', params),
    queryFn: () => reviewsApi.getShopReviews(shopId!, params),
    enabled: Boolean(shopId),
  });
}

export function useShopRatingSummary(shopId?: string) {
  return useQuery({
    queryKey: reviewKeys.shopSummary(shopId || ''),
    queryFn: () => reviewsApi.getShopRatingSummary(shopId!),
    enabled: Boolean(shopId),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, body }: { orderId: string; body: CreateReviewRequest }) =>
      reviewsApi.createReview(orderId, body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.order(data.orderId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.shop(data.shopId) });
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
  });
}
