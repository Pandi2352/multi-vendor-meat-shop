import { Injectable } from '@nestjs/common';
import { InvitationStatus, Role, UserStatus } from '#common/enums';
import { AppException, BusinessRuleException, ErrorCode, NotFoundAppException } from '#common/exceptions';
import { generateId } from '#common/utils';
import { UserRepository } from '../repositories/user.repository.js';
import { UserInvitationRepository } from '../repositories/user-invitation.repository.js';
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
        token: inv.token,
        expiresAt: inv.expiresAt.toISOString(),
      })),
    };
  }

  async addStaff(shopId: string, actorId: string, dto: AddVendorStaffDto) {
    const existingUser = await this.userRepo.findByEmail(dto.email);
    if (existingUser && existingUser.shopId && existingUser.shopId !== shopId) {
      throw new BusinessRuleException(
        undefined,
        `User ${dto.email} is already registered with another stall.`,
      );
    }

    const token = generateId();
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

    const existingInv = await this.invitationRepo.findByEmail(dto.email);
    const invitation = existingInv
      ? await this.invitationRepo.updateByIdOrThrow(existingInv._id, {
          name: dto.name,
          phone: dto.phone,
          role: Role.VENDOR_STAFF,
          shopId,
          dutyTitle: dto.dutyTitle,
          invitedBy: actorId,
          token,
          status: InvitationStatus.PENDING,
          expiresAt,
        })
      : await this.invitationRepo.create({
          email: dto.email.toLowerCase().trim(),
          name: dto.name,
          phone: dto.phone,
          role: Role.VENDOR_STAFF,
          shopId,
          dutyTitle: dto.dutyTitle,
          invitedBy: actorId,
          token,
          status: InvitationStatus.PENDING,
          expiresAt,
          acceptedAt: null,
          deletedAt: null,
          deletedBy: null,
        });

    let user = existingUser;
    if (!user) {
      user = await this.userRepo.create({
        email: dto.email.toLowerCase().trim(),
        name: dto.name,
        phone: dto.phone,
        role: Role.VENDOR_STAFF,
        status: UserStatus.PENDING_VERIFICATION,
        shopId,
        dutyTitle: dto.dutyTitle,
        deletedAt: null,
        deletedBy: null,
      });
    } else {
      user = await this.userRepo.updateByIdOrThrow(user._id, {
        name: dto.name || user.name,
        phone: dto.phone || user.phone,
        shopId,
        dutyTitle: dto.dutyTitle || user.dutyTitle,
        role: Role.VENDOR_STAFF,
      });
    }

    return {
      user: this.toStaffMemberDto(user),
      invitation: {
        id: invitation._id,
        token: invitation.token,
        expiresAt: invitation.expiresAt.toISOString(),
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
