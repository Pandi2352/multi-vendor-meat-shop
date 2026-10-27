import { Injectable } from '@nestjs/common';
import { InvitationStatus, Role, UserStatus } from '#common/enums';
import { BusinessRuleException, NotFoundAppException } from '#common/exceptions';
import { UserRepository } from '../repositories/user.repository.js';
import { UserInvitationRepository } from '../repositories/user-invitation.repository.js';
import { InvitationsService } from './invitations.service.js';
import {
  AddVendorStaffDto,
  UpdateVendorStaffDto,
  VendorStaffListResponseDto,
  VendorStaffMemberDto,
} from '../dto/vendor-staff.dto.js';
import type { User } from '../schemas/user.schema.js';

@Injectable()
export class VendorStaffService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly invitationRepo: UserInvitationRepository,
    private readonly invitations: InvitationsService,
  ) {}

  async listStaff(shopId: string): Promise<VendorStaffListResponseDto> {
    const users = await this.userRepo.findMany(
      { shopId, role: { $in: [Role.VENDOR_STAFF, Role.VENDOR_OWNER] } },
      { sort: { createdAt: -1 } },
    );

    const pendingInvs = await this.invitationRepo.findMany(
      { shopId, status: InvitationStatus.PENDING },
      { sort: { createdAt: -1 } },
    );

    return {
      staff: users.map((u) => this.toStaffMemberDto(u)),
      invitations: pendingInvs.map((inv) => ({
        id: inv._id,
        email: inv.email,
        name: inv.name,
        dutyTitle: inv.dutyTitle || undefined,
        status: inv.status,
        expiresAt: inv.expiresAt.toISOString(),
      })),
    };
  }

  /**
   * Invites a staff member to this shop. Never changes an existing account here: the staff role is
   * applied when the invitation is accepted. Only customers (or this shop's own staff) can be added,
   * so a shop owner can't take over an admin, another shop's team or a delivery partner.
   */
  async addStaff(shopId: string, actorId: string, dto: AddVendorStaffDto, shopName?: string) {
    const email = dto.email.toLowerCase().trim();
    const existingUser = await this.userRepo.findByEmail(email);
    const isOwnStaff = existingUser?.role === Role.VENDOR_STAFF && existingUser.shopId === shopId;
    if (existingUser && existingUser.role !== Role.CUSTOMER && !isOwnStaff) {
      throw new BusinessRuleException(
        undefined,
        `${email} already has a portal account and can't be added to this shop.`,
      );
    }

    const user =
      existingUser ??
      (await this.userRepo.create({
        email,
        name: dto.name,
        phone: dto.phone,
        role: Role.VENDOR_STAFF,
        status: UserStatus.PENDING_VERIFICATION,
        shopId,
        dutyTitle: dto.dutyTitle,
        deletedAt: null,
        deletedBy: null,
      }));

    const invitation = await this.invitations.issue({
      email,
      role: Role.VENDOR_STAFF,
      invitedBy: actorId,
      name: dto.name,
      phone: dto.phone,
      shopId,
      shopName,
      dutyTitle: dto.dutyTitle,
    });

    return {
      user: this.toStaffMemberDto(user),
      invitation: {
        id: invitation.id,
        inviteUrl: invitation.inviteUrl,
        emailSent: invitation.emailSent,
        expiresAt: invitation.expiresAt,
      },
    };
  }

  async updateStaff(shopId: string, staffId: string, dto: UpdateVendorStaffDto): Promise<VendorStaffMemberDto> {
    const user = await this.userRepo.findById(staffId);
    if (!user || user.shopId !== shopId) {
      throw new NotFoundAppException('Stall Staff Member', staffId);
    }

    const updated = await this.userRepo.updateByIdOrThrow(staffId, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.dutyTitle !== undefined && { dutyTitle: dto.dutyTitle }),
    });

    return this.toStaffMemberDto(updated);
  }

  async removeStaff(shopId: string, staffId: string): Promise<{ success: boolean }> {
    const user = await this.userRepo.findById(staffId);
    if (!user || user.shopId !== shopId) {
      throw new NotFoundAppException('Stall Staff Member', staffId);
    }

    if (user.role === Role.VENDOR_OWNER) {
      throw new BusinessRuleException(undefined, 'Cannot remove the stall owner from staff roster');
    }

    await this.userRepo.updateByIdOrThrow(staffId, {
      shopId: null,
      status: UserStatus.SUSPENDED,
    });

    return { success: true };
  }

  private toStaffMemberDto(user: User): VendorStaffMemberDto {
    return {
      id: user._id,
      name: user.name || 'Staff Member',
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      shopId: user.shopId || '',
      dutyTitle: user.dutyTitle || undefined,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
