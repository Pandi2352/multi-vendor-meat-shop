import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartKeys } from '@/features/cart/api/keys';
import { ordersApi, type CancelOrderBody, type CreateOrderBody } from './orders.api';
import { orderKeys } from './keys';

export const useOrdersList = (params?: { page?: number; limit?: number; status?: string }) => {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => ordersApi.list(params),
  });
};

export const useOrderDetail = (id: string, options?: { enabled?: boolean; refetchInterval?: number }) => {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersApi.detail(id),
    enabled: options?.enabled ?? Boolean(id),
    refetchInterval: options?.refetchInterval,
  });
};

export const useOrderDeliveryTask = (
  orderId: string,
  options?: { enabled?: boolean; refetchInterval?: number },
) => {
  return useQuery({
    queryKey: orderKeys.deliveryTask(orderId),
    queryFn: () => ordersApi.getDeliveryTask(orderId),
    enabled: options?.enabled ?? Boolean(orderId),
    refetchInterval: options?.refetchInterval ?? 5_000,
  });
};

export const useResendDeliveryOtp = () => {
  return useMutation({
    mutationFn: (orderId: string) => ordersApi.resendDeliveryOtp(orderId),
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateOrderBody) => ordersApi.create(body),
    onSuccess: (data) => {
      queryClient.setQueryData(orderKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: CancelOrderBody }) => ordersApi.cancel(id, body),
    onSuccess: (data) => {
      queryClient.setQueryData(orderKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
};
