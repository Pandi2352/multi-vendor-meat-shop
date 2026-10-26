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
import { AdminRolesService } from '../services/admin-roles.service.js';
import { RoleDetailResponseDto } from '../dto/role-detail-response.dto.js';
import { UpdateRolePermissionsDto } from '../dto/update-role-permissions.dto.js';

@ApiTags(SwaggerTag.AUTH)
@Auth(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin/roles')
export class AdminRolesController {
  constructor(private readonly adminRolesService: AdminRolesService) {}

  @Get()
  @ApiOperation({ summary: 'List all roles with permissions, user count, and description' })
  @ApiOkEnvelope(RoleDetailResponseDto)
  @ApiStandardResponses()
  listRoles() {
    return this.adminRolesService.getRolesWithPermissions();
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
    return this.adminRolesService.updateRolePermissions(adminId, role, dto.permissions);
  }
}
