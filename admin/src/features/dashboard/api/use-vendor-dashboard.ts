import { useQuery } from '@tanstack/react-query';
import { DASHBOARD_REFRESH_MS } from '../constants';
import { dashboardApi } from './dashboard.api';
import { dashboardKeys } from './keys';

/** The signed-in shop's dashboard; refreshes every minute and when the tab regains focus. */
export const useVendorDashboard = () =>
  useQuery({
    queryKey: dashboardKeys.vendor(),
    queryFn: dashboardApi.vendor,
    refetchInterval: DASHBOARD_REFRESH_MS,
    refetchOnWindowFocus: true,
  });
