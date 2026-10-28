import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vendorOrderKeys } from '@/features/orders/api/keys';
import { deliveryKeys } from './keys';
import {
  deliveryApi,
  type AssignDeliveryTaskBody,
  type DeliveryTaskListParams,
  type VerifyDeliveryOtpBody,
} from './delivery.api';

export const useDeliveryTasks = (params?: DeliveryTaskListParams, options?: { refetchInterval?: number }) => {
  return useQuery({
    queryKey: deliveryKeys.list(params),
    queryFn: () => deliveryApi.listTasks(params),
    refetchInterval: options?.refetchInterval ?? 10_000,
  });
};

export const useMyDeliveryTasks = (params?: DeliveryTaskListParams, options?: { refetchInterval?: number }) => {
  return useQuery({
    queryKey: deliveryKeys.myTasks(params),
    queryFn: () => deliveryApi.getMyTasks(params),
    refetchInterval: options?.refetchInterval ?? 5_000,
  });
};

export const useDeliveryEarnings = (options?: { refetchInterval?: number }) => {
  return useQuery({
    queryKey: deliveryKeys.earnings(),
    queryFn: () => deliveryApi.getEarnings(),
    refetchInterval: options?.refetchInterval ?? 15_000,
  });
};

export const useDeliveryTask = (id: string) => {
  return useQuery({
    queryKey: deliveryKeys.detail(id),
    queryFn: () => deliveryApi.getTask(id),
    enabled: Boolean(id),
    refetchInterval: 8_000,
  });
};

export const useDispatchDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => deliveryApi.dispatchOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all });
      queryClient.invalidateQueries({ queryKey: vendorOrderKeys.all });
    },
  });
};

export const useAssignPartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AssignDeliveryTaskBody }) =>
      deliveryApi.assignPartner(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all });
    },
  });
};

export const usePickupDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deliveryApi.pickup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all });
      queryClient.invalidateQueries({ queryKey: vendorOrderKeys.all });
    },
  });
};

export const useCompleteDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: VerifyDeliveryOtpBody }) =>
      deliveryApi.verifyOtpAndDeliver(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all });
      queryClient.invalidateQueries({ queryKey: vendorOrderKeys.all });
    },
  });
};
