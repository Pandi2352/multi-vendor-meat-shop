import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
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
import { DeliveryTasksService } from '../services/delivery-tasks.service.js';
import { DeliveryTaskResponseDto } from '../dto/delivery-task-response.dto.js';
import { QueryDeliveryTasksDto } from '../dto/query-delivery-tasks.dto.js';
import { VerifyDeliveryOtpDto } from '../dto/verify-delivery-otp.dto.js';

@ApiTags(SwaggerTag.DELIVERY)
@Auth(Role.DELIVERY_PARTNER)
@Controller('delivery/tasks')
export class DeliveryTasksController {
  constructor(private readonly delivery: DeliveryTasksService) {}

  @Get()
  @ApiOperation({ summary: 'List tasks assigned to the authenticated delivery partner' })
  @ApiPaginatedResponse(DeliveryTaskResponseDto)
  @ApiStandardResponses()
  list(
    @CurrentUser('id') partnerId: string,
    @Query() query: QueryDeliveryTasksDto,
  ): Promise<PaginatedResult<DeliveryTaskResponseDto>> {
    return this.delivery.getTasks({ ...query, partnerId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get delivery task details' })
  @ApiOkEnvelope(DeliveryTaskResponseDto)
  @ApiStandardResponses()
  getOne(
    @UuidParam('id') id: string,
  ): Promise<DeliveryTaskResponseDto> {
    return this.delivery.getTaskById(id);
  }

  @Patch(':id/pickup')
  @ApiOperation({ summary: 'Mark order picked up from butcher shop counter' })
  @ApiOkEnvelope(DeliveryTaskResponseDto)
  @ApiStandardResponses()
  pickup(
    @CurrentUser('id') partnerId: string,
    @UuidParam('id') id: string,
  ): Promise<DeliveryTaskResponseDto> {
    return this.delivery.pickupOrder(id, partnerId);
  }

  @Post(':id/deliver')
  @ApiOperation({ summary: 'Verify customer 4-digit OTP and collect COD cash to complete delivery' })
  @ApiOkEnvelope(DeliveryTaskResponseDto)
  @ApiStandardResponses()
  deliver(
    @CurrentUser('id') partnerId: string,
    @UuidParam('id') id: string,
    @Body() dto: VerifyDeliveryOtpDto,
  ): Promise<DeliveryTaskResponseDto> {
    return this.delivery.verifyOtpAndDeliver(id, partnerId, dto);
  }

  @Get('order/:orderId')
  @Auth(Role.CUSTOMER, Role.ADMIN)
  @ApiOperation({ summary: 'Get delivery task and OTP for customer order' })
  @ApiOkEnvelope(DeliveryTaskResponseDto)
  @ApiStandardResponses()
  getForOrder(
    @CurrentUser('id') customerId: string,
    @UuidParam('orderId') orderId: string,
  ): Promise<DeliveryTaskResponseDto> {
    return this.delivery.getCustomerTaskByOrderId(orderId, customerId);
  }
}
