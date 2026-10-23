import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SwaggerTag } from '#common/constants';
import { Role } from '#common/enums';
import {
  ApiEnvelope,
  ApiOkEnvelope,
  ApiStandardResponses,
  Auth,
  UuidParam,
} from '#common/decorators';
import { FinanceService } from '../services/finance.service.js';
import { FinanceSummaryResponseDto } from '../dto/finance-summary-response.dto.js';
import { LedgerEntryResponseDto } from '../dto/ledger-entry-response.dto.js';
import { SettlementResponseDto } from '../dto/settlement-response.dto.js';
import { CreateSettlementDto } from '../dto/create-settlement.dto.js';

@ApiTags(SwaggerTag.ADMIN_ORDERS)
@Auth(Role.ADMIN, Role.FINANCE)
@Controller('admin/finance')
export class AdminFinanceController {
  constructor(private readonly finance: FinanceService) {}

  @Get('summary/:shopId')
  @ApiOperation({ summary: 'Admin: Get shop financial balance and stats' })
  @ApiOkEnvelope(FinanceSummaryResponseDto)
  @ApiStandardResponses()
  getShopSummary(@UuidParam('shopId') shopId: string) {
    return this.finance.getFinanceSummary(shopId);
  }

  @Get('ledger/:shopId')
  @ApiOperation({ summary: 'Admin: Get shop ledger' })
  @ApiEnvelope(LedgerEntryResponseDto, { isArray: true })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiStandardResponses()
  getShopLedger(
    @UuidParam('shopId') shopId: string,
    @Query('limit') limit?: number,
  ) {
    return this.finance.getLedgerEntries(shopId, limit ? Number(limit) : 50);
  }

  @Get('settlements/:shopId')
  @ApiOperation({ summary: 'Admin: Get shop settlements' })
  @ApiEnvelope(SettlementResponseDto, { isArray: true })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiStandardResponses()
  getShopSettlements(
    @UuidParam('shopId') shopId: string,
    @Query('limit') limit?: number,
  ) {
    return this.finance.getSettlements(shopId, limit ? Number(limit) : 20);
  }

  @Post('settlements')
  @ApiOperation({ summary: 'Admin: Disburse and create settlement with bank UTR reference' })
  @ApiOkEnvelope(SettlementResponseDto)
  @ApiStandardResponses()
  disburseSettlement(@Body() dto: CreateSettlementDto) {
    return this.finance.createSettlement(dto);
  }
}
