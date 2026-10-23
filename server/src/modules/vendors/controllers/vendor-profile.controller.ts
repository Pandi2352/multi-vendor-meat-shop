import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerTag } from '#common/constants';
import { ApiOkEnvelope, ApiStandardResponses, Auth, CurrentUser } from '#common/decorators';
import { VendorProfileService } from '../services/vendor-profile.service.js';
import { CreateVendorProfileDto } from '../dto/create-vendor-profile.dto.js';
import { VendorProfileResponseDto } from '../dto/vendor-profile-response.dto.js';

@ApiTags(SwaggerTag.VENDOR_SHOP)
@Auth()
@Controller('vendor/profile')
export class VendorProfileController {
  constructor(private readonly vendorProfile: VendorProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get current vendor onboarding profile' })
  @ApiOkEnvelope(VendorProfileResponseDto)
  @ApiStandardResponses()
  getProfile(@CurrentUser('id') userId: string) {
    return this.vendorProfile.getProfileByUserId(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create or update vendor onboarding profile (draft)' })
  @ApiOkEnvelope(VendorProfileResponseDto)
  @ApiStandardResponses()
  createOrUpdate(@CurrentUser('id') userId: string, @Body() dto: CreateVendorProfileDto) {
    return this.vendorProfile.createOrUpdate(userId, dto);
  }

  @Post('submit')
  @ApiOperation({ summary: 'Submit vendor profile for admin verification' })
  @ApiOkEnvelope(VendorProfileResponseDto)
  @ApiStandardResponses()
  submit(@CurrentUser('id') userId: string) {
    return this.vendorProfile.submitForReview(userId);
  }
}
