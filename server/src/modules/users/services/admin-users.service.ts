import { Injectable } from '@nestjs/common';
import { BusinessRuleException, ConflictAppException, NotFoundAppException } from '#common/exceptions';
import { InvitationStatus, Role, UserStatus } from '#common/enums';
import { generateId } from '#common/utils';
import type { PaginatedResult } from '#common/dto';
import { UserRepository } from '../repositories/user.repository.js';
import { UserInvitationRepository } from '../repositories/user-invitation.repository.js';
import type { AdminUsersQueryDto } from '../dto/admin-users-query.dto.js';
import type { AssignRoleDto } from '../dto/assign-role.dto.js';
import type { UpdateUserStatusDto } from '../dto/update-user-status.dto.js';
import type { InviteUserDto } from '../dto/invite-user.dto.js';
import type { AdminEditUserDto } from '../dto/admin-edit-user.dto.js';
import type { EditInvitationDto } from '../dto/edit-invitation.dto.js';
import type { UserResponseDto } from '../dto/user-response.dto.js';
import type { UserInvitationResponseDto } from '../dto/user-invitation-response.dto.js';
import { toUserResponseDto } from '../mappers/user.mapper.js';
import { toUserInvitationResponseDto } from '../mappers/user-invitation.mapper.js';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly invitationRepo: UserInvitationRepository,
  ) {}

  async listUsers(query: AdminUsersQueryDto): Promise<PaginatedResult<UserResponseDto>> {
    const filter: Record<string, unknown> = {};
    if (query.role) filter.role = query.role;
    if (query.status) filter.status = query.status;

    const result = await this.userRepo.paginate(filter, query, {
      sortable: ['createdAt', 'email', 'name', 'role', 'status'],
      searchable: ['name', 'email', 'phone'],
      defaultSort: '-createdAt',
    });
    return result.map(toUserResponseDto);
  }

  async editUser(adminRole: Role, targetUserId: string, dto: AdminEditUserDto): Promise<UserResponseDto> {
    const target = await this.userRepo.findById(targetUserId);
    if (!target) throw new NotFoundAppException('User', targetUserId);

    if (target.role === Role.SUPER_ADMIN && adminRole !== Role.SUPER_ADMIN) {
      throw new BusinessRuleException(undefined, 'Only a Super Admin can modify another Super Admin');
    }
    if (dto.role === Role.SUPER_ADMIN && adminRole !== Role.SUPER_ADMIN) {
      throw new BusinessRuleException(undefined, 'Only a Super Admin can grant Super Admin role');
    }

    const updates: Record<string, unknown> = {};
    if (dto.name !== undefined) updates.name = dto.name;
    if (dto.phone !== undefined) updates.phone = dto.phone;
    if (dto.role !== undefined) updates.role = dto.role;
    if (dto.status !== undefined) updates.status = dto.status;
    if (dto.shopId !== undefined) updates.shopId = dto.shopId;

    const updated = await this.userRepo.updateByIdOrThrow(targetUserId, updates);
    return toUserResponseDto(updated);
  }

  async assignRole(adminRole: Role, targetUserId: string, dto: AssignRoleDto): Promise<UserResponseDto> {
    return this.editUser(adminRole, targetUserId, { role: dto.role, shopId: dto.shopId });
  }

  async updateStatus(targetUserId: string, dto: UpdateUserStatusDto): Promise<UserResponseDto> {
    return this.editUser(Role.ADMIN, targetUserId, { status: dto.status });
  }

  async revokeUser(adminRole: Role, targetUserId: string): Promise<UserResponseDto> {
    const target = await this.userRepo.findById(targetUserId);
    if (!target) throw new NotFoundAppException('User', targetUserId);
    if (target.role === Role.SUPER_ADMIN) {
      throw new BusinessRuleException(undefined, 'Super Admin cannot be revoked or suspended');
    }

    const updated = await this.userRepo.updateByIdOrThrow(targetUserId, { status: UserStatus.SUSPENDED });

    const existingInv = await this.invitationRepo.findByEmail(target.email);
    if (existingInv && existingInv.status === InvitationStatus.PENDING) {
      await this.invitationRepo.updateByIdOrThrow(existingInv._id, { status: InvitationStatus.REVOKED });
    }

    return toUserResponseDto(updated);
  }

  async reinviteUser(adminId: string, targetUserId: string): Promise<UserInvitationResponseDto> {
    const target = await this.userRepo.findById(targetUserId);
    if (!target) throw new NotFoundAppException('User', targetUserId);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const token = generateId();

    const existingInv = await this.invitationRepo.findByEmail(target.email);
    const inv = existingInv
      ? await this.invitationRepo.updateByIdOrThrow(existingInv._id, {
          name: target.name || existingInv.name,
          role: target.role,
          shopId: target.shopId ?? null,
          invitedBy: adminId,
          token,
          status: InvitationStatus.PENDING,
          expiresAt,
        })
      : await this.invitationRepo.create({
          email: target.email,
          name: target.name,
          role: target.role,
          shopId: target.shopId ?? null,
          invitedBy: adminId,
          token,
          status: InvitationStatus.PENDING,
          expiresAt,
          acceptedAt: null,
          deletedAt: null,
          deletedBy: null,
        });

    return toUserInvitationResponseDto(inv);
  }

  async listInvitations(status?: string): Promise<UserInvitationResponseDto[]> {
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    const items = await this.invitationRepo.findMany(filter, { sort: { createdAt: -1 } });
    return items.map(toUserInvitationResponseDto);
  }

  async inviteUser(adminId: string, dto: InviteUserDto): Promise<UserInvitationResponseDto> {
    const email = dto.email.toLowerCase().trim();
    const existingUser = await this.userRepo.findByEmail(email);
    if (existingUser && existingUser.status === UserStatus.ACTIVE) {
      throw new ConflictAppException('User already has an active account on the marketplace');
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const token = generateId();

    const existingInv = await this.invitationRepo.findByEmail(email);
    const inv = existingInv
      ? await this.invitationRepo.updateByIdOrThrow(existingInv._id, {
          role: dto.role,
          name: dto.name,
          shopId: dto.shopId ?? null,
          invitedBy: adminId,
          token,
          status: InvitationStatus.PENDING,
          expiresAt,
        })
      : await this.invitationRepo.create({
          email,
          name: dto.name,
          role: dto.role,
          shopId: dto.shopId ?? null,
          invitedBy: adminId,
          token,
          status: InvitationStatus.PENDING,
          expiresAt,
          acceptedAt: null,
          deletedAt: null,
          deletedBy: null,
        });

    return toUserInvitationResponseDto(inv);
  }

  async editInvitation(invitationId: string, dto: EditInvitationDto): Promise<UserInvitationResponseDto> {
    const inv = await this.invitationRepo.findByIdOrThrow(invitationId);
    const updates: Record<string, unknown> = {};
    if (dto.name !== undefined) updates.name = dto.name;
    if (dto.role !== undefined) updates.role = dto.role;
    if (dto.shopId !== undefined) updates.shopId = dto.shopId;

    const updated = await this.invitationRepo.updateByIdOrThrow(inv._id, updates);
    return toUserInvitationResponseDto(updated);
  }

  async revokeInvitation(id: string): Promise<{ success: boolean }> {
    await this.invitationRepo.updateByIdOrThrow(id, { status: InvitationStatus.REVOKED });
    return { success: true };
  }

  async resendInvitation(id: string): Promise<UserInvitationResponseDto> {
    const inv = await this.invitationRepo.findByIdOrThrow(id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const updated = await this.invitationRepo.updateByIdOrThrow(inv._id, {
      expiresAt,
      status: InvitationStatus.PENDING,
    });
    return toUserInvitationResponseDto(updated);
  }
}
