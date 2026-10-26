import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
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
import { DisputesService } from '../services/disputes.service.js';
import { CreateDisputeDto } from '../dto/create-dispute.dto.js';
import { ResolveDisputeDto } from '../dto/resolve-dispute.dto.js';
import { DisputeQueryDto } from '../dto/dispute-query.dto.js';
import { DisputeResponseDto } from '../dto/dispute-response.dto.js';

@ApiTags(SwaggerTag.ADMIN_DISPUTES)
@Auth(Role.ADMIN, Role.SUPPORT, Role.SUPER_ADMIN)
@Controller('admin/disputes')
export class AdminDisputesController {
  constructor(private readonly disputes: DisputesService) {}

  @Get()
  @ApiOperation({ summary: 'List customer meat disputes with filtering by status, reason, shop' })
  @ApiPaginatedResponse(DisputeResponseDto)
  @ApiStandardResponses()
  list(@Query() query: DisputeQueryDto): Promise<PaginatedResult<DisputeResponseDto>> {
    return this.disputes.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dispute details by ID' })
  @ApiOkEnvelope(DisputeResponseDto)
  @ApiStandardResponses()
  getById(@UuidParam('id') id: string): Promise<DisputeResponseDto> {
    return this.disputes.getById(id);
  }

  @Post(':id/resolve')
  @ApiOperation({ summary: 'Resolve dispute with refund decision and butcher stall ledger debit' })
  @ApiOkEnvelope(DisputeResponseDto)
  @ApiStandardResponses()
  resolve(
    @UuidParam('id') id: string,
    @Body() dto: ResolveDisputeDto,
    @CurrentUser('id') adminUserId: string,
  ): Promise<DisputeResponseDto> {
    return this.disputes.resolve(id, dto, adminUserId);
  }

  @Post()
  @ApiOperation({ summary: 'File a dispute ticket against an order' })
  @ApiOkEnvelope(DisputeResponseDto)
  @ApiStandardResponses()
  create(
    @Body() dto: CreateDisputeDto,
    @CurrentUser('id') adminUserId: string,
  ): Promise<DisputeResponseDto> {
    return this.disputes.create(dto, adminUserId);
  }
}
