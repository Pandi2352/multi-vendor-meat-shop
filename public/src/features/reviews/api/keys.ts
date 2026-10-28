export const reviewKeys = {
  all: ['reviews'] as const,
  order: (orderId: string) => [...reviewKeys.all, 'order', orderId] as const,
  shop: (shopId: string) => [...reviewKeys.all, 'shop', shopId] as const,
  shopList: (shopId: string, params?: Record<string, unknown>) =>
    [...reviewKeys.shop(shopId), 'list', params] as const,
  shopSummary: (shopId: string) => [...reviewKeys.shop(shopId), 'summary'] as const,
};
