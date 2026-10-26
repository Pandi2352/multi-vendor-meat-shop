import { Injectable } from '@nestjs/common';
import { BusinessRuleException } from '#common/exceptions';
import { Permission, Role, ROLE_PERMISSIONS } from '#common/enums';
import { UserRepository } from '../repositories/user.repository.js';
import { RolePermissionRepository } from '../repositories/role-permission.repository.js';
import type { RoleDetailResponseDto } from '../dto/role-detail-response.dto.js';

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
export class AdminRolesService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly rolePermissionRepo: RolePermissionRepository,
  ) {}

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
