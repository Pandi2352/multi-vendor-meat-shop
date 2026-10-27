import { http } from '@/lib/http';
import type { components } from '@/types/api.generated';

export type VendorAccessStatus = components['schemas']['VendorAccessStatusDto'];

export const vendorStatusApi = {
  get: (): Promise<VendorAccessStatus> => http.get<VendorAccessStatus>('/vendor/status'),
};

export const vendorStatusKeys = {
  all: ['vendor-status'] as const,
};
