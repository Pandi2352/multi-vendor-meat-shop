import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerTag } from '#common/constants';
import { Permission, Role } from '#common/enums';
import {
  ApiOkEnvelope,
  ApiStandardResponses,
  Auth,
  CurrentUser,
} from '#common/decorators';
import { AdminUsersService } from '../services/admin-users.service.js';
import { RoleDetailResponseDto } from '../dto/role-detail-response.dto.js';
import { UpdateRolePermissionsDto } from '../dto/update-role-permissions.dto.js';

@ApiTags(SwaggerTag.AUTH)
@Auth(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin/roles')
export class AdminRolesController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all roles with permissions, user count, and description' })
  @ApiOkEnvelope(RoleDetailResponseDto)
  @ApiStandardResponses()
  listRoles() {
    return this.adminUsersService.getRolesWithPermissions();
  }

  @Get('permissions/catalog')
  @ApiOperation({ summary: 'List all platform permissions grouped by operational domain' })
  @ApiStandardResponses()
  listPermissionCatalog() {
    return Object.values(Permission);
  }

  @Put(':role/permissions')
  @ApiOperation({ summary: 'Update or customize permissions for a role' })
  @ApiOkEnvelope(RoleDetailResponseDto)
  @ApiStandardResponses()
  updatePermissions(
    @CurrentUser('id') adminId: string,
    @Param('role') role: Role,
    @Body() dto: UpdateRolePermissionsDto,
  ) {
    return this.adminUsersService.updateRolePermissions(adminId, role, dto.permissions);
  }
}
