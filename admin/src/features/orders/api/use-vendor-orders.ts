import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vendorOrderKeys } from './keys';
import {
  vendorOrdersApi,
  type OrderResponse,
  type UpdateOrderStatusBody,
  type VendorOrderListParams,
} from './vendor-orders.api';

export const useVendorOrders = (params?: VendorOrderListParams, options?: { refetchInterval?: number }) => {
  return useQuery({
    queryKey: vendorOrderKeys.list(params),
    queryFn: () => vendorOrdersApi.list(params),
    refetchInterval: options?.refetchInterval ?? 12_000,
  });
};

export const useVendorOrderDetail = (id: string) => {
  return useQuery({
    queryKey: vendorOrderKeys.detail(id),
    queryFn: () => vendorOrdersApi.detail(id),
    enabled: Boolean(id),
    refetchInterval: 8_000,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateOrderStatusBody }): Promise<OrderResponse> =>
      vendorOrdersApi.updateStatus(id, body),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: vendorOrderKeys.lists() });
      queryClient.setQueryData(vendorOrderKeys.detail(updated.id), updated);
    },
  });
};
