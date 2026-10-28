import { http, type PaginatedResponse } from '@/lib/http';
import type { UserInvitation } from '@/features/users';

export interface VendorShopSummary {
  id: string;
  name: string;
  nameTa?: string;
  phone: string;
  status: string;
  line1: string;
  locality: string;
  city: string;
  district: string;
  pincode: string;
  openingTime?: string;
  closingTime?: string;
  serviceRadiusKm?: number;
}

export type VendorStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'RESUBMISSION_REQUIRED'
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
  municipalPermitNumber?: string;
  municipalPermitUrl?: string;
  allowedCategories?: string[];
  panNumber?: string;
  gstin?: string;
  status: VendorStatus;
  rejectionReason?: string;
  verificationNotes?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  shop?: VendorShopSummary;
  /** Set when the action invited the owner (create / approve); carries the one-time link. */
  invitation?: UserInvitation;
}

export interface AdminCreateVendorPayload {
  ownerName: string;
  phone: string;
  /** Required: the owner signs in with it and the invitation is emailed there. */
  email: string;
  shopName: string;
  shopNameTa?: string;
  fssaiNumber: string;
  fssaiDocumentUrl?: string;
  municipalPermitNumber?: string;
  allowedCategories?: string[];
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

export interface AdminUpdateVendorPayload {
  ownerName?: string;
  phone?: string;
  shopName?: string;
  shopNameTa?: string;
  fssaiNumber?: string;
  fssaiDocumentUrl?: string;
  municipalPermitNumber?: string;
  line1?: string;
  locality?: string;
  city?: string;
  pincode?: string;
  openingTime?: string;
  closingTime?: string;
  serviceRadiusKm?: number;
}

export interface VerifyVendorPayload {
  status: VendorStatus;
  rejectionReason?: string;
  notes?: string;
  allowedCategories?: string[];
  municipalPermitNumber?: string;
}

export interface UpdatePermissionsPayload {
  allowedCategories: string[];
}

export const vendorsApi = {
  list: (params?: Record<string, unknown>): Promise<PaginatedResponse<VendorProfile>> =>
    http.getPaginated<VendorProfile>('/admin/vendors', params),

  getById: (id: string): Promise<VendorProfile> =>
    http.get<VendorProfile>(`/admin/vendors/${encodeURIComponent(id)}`),

  create: (data: AdminCreateVendorPayload): Promise<VendorProfile> =>
    http.post<VendorProfile>('/admin/vendors', data),

  update: (id: string, data: AdminUpdateVendorPayload): Promise<VendorProfile> =>
    http.patch<VendorProfile>(`/admin/vendors/${encodeURIComponent(id)}`, data),

  verify: (id: string, data: VerifyVendorPayload): Promise<VendorProfile> =>
    http.patch<VendorProfile>(`/admin/vendors/${encodeURIComponent(id)}/verify`, data),

  updatePermissions: (id: string, data: UpdatePermissionsPayload): Promise<VendorProfile> =>
    http.patch<VendorProfile>(`/admin/vendors/${encodeURIComponent(id)}/permissions`, data),
};
