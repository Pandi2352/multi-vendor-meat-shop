import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerTag } from '#common/constants';
import { Role } from '#common/enums';
import {
  ApiCreatedEnvelope,
  ApiOkEnvelope,
  ApiPaginatedResponse,
  ApiStandardResponses,
  Auth,
  CurrentUser,
  UuidParam,
} from '#common/decorators';
import { AdminUsersService } from '../services/admin-users.service.js';
import { AdminUsersQueryDto } from '../dto/admin-users-query.dto.js';
import { AssignRoleDto } from '../dto/assign-role.dto.js';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto.js';
import { InviteUserDto } from '../dto/invite-user.dto.js';
import { UserResponseDto } from '../dto/user-response.dto.js';
import { UserInvitationResponseDto } from '../dto/user-invitation-response.dto.js';

@ApiTags(SwaggerTag.AUTH)
@Auth(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users on the platform (paginated, with search and role filters)' })
  @ApiPaginatedResponse(UserResponseDto)
  @ApiStandardResponses()
  list(@Query() query: AdminUsersQueryDto) {
    return this.adminUsersService.listUsers(query);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Assign or update a user role' })
  @ApiOkEnvelope(UserResponseDto)
  @ApiStandardResponses()
  assignRole(
    @CurrentUser('role') adminRole: Role,
    @UuidParam('id') userId: string,
    @Body() dto: AssignRoleDto,
  ) {
    return this.adminUsersService.assignRole(adminRole, userId, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update user account status (ACTIVE, SUSPENDED, INACTIVE)' })
  @ApiOkEnvelope(UserResponseDto)
  @ApiStandardResponses()
  updateStatus(
    @UuidParam('id') userId: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminUsersService.updateStatus(userId, dto);
  }

  @Get('invitations')
  @ApiOperation({ summary: 'List user onboarding invitations' })
  @ApiOkEnvelope(UserInvitationResponseDto)
  @ApiStandardResponses()
  listInvitations(@Query('status') status?: string) {
    return this.adminUsersService.listInvitations(status);
  }

  @Post('invitations')
  @ApiOperation({ summary: 'Invite a new portal user with an assigned role' })
  @ApiCreatedEnvelope(UserInvitationResponseDto)
  @ApiStandardResponses()
  inviteUser(
    @CurrentUser('id') adminId: string,
    @Body() dto: InviteUserDto,
  ) {
    return this.adminUsersService.inviteUser(adminId, dto);
  }

  @Delete('invitations/:id')
  @ApiOperation({ summary: 'Revoke a pending user invitation' })
  @ApiStandardResponses()
  revokeInvitation(@UuidParam('id') invitationId: string) {
    return this.adminUsersService.revokeInvitation(invitationId);
  }

  @Post('invitations/:id/resend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend / extend a user invitation' })
  @ApiOkEnvelope(UserInvitationResponseDto)
  @ApiStandardResponses()
  resendInvitation(@UuidParam('id') invitationId: string) {
    return this.adminUsersService.resendInvitation(invitationId);
  }
}
