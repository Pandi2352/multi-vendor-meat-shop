import { http } from '@/lib/http';

export interface VendorStaffMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  shopId: string;
  dutyTitle?: string;
  createdAt: string;
}

export interface StaffInvitation {
  id: string;
  email: string;
  name?: string;
  dutyTitle?: string;
  status: string;
  token: string;
  expiresAt: string;
}

export interface VendorStaffListResponse {
  staff: VendorStaffMember[];
  invitations: StaffInvitation[];
}

export interface AddVendorStaffPayload {
  name: string;
  email: string;
  phone?: string;
  dutyTitle?: string;
}

export interface UpdateVendorStaffPayload {
  name?: string;
  phone?: string;
  status?: 'ACTIVE' | 'SUSPENDED';
  dutyTitle?: string;
}

export const vendorStaffApi = {
  list: (): Promise<VendorStaffListResponse> =>
    http.get<VendorStaffListResponse>('/vendor/staff'),

  add: (data: AddVendorStaffPayload): Promise<{ user: VendorStaffMember; invitation: StaffInvitation }> =>
    http.post<{ user: VendorStaffMember; invitation: StaffInvitation }>('/vendor/staff', data),

  update: (id: string, data: UpdateVendorStaffPayload): Promise<VendorStaffMember> =>
    http.patch<VendorStaffMember>(`/vendor/staff/${encodeURIComponent(id)}`, data),

  remove: (id: string): Promise<{ success: boolean }> =>
    http.delete<{ success: boolean }>(`/vendor/staff/${encodeURIComponent(id)}`),
};
