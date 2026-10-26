export const vendorShopKeys = {
  all: ['vendor-shops'] as const,
  mine: () => [...vendorShopKeys.all, 'me'] as const,
  allShops: () => [...vendorShopKeys.all, 'all-list'] as const,
};
