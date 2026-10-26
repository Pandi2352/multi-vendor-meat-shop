import { http, type PaginatedResponse } from '@/lib/http';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'OPERATIONS'
  | 'FINANCE'
  | 'SUPPORT'
  | 'VENDOR_OWNER'
  | 'VENDOR_STAFF'
  | 'DELIVERY_PARTNER'
  | 'CUSTOMER';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  shopId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserInvitation {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: UserRole;
  shopId?: string | null;
  invitedBy: string;
  token?: string;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt?: string | null;
  createdAt: string;
}

export interface RoleDetail {
  role: UserRole;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  isSystem: boolean;
}

export interface AssignRolePayload {
  role: UserRole;
  shopId?: string;
}

export interface UpdateUserStatusPayload {
  status: UserStatus;
}

export interface InviteUserPayload {
  email: string;
  name?: string;
  role: UserRole;
  shopId?: string;
}

export const usersApi = {
  list: (params?: Record<string, unknown>): Promise<PaginatedResponse<AdminUser>> =>
    http.getPaginated<AdminUser>('/api/v1/admin/users', params),

  assignRole: (userId: string, data: AssignRolePayload): Promise<AdminUser> =>
    http.patch<AdminUser>(`/api/v1/admin/users/${encodeURIComponent(userId)}/role`, data),

  updateStatus: (userId: string, data: UpdateUserStatusPayload): Promise<AdminUser> =>
    http.patch<AdminUser>(`/api/v1/admin/users/${encodeURIComponent(userId)}/status`, data),

  listInvitations: (status?: string): Promise<UserInvitation[]> =>
    http.get<UserInvitation[]>('/api/v1/admin/users/invitations', { params: { status } }),

  invite: (data: InviteUserPayload): Promise<UserInvitation> =>
    http.post<UserInvitation>('/api/v1/admin/users/invitations', data),

  revokeInvitation: (id: string): Promise<{ success: boolean }> =>
    http.delete<{ success: boolean }>(`/api/v1/admin/users/invitations/${encodeURIComponent(id)}`),

  resendInvitation: (id: string): Promise<UserInvitation> =>
    http.post<UserInvitation>(`/api/v1/admin/users/invitations/${encodeURIComponent(id)}/resend`),

  listRoles: (): Promise<RoleDetail[]> =>
    http.get<RoleDetail[]>('/api/v1/admin/roles'),

  listPermissionsCatalog: (): Promise<string[]> =>
    http.get<string[]>('/api/v1/admin/roles/permissions/catalog'),

  updateRolePermissions: (role: UserRole, permissions: string[]): Promise<string[]> =>
    http.put<string[]>(`/api/v1/admin/roles/${encodeURIComponent(role)}/permissions`, { permissions }),
};
