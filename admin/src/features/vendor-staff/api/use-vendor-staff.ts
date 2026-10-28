import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vendorStaffApi, type InviteStaffPayload, type UpdateStaffPayload } from './vendor-staff.api';
import { vendorStaffKeys } from './keys';

export const useVendorStaff = () => useQuery({ queryKey: vendorStaffKeys.list(), queryFn: vendorStaffApi.list });

/** A mutation that refreshes the team list when it succeeds. */
const useStaffMutation = <TArgs, TResult>(mutationFn: (args: TArgs) => Promise<TResult>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vendorStaffKeys.all }),
  });
};

export const useInviteStaff = () => useStaffMutation((data: InviteStaffPayload) => vendorStaffApi.invite(data));
export const useResendStaffInvite = () => useStaffMutation((id: string) => vendorStaffApi.resendInvite(id));
export const useCancelStaffInvite = () => useStaffMutation((id: string) => vendorStaffApi.cancelInvite(id));
export const useUpdateStaff = () =>
  useStaffMutation(({ id, data }: { id: string; data: UpdateStaffPayload }) => vendorStaffApi.update(id, data));
export const useRemoveStaff = () => useStaffMutation((id: string) => vendorStaffApi.remove(id));
