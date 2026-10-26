import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
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
import { ListQueryDto } from '#common/dto';
import { VendorProfileService } from '../services/vendor-profile.service.js';
import { VerifyVendorDto } from '../dto/verify-vendor.dto.js';
import { AdminCreateVendorDto } from '../dto/admin-create-vendor.dto.js';
import { VendorProfileResponseDto } from '../dto/vendor-profile-response.dto.js';

@ApiTags(SwaggerTag.ADMIN_VENDORS)
@Auth(Role.ADMIN, Role.OPERATIONS)
@Controller('admin/vendors')
export class AdminVendorsController {
  constructor(private readonly vendorProfile: VendorProfileService) {}

  @Get()
  @ApiOperation({ summary: 'List all vendor verification applications (paginated)' })
  @ApiPaginatedResponse(VendorProfileResponseDto)
  @ApiStandardResponses()
  list(@Query() query: ListQueryDto) {
    return this.vendorProfile.listVendors(query);
  }

  @Post()
  @Auth(Role.ADMIN)
  @ApiOperation({ summary: 'Directly add a new vendor and stall as an administrator' })
  @ApiCreatedEnvelope(VendorProfileResponseDto)
  @ApiStandardResponses()
  create(
    @CurrentUser('id') adminId: string,
    @Body() dto: AdminCreateVendorDto,
  ) {
    return this.vendorProfile.adminCreateVendor(adminId, dto);
  }

  @Patch(':id/verify')
  @Auth(Role.ADMIN)
  @ApiOperation({ summary: 'Approve, reject, or request resubmission for vendor profile' })
  @ApiOkEnvelope(VendorProfileResponseDto)
  @ApiStandardResponses()
  verify(
    @CurrentUser('id') adminId: string,
    @UuidParam('id') vendorId: string,
    @Body() dto: VerifyVendorDto,
  ) {
    return this.vendorProfile.verifyVendor(adminId, vendorId, dto);
  }
}
