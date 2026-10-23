export const productKeys = {
  all: ['products'] as const,
  forShop: (shopId: string, categoryId?: string) =>
    [...productKeys.all, 'shop', shopId, { categoryId }] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
};
