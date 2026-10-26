import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { financeApi, type DisburseSettlementPayload } from './finance.api';
import { financeKeys } from './keys';

export const useFinanceSummary = () =>
  useQuery({
    queryKey: financeKeys.summary(),
    queryFn: () => financeApi.getSummary(),
  });

export const useLedgerEntries = (limit = 50) =>
  useQuery({
    queryKey: financeKeys.ledger(limit),
    queryFn: () => financeApi.getLedger(limit),
  });

export const useSettlements = (limit = 20) =>
  useQuery({
    queryKey: financeKeys.settlements(limit),
    queryFn: () => financeApi.getSettlements(limit),
  });

export const useRequestSettlement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notes?: string) => financeApi.requestSettlement(notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.all });
    },
  });
};

// Admin platform hooks
export const useGlobalFinanceOverview = () =>
  useQuery({
    queryKey: financeKeys.overview(),
    queryFn: () => financeApi.getGlobalOverview(),
  });

export const useAdminShopSummary = (shopId: string) =>
  useQuery({
    queryKey: financeKeys.adminShopSummary(shopId),
    queryFn: () => financeApi.getShopSummary(shopId),
    enabled: Boolean(shopId),
  });

export const useAdminShopLedger = (shopId: string, limit = 50) =>
  useQuery({
    queryKey: financeKeys.adminShopLedger(shopId, limit),
    queryFn: () => financeApi.getShopLedger(shopId, limit),
    enabled: Boolean(shopId),
  });

export const useAdminShopSettlements = (shopId: string, limit = 20) =>
  useQuery({
    queryKey: financeKeys.adminShopSettlements(shopId, limit),
    queryFn: () => financeApi.getShopSettlements(shopId, limit),
    enabled: Boolean(shopId),
  });

export const useDisburseSettlement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DisburseSettlementPayload) => financeApi.disburseSettlement(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.all });
    },
  });
};
