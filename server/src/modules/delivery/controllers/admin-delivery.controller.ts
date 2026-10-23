import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerTag } from '#common/constants';
import {
  ApiCreatedEnvelope,
  ApiOkEnvelope,
  ApiPaginatedResponse,
  ApiStandardResponses,
  Auth,
  UuidParam,
} from '#common/decorators';
import { Role } from '#common/enums';
import { PaginatedResult } from '#common/dto';
import { DeliveryTasksService } from '../services/delivery-tasks.service.js';
import { DeliveryTaskResponseDto } from '../dto/delivery-task-response.dto.js';
import { QueryDeliveryTasksDto } from '../dto/query-delivery-tasks.dto.js';
import { AssignDeliveryTaskDto } from '../dto/assign-delivery-task.dto.js';

@ApiTags(SwaggerTag.DELIVERY)
@Auth(Role.ADMIN, Role.OPERATIONS)
@Controller('admin/delivery')
export class AdminDeliveryController {
  constructor(private readonly delivery: DeliveryTasksService) {}

  @Get('tasks')
  @ApiOperation({ summary: 'List all delivery tasks across shops and partners' })
  @ApiPaginatedResponse(DeliveryTaskResponseDto)
  @ApiStandardResponses()
  listTasks(@Query() query: QueryDeliveryTasksDto): Promise<PaginatedResult<DeliveryTaskResponseDto>> {
    return this.delivery.getTasks(query);
  }

  @Get('tasks/:id')
  @ApiOperation({ summary: 'Get full delivery task info including OTP' })
  @ApiOkEnvelope(DeliveryTaskResponseDto)
  @ApiStandardResponses()
  getTask(@UuidParam('id') id: string): Promise<DeliveryTaskResponseDto> {
    return this.delivery.getTaskById(id);
  }

  @Post('orders/:orderId/dispatch')
  @ApiOperation({ summary: 'Create and dispatch delivery task for a ready order' })
  @ApiCreatedEnvelope(DeliveryTaskResponseDto)
  @ApiStandardResponses()
  dispatchForOrder(@UuidParam('orderId') orderId: string): Promise<DeliveryTaskResponseDto> {
    return this.delivery.createOrGetTaskForOrder(orderId);
  }

  @Post('tasks/:id/assign')
  @ApiOperation({ summary: 'Assign delivery partner to task' })
  @ApiOkEnvelope(DeliveryTaskResponseDto)
  @ApiStandardResponses()
  assignTask(
    @UuidParam('id') id: string,
    @Body() dto: AssignDeliveryTaskDto,
  ): Promise<DeliveryTaskResponseDto> {
    return this.delivery.assignPartner(id, dto);
  }
}
