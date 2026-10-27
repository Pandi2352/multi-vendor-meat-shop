import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
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

@ApiTags(SwaggerTag.VENDOR_SHOP)
@Auth(Role.VENDOR_OWNER, Role.VENDOR_STAFF, Role.ADMIN, Role.SUPER_ADMIN)
@Controller('vendor/staff')
@Permissions(Permission.STAFF_MANAGE)
@RequireApprovedVendor()
export class VendorStaffController {
  constructor(private readonly staffService: VendorStaffService) {}

  @Get()
  @ApiOperation({ summary: 'List all staff members and pending invites for the vendor stall' })
  @ApiOkEnvelope(VendorStaffListResponseDto)
  @ApiStandardResponses()
  list(@CurrentShop() shopId: string) {
    return this.staffService.listStaff(shopId);
  }

  @Post()
  @ApiOperation({ summary: 'Add or invite a staff member to the butcher stall' })
  @ApiCreatedEnvelope(VendorStaffMemberDto)
  @ApiStandardResponses()
  add(
    @CurrentShop() shopId: string,
    @CurrentUser('id') actorId: string,
    @Body() dto: AddVendorStaffDto,
  ) {
    return this.staffService.addStaff(shopId, actorId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update stall staff profile, duty title, or active status' })
  @ApiOkEnvelope(VendorStaffMemberDto)
  @ApiStandardResponses()
  update(
    @CurrentShop() shopId: string,
    @UuidParam('id') id: string,
    @Body() dto: UpdateVendorStaffDto,
  ) {
    return this.staffService.updateStaff(shopId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a staff member from the vendor stall' })
  @ApiOkEnvelope(Object)
  @ApiStandardResponses()
  remove(@CurrentShop() shopId: string, @UuidParam('id') id: string) {
    return this.staffService.removeStaff(shopId, id);
  }
}
