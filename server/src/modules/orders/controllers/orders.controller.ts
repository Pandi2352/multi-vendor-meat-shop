import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerTag } from '#common/constants';
import {
  ApiCreatedEnvelope,
  ApiOkEnvelope,
  ApiPaginatedResponse,
  ApiStandardResponses,
  Auth,
  CurrentUser,
  UuidParam,
} from '#common/decorators';
import { Role } from '#common/enums';
import { PaginatedResult } from '#common/dto';
import { OrdersService } from '../services/orders.service.js';
import { CreateOrderDto } from '../dto/create-order.dto.js';
import { CancelOrderDto } from '../dto/cancel-order.dto.js';
import { QueryCustomerOrdersDto } from '../dto/query-orders.dto.js';
import { OrderResponseDto } from '../dto/order-response.dto.js';

@ApiTags(SwaggerTag.ORDERS)
@Controller('orders')
@Auth(Role.CUSTOMER)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Place order from cart (COD or Online)' })
  @ApiCreatedEnvelope(OrderResponseDto)
  @ApiStandardResponses()
  create(
    @CurrentUser('id') customerId: string,
    @Body() dto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.orders.createOrder(customerId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List current customer orders' })
  @ApiPaginatedResponse(OrderResponseDto)
  @ApiStandardResponses()
  list(
    @CurrentUser('id') customerId: string,
    @Query() query: QueryCustomerOrdersDto,
  ): Promise<PaginatedResult<OrderResponseDto>> {
    return this.orders.getCustomerOrders(customerId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details with tracking timeline' })
  @ApiOkEnvelope(OrderResponseDto)
  @ApiStandardResponses()
  getOne(
    @CurrentUser('id') customerId: string,
    @UuidParam('id') id: string,
  ): Promise<OrderResponseDto> {
    return this.orders.getCustomerOrder(customerId, id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel order before acceptance by shop' })
  @ApiOkEnvelope(OrderResponseDto)
  @ApiStandardResponses()
  cancel(
    @CurrentUser('id') customerId: string,
    @UuidParam('id') id: string,
    @Body() dto: CancelOrderDto,
  ): Promise<OrderResponseDto> {
    return this.orders.cancelCustomerOrder(customerId, id, dto);
  }
}
