import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerTag } from '#common/constants';
import {
  ApiOkEnvelope,
  ApiPaginatedResponse,
  ApiStandardResponses,
  Auth,
  CurrentShop,
  CurrentUser,
  UuidParam,
} from '#common/decorators';
import { Role } from '#common/enums';
import { PaginatedResult } from '#common/dto';
import { OrderFulfilmentService } from '../services/order-fulfilment.service.js';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto.js';
import { QueryVendorOrdersDto } from '../dto/query-orders.dto.js';
import { OrderResponseDto } from '../dto/order-response.dto.js';

@ApiTags(SwaggerTag.VENDOR_ORDERS)
@Auth(Role.VENDOR_OWNER, Role.VENDOR_STAFF)
@Controller('vendor/orders')
export class VendorOrdersController {
  constructor(private readonly fulfilment: OrderFulfilmentService) {}

  @Get()
  @ApiOperation({ summary: 'List shop orders with date and status filters' })
  @ApiPaginatedResponse(OrderResponseDto)
  @ApiStandardResponses()
  list(
    @CurrentShop() shopId: string,
    @Query() query: QueryVendorOrdersDto,
  ): Promise<PaginatedResult<OrderResponseDto>> {
    return this.fulfilment.getVendorOrders(shopId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shop order details with tracking timeline' })
  @ApiOkEnvelope(OrderResponseDto)
  @ApiStandardResponses()
  getOne(
    @CurrentShop() shopId: string,
    @UuidParam('id') id: string,
  ): Promise<OrderResponseDto> {
    return this.fulfilment.getVendorOrder(shopId, id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status and optionally record actual packed weight' })
  @ApiOkEnvelope(OrderResponseDto)
  @ApiStandardResponses()
  updateStatus(
    @CurrentShop() shopId: string,
    @CurrentUser('id') vendorUserId: string,
    @CurrentUser('role') vendorRole: Role,
    @UuidParam('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    return this.fulfilment.updateVendorOrderStatus(shopId, vendorUserId, vendorRole, id, dto);
  }
}
