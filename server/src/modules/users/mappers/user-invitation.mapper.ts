import type { UserInvitation } from '../schemas/user-invitation.schema.js';
import type { UserInvitationResponseDto } from '../dto/user-invitation-response.dto.js';

export const toUserInvitationResponseDto = (inv: UserInvitation): UserInvitationResponseDto => ({
  id: inv._id,
  email: inv.email,
  name: inv.name,
  phone: inv.phone,
  role: inv.role,
  shopId: inv.shopId,
  invitedBy: inv.invitedBy,
  status: inv.status,
  expiresAt: inv.expiresAt.toISOString(),
  acceptedAt: inv.acceptedAt ? inv.acceptedAt.toISOString() : null,
  dutyTitle: inv.dutyTitle ?? undefined,
  isExpired: inv.expiresAt.getTime() <= Date.now(),
  createdAt: inv.createdAt instanceof Date ? inv.createdAt.toISOString() : String(inv.createdAt),
});
