import { useQuery } from '@tanstack/react-query';
import { shopsApi } from './shops.api';
import { shopKeys } from './keys';

export const useNearbyShops = (lat = 9.5680, lng = 77.9624, radiusKm = 60) => {
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
