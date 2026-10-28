import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerTag } from '#common/constants';
import { Role, Permission } from '#common/enums';
import {
  ApiCreatedEnvelope,
  ApiOkEnvelope,
  ApiStandardResponses,
  Auth,
  CurrentShop,
  CurrentUser,
  UuidParam,
  RequireApprovedVendor,
  Permissions,
} from '#common/decorators';
import { VendorStaffService } from '../services/vendor-staff.service.js';
import {
  AddVendorStaffDto,
  UpdateVendorStaffDto,
  VendorStaffListResponseDto,
  VendorStaffMemberDto,
} from '../dto/vendor-staff.dto.js';
import { UserInvitationResponseDto } from '../dto/user-invitation-response.dto.js';

/** The shop owner's team page: members, pending invites, and changes to both. */
@ApiTags(SwaggerTag.VENDOR_SHOP)
@Auth(Role.VENDOR_OWNER, Role.VENDOR_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
@Controller('vendor/staff')
@Permissions(Permission.STAFF_MANAGE)
@RequireApprovedVendor()
export class VendorStaffController {
  constructor(private readonly staffService: VendorStaffService) {}

  @Get()
  @ApiOperation({ summary: 'Shop team: members (owner first) and pending staff invites' })
  @ApiOkEnvelope(VendorStaffListResponseDto)
  @ApiStandardResponses()
  list(@CurrentShop() shopId: string) {
    return this.staffService.listStaff(shopId);
  }

  @Post()
  @ApiOperation({
    summary: 'Invite someone to join the shop as staff',
    description:
      'Emails a set-password link. The response carries the one-time `inviteUrl` and `emailSent`. Works for new emails and customer accounts; the staff role applies when they accept.',
  })
  @ApiCreatedEnvelope(UserInvitationResponseDto)
  @ApiStandardResponses(HttpStatus.UNPROCESSABLE_ENTITY)
  add(@CurrentShop() shopId: string, @CurrentUser('id') actorId: string, @Body() dto: AddVendorStaffDto) {
    return this.staffService.addStaff(shopId, actorId, dto);
  }

  @Post('invitations/:id/resend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a pending staff invite again with a new link (the old link stops working)' })
  @ApiOkEnvelope(UserInvitationResponseDto)
  @ApiStandardResponses(HttpStatus.NOT_FOUND, HttpStatus.UNPROCESSABLE_ENTITY)
  resendInvitation(
    @CurrentShop() shopId: string,
    @CurrentUser('id') actorId: string,
    @UuidParam('id') id: string,
  ) {
    return this.staffService.resendInvitation(shopId, actorId, id);
  }

  @Delete('invitations/:id')
  @ApiOperation({ summary: 'Cancel a pending staff invite (its link stops working)' })
  @ApiOkEnvelope(Object)
  @ApiStandardResponses(HttpStatus.NOT_FOUND, HttpStatus.UNPROCESSABLE_ENTITY)
  cancelInvitation(@CurrentShop() shopId: string, @UuidParam('id') id: string) {
    return this.staffService.cancelInvitation(shopId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit a staff member’s name, phone or job, or suspend / re-activate them' })
  @ApiOkEnvelope(VendorStaffMemberDto)
  @ApiStandardResponses(HttpStatus.NOT_FOUND, HttpStatus.UNPROCESSABLE_ENTITY)
  update(@CurrentShop() shopId: string, @UuidParam('id') id: string, @Body() dto: UpdateVendorStaffDto) {
    return this.staffService.updateStaff(shopId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove someone from the shop (their account becomes a customer account)' })
  @ApiOkEnvelope(Object)
  @ApiStandardResponses(HttpStatus.NOT_FOUND, HttpStatus.UNPROCESSABLE_ENTITY)
  remove(@CurrentShop() shopId: string, @UuidParam('id') id: string) {
    return this.staffService.removeStaff(shopId, id);
  }
}
