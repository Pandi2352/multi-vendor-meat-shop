import { http } from '@/lib/http';

export interface FinanceSummary {
  payableBalancePaise: number;
  totalGrossSalesPaise: number;
  totalCommissionDeductedPaise: number;
  pendingSettlementPaise: number;
  totalSettledPayoutPaise: number;
  pendingOrdersCount: number;
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

export const financeApi = {
  getSummary: (): Promise<FinanceSummary> =>
    http.get<FinanceSummary>('/api/v1/vendor/finance/summary'),

  getLedger: (limit = 50): Promise<LedgerEntry[]> =>
    http.get<LedgerEntry[]>(`/api/v1/vendor/finance/ledger?limit=${limit}`),

  getSettlements: (limit = 20): Promise<Settlement[]> =>
    http.get<Settlement[]>(`/api/v1/vendor/finance/settlements?limit=${limit}`),

  requestSettlement: (notes?: string): Promise<Settlement> =>
    http.post<Settlement>('/api/v1/vendor/finance/settlements/request', { notes }),
};
