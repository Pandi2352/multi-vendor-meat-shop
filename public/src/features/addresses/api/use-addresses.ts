import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addressKeys } from './keys';
import { addressesApi, type CreateAddressBody } from './addresses.api';

export const useAddresses = () => {
  return useQuery({
    queryKey: addressKeys.lists(),
    queryFn: () => addressesApi.list(),
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAddressBody) => addressesApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all });
    },
  });
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressesApi.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all });
    },
  });
};
