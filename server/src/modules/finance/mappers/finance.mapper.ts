import type { Commission } from '../schemas/commission.schema.js';
import type { LedgerEntry } from '../schemas/ledger-entry.schema.js';
import type { Settlement } from '../schemas/settlement.schema.js';
import type { CommissionResponseDto } from '../dto/commission-response.dto.js';
import type { LedgerEntryResponseDto } from '../dto/ledger-entry-response.dto.js';
import type { SettlementResponseDto } from '../dto/settlement-response.dto.js';

export const toCommissionResponseDto = (c: Commission): CommissionResponseDto => ({
  id: c._id,
  orderId: c.orderId,
  orderNumber: c.orderNumber,
  shopId: c.shopId,
  grossAmountPaise: c.grossAmountPaise,
  commissionBps: c.commissionBps,
  commissionAmountPaise: c.commissionAmountPaise,
  netVendorAmountPaise: c.netVendorAmountPaise,
  paymentMethod: c.paymentMethod,
  status: c.status,
  settlementId: c.settlementId,
  createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
});

export const toLedgerEntryResponseDto = (l: LedgerEntry): LedgerEntryResponseDto => ({
  id: l._id,
  shopId: l.shopId,
  direction: l.direction,
  entryType: l.entryType,
  amountPaise: l.amountPaise,
  referenceType: l.referenceType,
  referenceId: l.referenceId,
  description: l.description,
  balanceAfterPaise: l.balanceAfterPaise,
  createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : new Date().toISOString(),
});

export const toSettlementResponseDto = (s: Settlement): SettlementResponseDto => ({
  id: s._id,
  settlementNumber: s.settlementNumber,
  shopId: s.shopId,
  periodStart: s.periodStart ? new Date(s.periodStart).toISOString() : new Date().toISOString(),
  periodEnd: s.periodEnd ? new Date(s.periodEnd).toISOString() : new Date().toISOString(),
  orderCount: s.orderCount,
  grossSalesPaise: s.grossSalesPaise,
  commissionDeductedPaise: s.commissionDeductedPaise,
  netPayoutPaise: s.netPayoutPaise,
  status: s.status,
  utrNumber: s.utrNumber,
  notes: s.notes,
  settledAt: s.settledAt ? new Date(s.settledAt).toISOString() : undefined,
  createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : new Date().toISOString(),
});
