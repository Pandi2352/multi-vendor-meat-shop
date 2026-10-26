import { useMutation } from '@tanstack/react-query';
import { http } from '@/lib/http';

export interface ApplyVendorPayload {
  ownerName: string;
  businessName: string;
  phone: string;
  email?: string;
  town: string;
  locality: string;
  addressLine: string;
  pincode: string;
  fssaiNumber: string;
  categoriesOffered?: string[];
  openingTime?: string;
  closingTime?: string;
  notes?: string;
}

export interface VendorApplicationResponse {
  applicationId: string;
  status: string;
  shopId: string;
  message: string;
}

export const applyVendorApi = (data: ApplyVendorPayload): Promise<VendorApplicationResponse> =>
  http.post<VendorApplicationResponse>('/api/v1/vendors/apply', data);

export const useApplyVendor = () => {
  return useMutation({
    mutationFn: (data: ApplyVendorPayload) => applyVendorApi(data),
  });
};
