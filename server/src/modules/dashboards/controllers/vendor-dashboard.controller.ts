import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerTag } from '#common/constants';
import { ApiOkEnvelope, ApiStandardResponses, Auth, CurrentUser } from '#common/decorators';
import { Role } from '#common/enums';
import type { AuthUser } from '#common/interfaces';
import { VendorDashboardResponseDto } from '../dto/vendor-dashboard-response.dto.js';
import { VendorDashboardService } from '../services/vendor-dashboard.service.js';

@ApiTags(SwaggerTag.VENDOR_SHOP)
@Controller('vendor/dashboard')
@Auth(Role.VENDOR_OWNER, Role.VENDOR_STAFF)
export class VendorDashboardController {
  constructor(private readonly dashboard: VendorDashboardService) {}

  @Get()
  @ApiOperation({
    summary: 'My shop dashboard: orders in progress, today’s numbers, stock alerts and payouts',
    description: '`payouts` is only filled for users with the settlement.read permission (shop owners).',
  })
  @ApiOkEnvelope(VendorDashboardResponseDto)
  @ApiStandardResponses()
  get(@CurrentUser() user: AuthUser): Promise<VendorDashboardResponseDto> {
    return this.dashboard.get(user);
  }
}
