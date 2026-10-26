import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  productsApi,
  type CreateProductPayload,
  type UpdateProductPayload,
} from './products.api';
import { productKeys } from './keys';

export const useVendorProducts = (filters: Record<string, unknown> = {}) => {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productsApi.list(filters),
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: () => productsApi.listCategories(),
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductPayload) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductPayload }) =>
      productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

export const useArchiveProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};
