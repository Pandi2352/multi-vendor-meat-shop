export const couponKeys = {
  all: ['coupons'] as const,
  available: (shopId?: string) => [...couponKeys.all, 'available', { shopId }] as const,
};
