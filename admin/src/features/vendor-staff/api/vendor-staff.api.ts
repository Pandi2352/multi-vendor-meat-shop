import { http } from '@/lib/http';
import type { components } from '@/types/api.generated';

export type VendorStaffMember = components['schemas']['VendorStaffMemberDto'];
export type VendorStaffList = components['schemas']['VendorStaffListResponseDto'];
export type StaffInvitation = components['schemas']['UserInvitationResponseDto'];
export type InviteStaffPayload = components['schemas']['AddVendorStaffDto'];
export type UpdateStaffPayload = components['schemas']['UpdateVendorStaffDto'];

const staffPath = (id: string) => `/vendor/staff/${encodeURIComponent(id)}`;
const invitationPath = (id: string) => `/vendor/staff/invitations/${encodeURIComponent(id)}`;

/** The shop owner's team: members, pending invites. Every call is for the signed-in owner's shop. */
export const vendorStaffApi = {
  list: (): Promise<VendorStaffList> => http.get<VendorStaffList>('/vendor/staff'),
  /** Response carries the one-time `inviteUrl` and `emailSent`. */
  invite: (data: InviteStaffPayload): Promise<StaffInvitation> => http.post<StaffInvitation>('/vendor/staff', data),
  resendInvite: (id: string): Promise<StaffInvitation> => http.post<StaffInvitation>(`${invitationPath(id)}/resend`),
  cancelInvite: (id: string): Promise<unknown> => http.delete(invitationPath(id)),
  update: (id: string, data: UpdateStaffPayload): Promise<VendorStaffMember> =>
    http.patch<VendorStaffMember>(staffPath(id), data),
  remove: (id: string): Promise<unknown> => http.delete(staffPath(id)),
};
