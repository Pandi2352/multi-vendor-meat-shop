import { http } from '@/lib/http';
import type { components } from '@/types/api.generated';

export type VendorDashboard = components['schemas']['VendorDashboardResponseDto'];
export type AdminDashboard = components['schemas']['AdminDashboardResponseDto'];
export type DashboardOrderPreview = components['schemas']['DashboardOrderPreviewDto'];
export type StockAlert = components['schemas']['StockAlertDto'];
export type VendorPayoutSummary = components['schemas']['VendorPayoutSummaryDto'];

export const dashboardApi = {
  vendor: (): Promise<VendorDashboard> => http.get<VendorDashboard>('/vendor/dashboard'),
  admin: (): Promise<AdminDashboard> => http.get<AdminDashboard>('/admin/dashboard'),
};
