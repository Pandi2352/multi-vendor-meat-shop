import { useQuery } from '@tanstack/react-query';
import { productsApi } from './products.api';
import { productKeys } from './keys';

export const useShopProducts = (shopId: string, categoryId?: string, enabled = true) => {
  return useQuery({
    queryKey: productKeys.forShop(shopId, categoryId),
    queryFn: () => productsApi.listForShop(shopId, categoryId),
    enabled: Boolean(shopId) && enabled,
  });
};

export const useProductDetail = (id: string, enabled = true) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.getById(id),
    enabled: Boolean(id) && enabled,
  });
};
