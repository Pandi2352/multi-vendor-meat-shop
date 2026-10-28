import { useMutation, useQuery } from '@tanstack/react-query';
import { couponsApi, type ApplyCouponBody } from './coupons.api';
import { couponKeys } from './keys';

export const useAvailableCoupons = (shopId?: string) => {
  return useQuery({
    queryKey: couponKeys.available(shopId),
    queryFn: () => couponsApi.listAvailable(shopId),
  });
};

export const useApplyCoupon = () => {
  return useMutation({
    mutationFn: (body: ApplyCouponBody) => couponsApi.apply(body),
  });
};
