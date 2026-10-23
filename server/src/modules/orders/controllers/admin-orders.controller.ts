import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerTag } from '#common/constants';
import {
  ApiOkEnvelope,
  ApiPaginatedResponse,
  ApiStandardResponses,
  Auth,
  CurrentUser,
  UuidParam,
} from '#common/decorators';
import { Role } from '#common/enums';
import { PaginatedResult } from '#common/dto';
import { OrderFulfilmentService } from '../services/order-fulfilment.service.js';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto.js';
import { QueryAdminOrdersDto } from '../dto/query-orders.dto.js';
import { OrderResponseDto } from '../dto/order-response.dto.js';

@ApiTags(SwaggerTag.ADMIN_ORDERS)
@Auth(Role.ADMIN, Role.OPERATIONS, Role.SUPPORT)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly fulfilment: OrderFulfilmentService) {}

  @Get()
  @ApiOperation({ summary: 'List all platform orders with shop, customer, and date filters' })
  @ApiPaginatedResponse(OrderResponseDto)
  @ApiStandardResponses()
  list(@Query() query: QueryAdminOrdersDto): Promise<PaginatedResult<OrderResponseDto>> {
    return this.fulfilment.getAdminOrders(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details by ID for moderation or dispute' })
  @ApiOkEnvelope(OrderResponseDto)
  @ApiStandardResponses()
  getOne(@UuidParam('id') id: string): Promise<OrderResponseDto> {
    return this.fulfilment.getAdminOrder(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Moderate or transition order status (e.g. resolve disputes or refunds)' })
  @ApiOkEnvelope(OrderResponseDto)
  @ApiStandardResponses()
  updateStatus(
    @CurrentUser('id') adminUserId: string,
    @CurrentUser('role') adminRole: Role,
    @UuidParam('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    return this.fulfilment.updateAdminOrderStatus(adminUserId, adminRole, id, dto);
  }
}
