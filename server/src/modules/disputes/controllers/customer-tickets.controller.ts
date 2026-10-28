import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '#common/enums';
import { SwaggerTag } from '#common/constants';
import { ApiEnvelope, ApiOkEnvelope, ApiStandardResponses, Auth, CurrentUser, UuidParam } from '#common/decorators';
import { DisputesService } from '../services/disputes.service.js';
import { CreateDisputeDto } from '../dto/create-dispute.dto.js';
import { DisputeResponseDto } from '../dto/dispute-response.dto.js';

@ApiTags(SwaggerTag.SUPPORT_TICKETS)
@ApiBearerAuth()
@Auth(Role.CUSTOMER)
@Controller('tickets')
export class CustomerTicketsController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a support ticket or issue for a meat order' })
  @ApiOkEnvelope(DisputeResponseDto)
  @ApiStandardResponses()
  create(
    @CurrentUser('id') customerId: string,
    @Body() dto: CreateDisputeDto,
  ): Promise<DisputeResponseDto> {
    return this.disputesService.create(dto, customerId);
  }

  @Get()
  @ApiOperation({ summary: 'List customer support tickets and issue resolutions' })
  @ApiEnvelope(DisputeResponseDto, { isArray: true })
  @ApiStandardResponses()
  listMyTickets(@CurrentUser('id') customerId: string): Promise<DisputeResponseDto[]> {
    return this.disputesService.listCustomerDisputes(customerId);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Check if an existing support ticket was filed for an order' })
  @ApiOkEnvelope(DisputeResponseDto)
  @ApiStandardResponses()
  getTicketForOrder(
    @CurrentUser('id') customerId: string,
    @UuidParam('orderId') orderId: string,
  ): Promise<DisputeResponseDto | null> {
    return this.disputesService.getDisputeForOrder(customerId, orderId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details and resolution history of a support ticket' })
  @ApiOkEnvelope(DisputeResponseDto)
  @ApiStandardResponses()
  getTicketById(
    @CurrentUser('id') customerId: string,
    @UuidParam('id') id: string,
  ): Promise<DisputeResponseDto> {
    return this.disputesService.getCustomerDispute(customerId, id);
  }
}
