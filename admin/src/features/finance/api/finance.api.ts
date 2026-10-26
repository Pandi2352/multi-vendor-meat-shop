import { http } from '@/lib/http';

export interface FinanceSummary {
  payableBalancePaise: number;
  totalGrossSalesPaise: number;
  totalCommissionDeductedPaise: number;
  pendingSettlementPaise: number;
  totalSettledPayoutPaise: number;
  pendingOrdersCount: number;
}

export interface GlobalFinanceOverview {
  totalGrossSalesPaise: number;
  totalCommissionCollectedPaise: number;
  pendingPayoutPaise: number;
  completedPayoutPaise: number;
  pendingOrdersCount: number;
  settlementsCount: number;
}

export interface LedgerEntry {
  id: string;
  shopId: string;
  direction: 'CREDIT' | 'DEBIT';
  entryType: string;
  amountPaise: number;
  referenceType: string;
  referenceId: string;
  description: string;
  balanceAfterPaise: number;
  createdAt: string;
}

export interface Settlement {
  id: string;
  settlementNumber: string;
  shopId: string;
  periodStart: string;
  periodEnd: string;
  orderCount: number;
  grossSalesPaise: number;
  commissionDeductedPaise: number;
  netPayoutPaise: number;
  status: 'PENDING' | 'PROCESSING' | 'SETTLED' | 'FAILED';
  utrNumber?: string;
  notes?: string;
  settledAt?: string;
  createdAt: string;
}

export interface DisburseSettlementPayload {
  shopId: string;
  utrNumber?: string;
  notes?: string;
}

export const financeApi = {
  // Vendor-scoped
  getSummary: (): Promise<FinanceSummary> =>
    http.get<FinanceSummary>('/vendor/finance/summary'),

  getLedger: (limit = 50): Promise<LedgerEntry[]> =>
    http.get<LedgerEntry[]>(`/vendor/finance/ledger?limit=${limit}`),

  getSettlements: (limit = 20): Promise<Settlement[]> =>
    http.get<Settlement[]>(`/vendor/finance/settlements?limit=${limit}`),

  requestSettlement: (notes?: string): Promise<Settlement> =>
    http.post<Settlement>('/vendor/finance/settlements/request', { notes }),

  // Admin platform finance
  getGlobalOverview: (): Promise<GlobalFinanceOverview> =>
    http.get<GlobalFinanceOverview>('/admin/finance/overview'),

  getShopSummary: (shopId: string): Promise<FinanceSummary> =>
    http.get<FinanceSummary>(`/admin/finance/summary/${encodeURIComponent(shopId)}`),

  getShopLedger: (shopId: string, limit = 50): Promise<LedgerEntry[]> =>
    http.get<LedgerEntry[]>(`/admin/finance/ledger/${encodeURIComponent(shopId)}?limit=${limit}`),

  getShopSettlements: (shopId: string, limit = 20): Promise<Settlement[]> =>
    http.get<Settlement[]>(`/admin/finance/settlements/${encodeURIComponent(shopId)}?limit=${limit}`),

  disburseSettlement: (data: DisburseSettlementPayload): Promise<Settlement> =>
    http.post<Settlement>('/admin/finance/settlements', data),
};
