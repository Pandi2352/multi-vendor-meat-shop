export const financeKeys = {
  all: ['finance'] as const,
  summary: () => [...financeKeys.all, 'summary'] as const,
  ledger: (limit: number) => [...financeKeys.all, 'ledger', limit] as const,
  settlements: (limit: number) => [...financeKeys.all, 'settlements', limit] as const,
  overview: () => [...financeKeys.all, 'admin-overview'] as const,
  adminShopSummary: (shopId: string) => [...financeKeys.all, 'admin-summary', shopId] as const,
  adminShopLedger: (shopId: string, limit: number) => [...financeKeys.all, 'admin-ledger', shopId, limit] as const,
  adminShopSettlements: (shopId: string, limit: number) => [...financeKeys.all, 'admin-settlements', shopId, limit] as const,
};
