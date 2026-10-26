import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  vendorStaffApi,
  type AddVendorStaffPayload,
  type UpdateVendorStaffPayload,
} from './vendor-staff.api';
import { vendorStaffKeys } from './keys';

export const useVendorStaff = () => {
  return useQuery({
    queryKey: vendorStaffKeys.list(),
    queryFn: () => vendorStaffApi.list(),
  });
};

export const useAddVendorStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddVendorStaffPayload) => vendorStaffApi.add(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorStaffKeys.all });
    },
  });
};

export const useUpdateVendorStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVendorStaffPayload }) =>
      vendorStaffApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorStaffKeys.all });
    },
  });
};

export const useRemoveVendorStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vendorStaffApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorStaffKeys.all });
    },
  });
};
