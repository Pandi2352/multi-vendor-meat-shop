import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  vendorsApi,
  type AdminCreateVendorPayload,
  type VerifyVendorPayload,
} from './vendors.api';
import { vendorKeys } from './keys';

export const useAdminVendors = (filters: Record<string, unknown> = {}) => {
  return useQuery({
    queryKey: vendorKeys.list(filters),
    queryFn: () => vendorsApi.list(filters),
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminCreateVendorPayload) => vendorsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
    },
  });
};

export const useVerifyVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VerifyVendorPayload }) =>
      vendorsApi.verify(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
    },
  });
};
