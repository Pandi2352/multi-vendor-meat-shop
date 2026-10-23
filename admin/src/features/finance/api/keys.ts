export const financeKeys = {
  all: ['finance'] as const,
  summary: () => [...financeKeys.all, 'summary'] as const,
  ledger: (limit = 50) => [...financeKeys.all, 'ledger', limit] as const,
  settlements: (limit = 20) => [...financeKeys.all, 'settlements', limit] as const,
};
