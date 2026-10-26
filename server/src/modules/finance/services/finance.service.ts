import { Injectable } from '@nestjs/common';
import { AppConfigService } from '#config';
import { AppException, ErrorCode } from '#common/exceptions';
import { LedgerDirection, LedgerEntryType, SettlementStatus } from '#common/enums';
import { createReferenceNumber, ReferencePrefix } from '#common/utils';
import { CommissionRepository } from '../repositories/commission.repository.js';
import { LedgerEntryRepository } from '../repositories/ledger-entry.repository.js';
import { SettlementRepository } from '../repositories/settlement.repository.js';
import type { CreateSettlementDto } from '../dto/create-settlement.dto.js';
import type { FinanceSummaryResponseDto } from '../dto/finance-summary-response.dto.js';
import {
  toCommissionResponseDto,
  toLedgerEntryResponseDto,
  toSettlementResponseDto,
} from '../mappers/finance.mapper.js';

interface DeliveredOrderInput {
  orderId: string;
  orderNumber: string;
  shopId: string;
  totalAmountPaise: number;
}

@Injectable()
export class FinanceService {
  constructor(
    private readonly config: AppConfigService,
    private readonly commissionRepo: CommissionRepository,
    private readonly ledgerRepo: LedgerEntryRepository,
    private readonly settlementRepo: SettlementRepository,
  ) {}

  async recordOrderDelivered(input: DeliveredOrderInput) {
    const existing = await this.commissionRepo.findByOrderId(input.orderId);
    if (existing) {
      return toCommissionResponseDto(existing);
    }

    const commissionBps = this.config.business.defaultCommissionBps ?? 1000; // 1000 = 10%
    const commissionAmountPaise = Math.round((input.totalAmountPaise * commissionBps) / 10000);
    const netVendorAmountPaise = input.totalAmountPaise - commissionAmountPaise;

    const commission = await this.commissionRepo.create({
      orderId: input.orderId,
      orderNumber: input.orderNumber,
      shopId: input.shopId,
      grossAmountPaise: input.totalAmountPaise,
      commissionBps,
      commissionAmountPaise,
      netVendorAmountPaise,
      paymentMethod: 'COD',
      status: 'PENDING',
    });

    const previousBalance = await this.ledgerRepo.getLatestBalance(input.shopId);
    const newBalance = previousBalance + netVendorAmountPaise;

    await this.ledgerRepo.create({
      shopId: input.shopId,
      direction: LedgerDirection.CREDIT,
      entryType: LedgerEntryType.SALE,
      amountPaise: netVendorAmountPaise,
      referenceType: 'ORDER',
      referenceId: input.orderNumber,
      description: `Net earnings from COD delivery ${input.orderNumber} (Gross ₹${(input.totalAmountPaise / 100).toFixed(0)} - 10% Platform Commission ₹${(commissionAmountPaise / 100).toFixed(0)})`,
      balanceAfterPaise: newBalance,
    });

    return toCommissionResponseDto(commission);
  }

  async getFinanceSummary(shopId: string): Promise<FinanceSummaryResponseDto> {
    const currentBalance = await this.ledgerRepo.getLatestBalance(shopId);
    const pendingCommissions = await this.commissionRepo.findPendingByShop(shopId);
    const settlements = await this.settlementRepo.findByShop(shopId, 100);

    const pendingSettlementPaise = pendingCommissions.reduce((sum, c) => sum + c.netVendorAmountPaise, 0);
    const totalSettledPayoutPaise = settlements
      .filter((s) => s.status === SettlementStatus.SETTLED)
      .reduce((sum, s) => sum + s.netPayoutPaise, 0);

    let totalGrossSalesPaise = pendingCommissions.reduce((sum, c) => sum + c.grossAmountPaise, 0);
    let totalCommissionDeductedPaise = pendingCommissions.reduce((sum, c) => sum + c.commissionAmountPaise, 0);

    for (const s of settlements) {
      totalGrossSalesPaise += s.grossSalesPaise;
      totalCommissionDeductedPaise += s.commissionDeductedPaise;
    }

    return {
      payableBalancePaise: Math.max(0, currentBalance),
      totalGrossSalesPaise,
      totalCommissionDeductedPaise,
      pendingSettlementPaise,
      totalSettledPayoutPaise,
      pendingOrdersCount: pendingCommissions.length,
    };
  }

  async getLedgerEntries(shopId: string, limit = 50) {
    const entries = await this.ledgerRepo.findRecentByShop(shopId, limit);
    return entries.map(toLedgerEntryResponseDto);
  }

  async getSettlements(shopId: string, limit = 20) {
    const settlements = await this.settlementRepo.findByShop(shopId, limit);
    return settlements.map(toSettlementResponseDto);
  }

  async createSettlement(dto: CreateSettlementDto) {
    const pendingCommissions = await this.commissionRepo.findPendingByShop(dto.shopId);
    if (pendingCommissions.length === 0) {
      throw new AppException(ErrorCode.BUSINESS_RULE_VIOLATION, {
        message: 'No pending delivered orders available to settle for this shop',
      });
    }

    const orderCount = pendingCommissions.length;
    const grossSalesPaise = pendingCommissions.reduce((sum, c) => sum + c.grossAmountPaise, 0);
    const commissionDeductedPaise = pendingCommissions.reduce((sum, c) => sum + c.commissionAmountPaise, 0);
    const netPayoutPaise = pendingCommissions.reduce((sum, c) => sum + c.netVendorAmountPaise, 0);

    const periodStart = pendingCommissions.reduce(
      (earliest, c) => (new Date(c.createdAt) < earliest ? new Date(c.createdAt) : earliest),
      new Date(),
    );
    const periodEnd = new Date();

    const settlementNumber = createReferenceNumber(ReferencePrefix.SETTLEMENT);

    const settlement = await this.settlementRepo.create({
      settlementNumber,
      shopId: dto.shopId,
      periodStart,
      periodEnd,
      orderCount,
      grossSalesPaise,
      commissionDeductedPaise,
      netPayoutPaise,
      status: SettlementStatus.SETTLED,
      utrNumber: dto.utrNumber,
      notes: dto.notes,
      settledAt: new Date(),
    });

    for (const c of pendingCommissions) {
      await this.commissionRepo.updateByIdOrThrow(c._id, {
        status: 'SETTLED',
        settlementId: settlement._id,
      });
    }

    const previousBalance = await this.ledgerRepo.getLatestBalance(dto.shopId);
    const newBalance = Math.max(0, previousBalance - netPayoutPaise);

    await this.ledgerRepo.create({
      shopId: dto.shopId,
      direction: LedgerDirection.DEBIT,
      entryType: LedgerEntryType.PAYOUT,
      amountPaise: netPayoutPaise,
      referenceType: 'SETTLEMENT',
      referenceId: settlement.settlementNumber,
      description: `Disbursed settlement ${settlement.settlementNumber} to vendor bank account (UTR: ${dto.utrNumber || 'N/A'})`,
      balanceAfterPaise: newBalance,
    });

    return toSettlementResponseDto(settlement);
  }

  async getGlobalOverview() {
    const allPendingCommissions = await this.commissionRepo.findMany({ status: 'PENDING' });
    const allSettledCommissions = await this.commissionRepo.findMany({ status: 'SETTLED' });
    const allSettlements = await this.settlementRepo.findMany({}, { sort: { createdAt: -1 }, limit: 100 });

    const totalGrossSalesPaise = [...allPendingCommissions, ...allSettledCommissions].reduce(
      (sum, c) => sum + c.grossAmountPaise,
      0,
    );
    const totalCommissionCollectedPaise = [...allPendingCommissions, ...allSettledCommissions].reduce(
      (sum, c) => sum + c.commissionAmountPaise,
      0,
    );
    const pendingPayoutPaise = allPendingCommissions.reduce((sum, c) => sum + c.netVendorAmountPaise, 0);
    const completedPayoutPaise = allSettlements
      .filter((s) => s.status === SettlementStatus.SETTLED)
      .reduce((sum, s) => sum + s.netPayoutPaise, 0);

    return {
      totalGrossSalesPaise,
      totalCommissionCollectedPaise,
      pendingPayoutPaise,
      completedPayoutPaise,
      pendingOrdersCount: allPendingCommissions.length,
      settlementsCount: allSettlements.length,
    };
  }

  async recordDisputeRefundDebit(input: {
    shopId: string;
    amountPaise: number;
    orderNumber: string;
    disputeNumber: string;
    reason: string;
  }) {
    const previousBalance = await this.ledgerRepo.getLatestBalance(input.shopId);
    const newBalance = Math.max(0, previousBalance - input.amountPaise);

    return this.ledgerRepo.create({
      shopId: input.shopId,
      direction: LedgerDirection.DEBIT,
      entryType: LedgerEntryType.REFUND,
      amountPaise: input.amountPaise,
      referenceType: 'DISPUTE',
      referenceId: input.disputeNumber,
      description: `Dispute debit for order ${input.orderNumber}: ${input.reason}`,
      balanceAfterPaise: newBalance,
    });
  }
}

