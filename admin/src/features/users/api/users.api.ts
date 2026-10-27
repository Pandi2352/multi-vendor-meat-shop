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
  /** One-time link; present only in the response that issued/re-sent the invitation. */
  inviteUrl?: string;
  emailSent?: boolean;
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

export interface EditUserPayload {
  name?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  shopId?: string | null;
}

export interface InviteUserPayload {
  email: string;
  name?: string;
  role: UserRole;
  shopId?: string;
}

export interface EditInvitationPayload {
  name?: string;
  role?: UserRole;
  shopId?: string | null;
}

export const usersApi = {
  list: (params?: Record<string, unknown>): Promise<PaginatedResponse<AdminUser>> =>
    http.getPaginated<AdminUser>('/admin/users', params),

  editUser: (userId: string, data: EditUserPayload): Promise<AdminUser> =>
    http.patch<AdminUser>(`/admin/users/${encodeURIComponent(userId)}`, data),

  reinviteUser: (userId: string): Promise<UserInvitation> =>
    http.post<UserInvitation>(`/admin/users/${encodeURIComponent(userId)}/reinvite`),

  revokeUser: (userId: string): Promise<AdminUser> =>
    http.post<AdminUser>(`/admin/users/${encodeURIComponent(userId)}/revoke`),

  assignRole: (userId: string, data: AssignRolePayload): Promise<AdminUser> =>
    http.patch<AdminUser>(`/admin/users/${encodeURIComponent(userId)}/role`, data),

  updateStatus: (userId: string, data: UpdateUserStatusPayload): Promise<AdminUser> =>
    http.patch<AdminUser>(`/admin/users/${encodeURIComponent(userId)}/status`, data),

  listInvitations: (status?: string): Promise<UserInvitation[]> =>
    http.get<UserInvitation[]>('/admin/users/invitations', { params: { status } }),

  invite: (data: InviteUserPayload): Promise<UserInvitation> =>
    http.post<UserInvitation>('/admin/users/invitations', data),

  editInvitation: (id: string, data: EditInvitationPayload): Promise<UserInvitation> =>
    http.patch<UserInvitation>(`/admin/users/invitations/${encodeURIComponent(id)}`, data),

  revokeInvitation: (id: string): Promise<{ success: boolean }> =>
    http.delete<{ success: boolean }>(`/admin/users/invitations/${encodeURIComponent(id)}`),

  resendInvitation: (id: string): Promise<UserInvitation> =>
    http.post<UserInvitation>(`/admin/users/invitations/${encodeURIComponent(id)}/resend`),

  listRoles: (): Promise<RoleDetail[]> =>
    http.get<RoleDetail[]>('/admin/roles'),

  listPermissionsCatalog: (): Promise<string[]> =>
    http.get<string[]>('/admin/roles/permissions/catalog'),

  updateRolePermissions: (role: UserRole, permissions: string[]): Promise<string[]> =>
    http.put<string[]>(`/admin/roles/${encodeURIComponent(role)}/permissions`, { permissions }),
};
