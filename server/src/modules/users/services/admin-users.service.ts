import { Injectable } from '@nestjs/common';
import { BusinessRuleException, ConflictAppException, NotFoundAppException } from '#common/exceptions';
import { InvitationStatus, Permission, Role, UserStatus, ROLE_PERMISSIONS } from '#common/enums';
import { generateId } from '#common/utils';
import type { PaginatedResult } from '#common/dto';
import { UserRepository } from '../repositories/user.repository.js';
import { UserInvitationRepository } from '../repositories/user-invitation.repository.js';
import { RolePermissionRepository } from '../repositories/role-permission.repository.js';
import type { AdminUsersQueryDto } from '../dto/admin-users-query.dto.js';
import type { AssignRoleDto } from '../dto/assign-role.dto.js';
import type { UpdateUserStatusDto } from '../dto/update-user-status.dto.js';
import type { InviteUserDto } from '../dto/invite-user.dto.js';
import type { UserResponseDto } from '../dto/user-response.dto.js';
import type { UserInvitationResponseDto } from '../dto/user-invitation-response.dto.js';
import type { RoleDetailResponseDto } from '../dto/role-detail-response.dto.js';
import { toUserResponseDto } from '../mappers/user.mapper.js';

const ROLE_DESCRIPTIONS: Record<Role, { name: string; description: string }> = {
  [Role.SUPER_ADMIN]: { name: 'Super Admin', description: 'Platform owner with full access across all operations' },
  [Role.ADMIN]: { name: 'Administrator', description: 'Manages stalls, users, operations, and system configuration' },
  [Role.OPERATIONS]: { name: 'Operations Staff', description: 'Verifies stalls, catalogues cuts, and monitors live orders' },
  [Role.FINANCE]: { name: 'Finance Manager', description: 'Manages ledger, stall settlements, and refund approvals' },
  [Role.SUPPORT]: { name: 'Customer Support', description: 'Resolves tickets, views orders, and handles customer escalations' },
  [Role.VENDOR_OWNER]: { name: 'Butcher Stall Owner', description: 'Controls stall catalog, opening hours, and stock' },
  [Role.VENDOR_STAFF]: { name: 'Stall Staff / Butcher', description: 'Prepares cuts, packs packets, and marks orders ready' },
  [Role.DELIVERY_PARTNER]: { name: 'Delivery Partner', description: 'Picks up packets from butcher stalls and verifies drop-off OTP' },
  [Role.CUSTOMER]: { name: 'Customer', description: 'Places orders, tracks deliveries, and adds delivery addresses' },
};

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly invitationRepo: UserInvitationRepository,
    private readonly rolePermissionRepo: RolePermissionRepository,
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

  async assignRole(adminRole: Role, targetUserId: string, dto: AssignRoleDto): Promise<UserResponseDto> {
    const target = await this.userRepo.findById(targetUserId);
    if (!target) throw new NotFoundAppException('User', targetUserId);

    if (target.role === Role.SUPER_ADMIN && adminRole !== Role.SUPER_ADMIN) {
      throw new BusinessRuleException(undefined, 'Only a Super Admin can modify another Super Admin');
    }

    const updated = await this.userRepo.updateByIdOrThrow(targetUserId, {
      role: dto.role,
      shopId: dto.shopId ?? target.shopId,
    });
    return toUserResponseDto(updated);
  }

  async updateStatus(targetUserId: string, dto: UpdateUserStatusDto): Promise<UserResponseDto> {
    const target = await this.userRepo.findById(targetUserId);
    if (!target) throw new NotFoundAppException('User', targetUserId);
    if (target.role === Role.SUPER_ADMIN) {
      throw new BusinessRuleException(undefined, 'Super Admin status cannot be modified');
    }

    const updated = await this.userRepo.updateByIdOrThrow(targetUserId, { status: dto.status });
    return toUserResponseDto(updated);
  }

  async listInvitations(status?: string): Promise<UserInvitationResponseDto[]> {
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    const items = await this.invitationRepo.findMany(filter, { sort: { createdAt: -1 } });
    return items.map((inv) => ({
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
      createdAt: inv.createdAt instanceof Date ? inv.createdAt.toISOString() : String(inv.createdAt),
    }));
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

    return {
      id: inv._id,
      email: inv.email,
      name: inv.name,
      phone: inv.phone,
      role: inv.role,
      shopId: inv.shopId,
      invitedBy: inv.invitedBy,
      status: inv.status,
      expiresAt: inv.expiresAt.toISOString(),
      acceptedAt: null,
      createdAt: inv.createdAt instanceof Date ? inv.createdAt.toISOString() : String(inv.createdAt),
    };
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
    return {
      id: updated._id,
      email: updated.email,
      name: updated.name,
      phone: updated.phone,
      role: updated.role,
      shopId: updated.shopId,
      invitedBy: updated.invitedBy,
      status: updated.status,
      expiresAt: updated.expiresAt.toISOString(),
      acceptedAt: null,
      createdAt: updated.createdAt instanceof Date ? updated.createdAt.toISOString() : String(updated.createdAt),
    };
  }

  async getRolesWithPermissions(): Promise<RoleDetailResponseDto[]> {
    const roles = Object.values(Role);
    const overrides = await this.rolePermissionRepo.findMany({});
    const overrideMap = new Map(overrides.map((o) => [o.role, o.permissions]));

    const result: RoleDetailResponseDto[] = [];
    for (const r of roles) {
      const userCount = await this.userRepo.count({ role: r });
      const meta = ROLE_DESCRIPTIONS[r] || { name: r, description: '' };
      const permissions = overrideMap.get(r) || [...(ROLE_PERMISSIONS[r] || [])];

      result.push({
        role: r,
        name: meta.name,
        description: meta.description,
        userCount,
        permissions,
        isSystem: r === Role.SUPER_ADMIN || r === Role.CUSTOMER,
      });
    }
    return result;
  }

  async updateRolePermissions(adminId: string, role: Role, permissions: Permission[]): Promise<RoleDetailResponseDto> {
    if (role === Role.SUPER_ADMIN) {
      throw new BusinessRuleException(undefined, 'Super Admin permissions are fixed and cannot be modified');
    }

    const existing = await this.rolePermissionRepo.findByRole(role);
    if (existing) {
      await this.rolePermissionRepo.updateByIdOrThrow(existing._id, {
        permissions,
        updatedBy: adminId,
      });
    } else {
      await this.rolePermissionRepo.create({
        role,
        permissions,
        updatedBy: adminId,
        deletedAt: null,
        deletedBy: null,
      });
    }

    const userCount = await this.userRepo.count({ role });
    const meta = ROLE_DESCRIPTIONS[role] || { name: role, description: '' };

    return {
      role,
      name: meta.name,
      description: meta.description,
      userCount,
      permissions,
      isSystem: role === Role.CUSTOMER,
    };
  }
}
