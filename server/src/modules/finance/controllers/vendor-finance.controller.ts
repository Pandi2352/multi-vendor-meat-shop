import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SwaggerTag } from '#common/constants';
import { Role } from '#common/enums';
import {
  ApiEnvelope,
  ApiOkEnvelope,
  ApiStandardResponses,
  Auth,
  CurrentShop,
} from '#common/decorators';
import { FinanceService } from '../services/finance.service.js';
import { FinanceSummaryResponseDto } from '../dto/finance-summary-response.dto.js';
import { LedgerEntryResponseDto } from '../dto/ledger-entry-response.dto.js';
import { SettlementResponseDto } from '../dto/settlement-response.dto.js';
import { CreateSettlementDto } from '../dto/create-settlement.dto.js';

@ApiTags(SwaggerTag.VENDOR_SETTLEMENTS)
@Auth(Role.VENDOR_OWNER, Role.VENDOR_STAFF)
@Controller('vendor/finance')
export class VendorFinanceController {
  constructor(private readonly finance: FinanceService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get financial balance, sales, commission, and pending settlements' })
  @ApiOkEnvelope(FinanceSummaryResponseDto)
  @ApiStandardResponses()
  getSummary(@CurrentShop() shopId: string) {
    return this.finance.getFinanceSummary(shopId);
  }

  @Get('ledger')
  @ApiOperation({ summary: 'Get double-entry running ledger history for vendor shop' })
  @ApiEnvelope(LedgerEntryResponseDto, { isArray: true })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiStandardResponses()
  getLedger(
    @CurrentShop() shopId: string,
    @Query('limit') limit?: number,
  ) {
    return this.finance.getLedgerEntries(shopId, limit ? Number(limit) : 50);
  }

  @Get('settlements')
  @ApiOperation({ summary: 'Get list of disbursed settlements and bank payout history' })
  @ApiEnvelope(SettlementResponseDto, { isArray: true })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiStandardResponses()
  getSettlements(
    @CurrentShop() shopId: string,
    @Query('limit') limit?: number,
  ) {
    return this.finance.getSettlements(shopId, limit ? Number(limit) : 20);
  }

  @Post('settlements/request')
  @ApiOperation({ summary: 'Request payout settlement for current pending delivered orders' })
  @ApiOkEnvelope(SettlementResponseDto)
  @ApiStandardResponses()
  requestSettlement(
    @CurrentShop() shopId: string,
    @Body() body: { notes?: string },
  ) {
    return this.finance.createSettlement({
      shopId,
      notes: body?.notes || 'Vendor requested settlement',
    });
  }
}
