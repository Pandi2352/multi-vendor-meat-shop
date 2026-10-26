import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerTag } from '#common/constants';
import { ApiCreatedEnvelope, ApiStandardResponses, Public } from '#common/decorators';
import { VendorProfileService } from '../services/vendor-profile.service.js';
import { ApplyVendorDto } from '../dto/apply-vendor.dto.js';
import { VendorApplicationResponseDto } from '../dto/vendor-application-response.dto.js';

@ApiTags(SwaggerTag.VENDOR_SHOP)
@Public()
@Controller('vendors')
export class PublicVendorsController {
  constructor(private readonly vendorProfile: VendorProfileService) {}

  @Post('apply')
  @ApiOperation({ summary: 'Submit a new butcher stall onboarding application from public site' })
  @ApiCreatedEnvelope(VendorApplicationResponseDto)
  @ApiStandardResponses()
  apply(@Body() dto: ApplyVendorDto) {
    return this.vendorProfile.applyVendor(dto);
  }
}
