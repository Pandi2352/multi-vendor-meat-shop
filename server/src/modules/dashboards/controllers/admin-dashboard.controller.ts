import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerTag } from '#common/constants';
import { ApiOkEnvelope, ApiStandardResponses, Auth, CurrentUser } from '#common/decorators';
import { STAFF_ROLES, type Role } from '#common/enums';
import { AdminDashboardResponseDto } from '../dto/admin-dashboard-response.dto.js';
import { AdminDashboardService } from '../services/admin-dashboard.service.js';

@ApiTags(SwaggerTag.ADMIN_DASHBOARD)
@Controller('admin/dashboard')
@Auth(...STAFF_ROLES)
export class AdminDashboardController {
  constructor(private readonly dashboard: AdminDashboardService) {}

  @Get()
  @ApiOperation({
    summary: 'Marketplace dashboard: vendors to review, orders, deliveries and disputes waiting on the team',
    description: '`money` is only filled for admins and finance.',
  })
  @ApiOkEnvelope(AdminDashboardResponseDto)
  @ApiStandardResponses()
  get(@CurrentUser('role') role: Role): Promise<AdminDashboardResponseDto> {
    return this.dashboard.get(role);
  }
}
