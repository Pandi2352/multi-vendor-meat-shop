import { Injectable } from '@nestjs/common';
import { InvitationStatus, Role, UserStatus } from '#common/enums';
import { BusinessRuleException, NotFoundAppException } from '#common/exceptions';
import { UserRepository } from '../repositories/user.repository.js';
import { UserInvitationRepository } from '../repositories/user-invitation.repository.js';
import { InvitationsService } from './invitations.service.js';
import { ShopNameLookup } from './shop-name.lookup.js';
import { canJoinShopAsStaff } from './staff-invite-rules.js';
import type {
  AddVendorStaffDto,
  UpdateVendorStaffDto,
  VendorStaffListResponseDto,
  VendorStaffMemberDto,
} from '../dto/vendor-staff.dto.js';
import type { UserInvitationResponseDto } from '../dto/user-invitation-response.dto.js';
import { toUserInvitationResponseDto } from '../mappers/user-invitation.mapper.js';
import type { User } from '../schemas/user.schema.js';
import type { UserInvitation } from '../schemas/user-invitation.schema.js';

const TEAM_ROLES = [Role.VENDOR_OWNER, Role.VENDOR_STAFF];

/**
 * A shop's team, managed by its owner. Invites never touch the person's account: the staff role
 * and shop are applied when they accept. Removing someone takes them off the shop but leaves their
 * personal (customer) account.
 */
@Injectable()
export class VendorStaffService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly invitationRepo: UserInvitationRepository,
    private readonly invitations: InvitationsService,
    private readonly shopNames: ShopNameLookup,
  ) {}

  async listStaff(shopId: string): Promise<VendorStaffListResponseDto> {
    const [members, pending] = await Promise.all([
      // Pending accounts are invitees; they are listed under invitations instead.
      this.userRepo.findMany({ shopId, role: { $in: TEAM_ROLES }, status: { $ne: UserStatus.PENDING_VERIFICATION } }),
      this.invitationRepo.findMany(
        { shopId, role: Role.VENDOR_STAFF, status: InvitationStatus.PENDING },
        { sort: { createdAt: -1 } },
      ),
    ]);

    const ownerFirst = (a: User, b: User) =>
      Number(b.role === Role.VENDOR_OWNER) - Number(a.role === Role.VENDOR_OWNER) ||
      (a.name ?? a.email).localeCompare(b.name ?? b.email);

    return {
      staff: members.sort(ownerFirst).map((user) => this.toStaffMemberDto(user)),
      invitations: pending.map(toUserInvitationResponseDto),
    };
  }

  async addStaff(shopId: string, actorId: string, dto: AddVendorStaffDto): Promise<UserInvitationResponseDto> {
    const email = dto.email.toLowerCase().trim();
    const [account, existingInvite] = await Promise.all([
      this.userRepo.findByEmail(email),
      this.invitationRepo.findByEmail(email),
    ]);

    if (account?.shopId === shopId && account.status !== UserStatus.PENDING_VERIFICATION) {
      throw new BusinessRuleException(undefined, `${email} is already on your team.`);
    }
    if (!canJoinShopAsStaff(account, shopId)) {
      throw new BusinessRuleException(undefined, `${email} can’t be added to this shop (it already has a portal account, or is suspended).`);
    }
    // One invitation per email: don't overwrite another shop's (or the admin team's) pending invite.
    if (this.isLiveInvite(existingInvite) && existingInvite.shopId !== shopId) {
      throw new BusinessRuleException(undefined, `${email} has a pending invitation from somewhere else.`);
    }

    return this.invitations.issue({
      email,
      role: Role.VENDOR_STAFF,
      invitedBy: actorId,
      name: dto.name,
      phone: dto.phone,
      shopId,
      shopName: await this.shopNames.nameOf(shopId),
      dutyTitle: dto.dutyTitle,
    });
  }

  /** New link for a pending invite (the old one stops working). */
  async resendInvitation(shopId: string, actorId: string, invitationId: string): Promise<UserInvitationResponseDto> {
    await this.findOwnInvitation(shopId, invitationId);
    return this.invitations.resend(invitationId, actorId, await this.shopNames.nameOf(shopId));
  }

  async cancelInvitation(shopId: string, invitationId: string): Promise<{ success: boolean }> {
    await this.findOwnInvitation(shopId, invitationId);
    await this.invitationRepo.updateByIdOrThrow(invitationId, { status: InvitationStatus.REVOKED });
    return { success: true };
  }

  async updateStaff(shopId: string, staffId: string, dto: UpdateVendorStaffDto): Promise<VendorStaffMemberDto> {
    const user = await this.findOwnStaff(shopId, staffId);
    if (dto.status !== undefined && user.status === UserStatus.PENDING_VERIFICATION) {
      throw new BusinessRuleException(undefined, 'This person hasn’t accepted their invite yet. Resend or cancel the invite instead.');
    }

    const updated = await this.userRepo.updateByIdOrThrow(staffId, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.dutyTitle !== undefined && { dutyTitle: dto.dutyTitle }),
    });
    return this.toStaffMemberDto(updated);
  }

  /**
   * Takes someone off the shop. Their account goes back to a plain customer account (they keep
   * shopping, and another shop can hire them); the portal stops working for them on their next request.
   */
  async removeStaff(shopId: string, staffId: string): Promise<{ success: boolean }> {
    const user = await this.findOwnStaff(shopId, staffId);
    await this.userRepo.updateByIdOrThrow(staffId, {
      role: Role.CUSTOMER,
      shopId: null,
      dutyTitle: null,
      ...(user.status === UserStatus.SUSPENDED && { status: UserStatus.ACTIVE }),
    });
    await this.invitationRepo.updateOne(
      { email: user.email, shopId, status: InvitationStatus.PENDING },
      { $set: { status: InvitationStatus.REVOKED } },
    );
    return { success: true };
  }

  /** A staff member of this shop. The owner's own record can't be managed from the staff list. */
  private async findOwnStaff(shopId: string, staffId: string): Promise<User> {
    const user = await this.userRepo.findById(staffId);
    if (!user || user.shopId !== shopId) throw new NotFoundAppException('Stall Staff Member', staffId);
    if (user.role === Role.VENDOR_OWNER) {
      throw new BusinessRuleException(undefined, 'The shop owner can’t be changed or removed from the staff list');
    }
    return user;
  }

  private async findOwnInvitation(shopId: string, invitationId: string): Promise<UserInvitation> {
    const invitation = await this.invitationRepo.findById(invitationId);
    if (!invitation || invitation.shopId !== shopId || invitation.role !== Role.VENDOR_STAFF) {
      throw new NotFoundAppException('Staff invitation', invitationId);
    }
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BusinessRuleException(undefined, 'This invitation has already been accepted or cancelled.');
    }
    return invitation;
  }

  private isLiveInvite(invitation: UserInvitation | null): invitation is UserInvitation {
    return !!invitation && invitation.status === InvitationStatus.PENDING && invitation.expiresAt.getTime() > Date.now();
  }

  private toStaffMemberDto(user: User): VendorStaffMemberDto {
    return {
      id: user._id,
      name: user.name || 'Staff member',
      email: user.email,
      phone: user.phone,
      role: user.role === Role.VENDOR_OWNER ? Role.VENDOR_OWNER : Role.VENDOR_STAFF,
      status: user.status,
      dutyTitle: user.dutyTitle || undefined,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
