import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerTag } from '#common/constants';
import { ApiOkEnvelope, ApiStandardResponses, Auth, CurrentUser } from '#common/decorators';
import { Role } from '#common/enums';
import { AppException, ErrorCode } from '#common/exceptions';
import { VendorAccessStatusDto } from '../dto/vendor-access-status.dto.js';
import { VendorAccessService } from '../services/vendor-access.service.js';

@ApiTags(SwaggerTag.VENDOR_SHOP)
@Controller('vendor/status')
@Auth(Role.VENDOR_OWNER, Role.VENDOR_STAFF)
export class VendorStatusController {
  constructor(private readonly access: VendorAccessService) {}

  @Get()
  @ApiOperation({ summary: 'Verification status of my shop and whether it can sell right now' })
  @ApiOkEnvelope(VendorAccessStatusDto)
  @ApiStandardResponses()
  status(@CurrentUser('shopId') shopId?: string): Promise<VendorAccessStatusDto> {
    if (!shopId) {
      throw new AppException(ErrorCode.VENDOR_NOT_APPROVED, {
        message: 'Your account isn’t linked to a shop yet.',
      });
    }
    return this.access.getStatus(shopId);
  }
}
