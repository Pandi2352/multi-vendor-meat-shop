import { useQuery } from '@tanstack/react-query';
import { isVendorRole } from '@/constants/roles';
import { useCurrentUser } from '@/features/auth';
import { vendorStatusApi, vendorStatusKeys } from './vendor-status.api';

/**
 * The signed-in vendor's shop approval status. Only fetched for shop owners and staff; refreshed
 * when the tab regains focus so a suspension or re-activation shows up without a reload.
 */
export const useVendorStatus = () => {
  const role = useCurrentUser()?.role;
  return useQuery({
    queryKey: vendorStatusKeys.all,
    queryFn: vendorStatusApi.get,
    enabled: role !== undefined && isVendorRole(role),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
};
