import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { financeKeys } from './keys';
import { financeApi } from './finance.api';

export const useFinanceSummary = () => {
  return useQuery({
    queryKey: financeKeys.summary(),
    queryFn: () => financeApi.getSummary(),
    refetchInterval: 30_000,
  });
};

export const useLedgerEntries = (limit = 50) => {
  return useQuery({
    queryKey: financeKeys.ledger(limit),
    queryFn: () => financeApi.getLedger(limit),
  });
};

export const useSettlements = (limit = 20) => {
  return useQuery({
    queryKey: financeKeys.settlements(limit),
    queryFn: () => financeApi.getSettlements(limit),
  });
};

export const useRequestSettlement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notes?: string) => financeApi.requestSettlement(notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.all });
    },
  });
};
