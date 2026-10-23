import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inventoryKeys } from './keys';
import {
  inventoryApi,
  type AdjustStockBody,
  type SetOpeningStockBody,
} from './inventory.api';

export const useTodayInventory = () => {
  return useQuery({
    queryKey: inventoryKeys.lists(),
    queryFn: () => inventoryApi.listTodayStock(),
    refetchInterval: 15_000,
  });
};

export const useVendorProducts = () => {
  return useQuery({
    queryKey: inventoryKeys.products,
    queryFn: () => inventoryApi.listProducts({ page: 1, limit: 100 }),
  });
};

export const useProductMovements = (productId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: inventoryKeys.movements(productId),
    queryFn: () => inventoryApi.getMovements(productId),
    enabled: options?.enabled ?? Boolean(productId),
  });
};

export const useSetOpeningStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SetOpeningStockBody) => inventoryApi.setOpeningStock(body),
    onSuccess: (batch) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      queryClient.setQueryData(inventoryKeys.productStock(batch.productId), batch);
    },
  });
};

export const useAdjustStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AdjustStockBody) => inventoryApi.adjustStock(body),
    onSuccess: (batch) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      queryClient.setQueryData(inventoryKeys.productStock(batch.productId), batch);
    },
  });
};
