import { useQuery } from '@tanstack/react-query';
import { DASHBOARD_REFRESH_MS } from '../constants';
import { dashboardApi } from './dashboard.api';
import { dashboardKeys } from './keys';

/** Marketplace dashboard for the admin team; refreshes every minute and when the tab regains focus. */
export const useAdminDashboard = () =>
  useQuery({
    queryKey: dashboardKeys.admin(),
    queryFn: dashboardApi.admin,
    refetchInterval: DASHBOARD_REFRESH_MS,
    refetchOnWindowFocus: true,
  });
