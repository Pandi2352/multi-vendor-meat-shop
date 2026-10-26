import { http, type PaginatedResponse } from '@/lib/http';

export interface VendorShopSummary {
  id: string;
  name: string;
  phone: string;
  status: string;
  line1: string;
  locality: string;
  city: string;
  district: string;
  pincode: string;
}

export type VendorStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

export interface VendorProfile {
  id: string;
  userId: string;
  businessName: string;
  ownerName: string;
  fssaiNumber: string;
  fssaiDocumentUrl?: string;
  panNumber?: string;
  gstin?: string;
  status: VendorStatus;
  rejectionReason?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  shop?: VendorShopSummary;
}

export interface AdminCreateVendorPayload {
  ownerName: string;
  phone: string;
  email?: string;
  shopName: string;
  fssaiNumber: string;
  fssaiDocumentUrl?: string;
  address: {
    line1: string;
    locality: string;
    city: string;
    district: string;
    pincode: string;
    location?: { lat: number; lng: number };
  };
  openingTime?: string;
  closingTime?: string;
  serviceRadiusKm?: number;
}

export interface VerifyVendorPayload {
  status: 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  rejectionReason?: string;
}

export const vendorsApi = {
  list: (params?: Record<string, unknown>): Promise<PaginatedResponse<VendorProfile>> =>
    http.getPaginated<VendorProfile>('/api/v1/admin/vendors', params),

  create: (data: AdminCreateVendorPayload): Promise<VendorProfile> =>
    http.post<VendorProfile>('/api/v1/admin/vendors', data),

  verify: (id: string, data: VerifyVendorPayload): Promise<VendorProfile> =>
    http.patch<VendorProfile>(`/api/v1/admin/vendors/${encodeURIComponent(id)}/verify`, data),
};
