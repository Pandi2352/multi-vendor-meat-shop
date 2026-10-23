import { useQuery } from '@tanstack/react-query';
import { shopsApi } from './shops.api';
import { shopKeys } from './keys';

export const useNearbyShops = (lat = 13.0418, lng = 80.2341, radiusKm = 15) => {
  return useQuery({
    queryKey: shopKeys.nearby(lat, lng, radiusKm),
    queryFn: () => shopsApi.getNearby({ lat, lng, radiusKm }),
  });
};

export const useShopDetail = (id: string, enabled = true) => {
  return useQuery({
    queryKey: shopKeys.detail(id),
    queryFn: () => shopsApi.getById(id),
    enabled: Boolean(id) && enabled,
  });
};
