export const inventoryKeys = {
  all: ['vendor-inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  productStock: (productId: string) => [...inventoryKeys.all, 'stock', productId] as const,
  movements: (productId: string) => [...inventoryKeys.all, 'movements', productId] as const,
  products: ['vendor-products'] as const,
};
