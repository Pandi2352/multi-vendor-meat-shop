import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vendorShopsApi, type UpdateShopPayload } from './vendor-shops.api';
import { vendorShopKeys } from './keys';

export const useVendorShop = () => {
  return useQuery({
    queryKey: vendorShopKeys.mine(),
    queryFn: () => vendorShopsApi.getMyShop(),
  });
};

export const useAllShops = () => {
  return useQuery({
    queryKey: vendorShopKeys.allShops(),
    queryFn: () => vendorShopsApi.listAllShops(),
  });
};

export const useUpdateVendorShop = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateShopPayload) => vendorShopsApi.updateMyShop(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorShopKeys.all });
    },
  });
};
