import { useState } from 'react';
import { BadgeIndianRupee, RefreshCw, Send, Receipt, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatINR } from '@/utils/format';
import { tokenStorage } from '@/lib/token-storage';
import { ShopSwitcher, useAllShops } from '@/features/vendor-shops';
import {
  useGlobalFinanceOverview,
  useAdminShopSummary,
  useAdminShopLedger,
  useAdminShopSettlements,
  useDisburseSettlement,
  type Settlement,
} from '../api';
import { SettlementCard } from '../components/settlement-card';
import { LedgerTable } from '../components/ledger-table';
import { DisburseSettlementModal } from '../components/disburse-settlement-modal';
import { MarketplaceOverviewTiles } from '../components/marketplace-overview-tiles';

export function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState<'SETTLEMENTS' | 'LEDGER'>('SETTLEMENTS');
  const [disburseModalOpen, setDisburseModalOpen] = useState(false);

  const { data: shopsData } = useAllShops();
  const shops = shopsData?.items || [];
  const currentShopId = tokenStorage.getActiveShopId() || shops[0]?.id || '';
  const currentShop = shops.find((s) => s.id === currentShopId);

  const { data: overview, isLoading: isLoadingOverview, refetch: refetchOverview } = useGlobalFinanceOverview();
  const { data: shopSummary, isLoading: isLoadingSummary, refetch: refetchSummary } = useAdminShopSummary(currentShopId);
  const { data: settlements = [], isLoading: isLoadingSettlements } = useAdminShopSettlements(currentShopId);
  const { data: ledgerEntries = [], isLoading: isLoadingLedger } = useAdminShopLedger(currentShopId);

  const disburseMutation = useDisburseSettlement();

  const handleRefresh = () => {
    refetchOverview();
    refetchSummary();
  };

  const handleDisburse = (data: { shopId: string; utrNumber?: string; notes?: string }) => {
    disburseMutation.mutate(data, {
      onSuccess: () => setDisburseModalOpen(false),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BadgeIndianRupee className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-text">Marketplace Revenue & Vendor Settlements</h1>
          </div>
          <p className="text-xs text-muted mt-1">
            Platform commissions, butcher stall payout disbursements, and double-entry ledger
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} loading={isLoadingOverview || isLoadingSummary}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Global Marketplace KPI Tiles */}
      <MarketplaceOverviewTiles overview={overview} />

      {/* Stall-Specific Settlement Controls */}
      <div className="p-4 rounded-md border border-border bg-surface space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <ShopSwitcher />
            <div className="hidden md:block text-xs text-muted">
              Current Payable Balance: <strong className="text-text">{formatINR(shopSummary?.payableBalancePaise || 0)}</strong>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setDisburseModalOpen(true)}
            disabled={!shopSummary || shopSummary.pendingOrdersCount === 0}
            className="gap-1.5"
          >
            <Send className="h-4 w-4" />
            <span>Disburse Payout ({shopSummary?.pendingOrdersCount || 0} orders)</span>
          </Button>
        </div>

        {/* Stall Tabs */}
        <div className="flex rounded-md border border-border p-0.5 bg-surface-muted w-fit text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('SETTLEMENTS')}
            className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'SETTLEMENTS' ? 'bg-surface text-text border border-border' : 'text-muted hover:text-text'
            }`}
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>Settlement Batches ({settlements.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('LEDGER')}
            className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'LEDGER' ? 'bg-surface text-text border border-border' : 'text-muted hover:text-text'
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Double-Entry Ledger ({ledgerEntries.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'SETTLEMENTS' ? (
          isLoadingSettlements ? (
            <div className="py-8 text-center text-xs text-muted">Loading settlements...</div>
          ) : settlements.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">
              No settlements disbursed yet for this stall.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {settlements.map((s: Settlement) => (
                <SettlementCard key={s.id} settlement={s} />
              ))}
            </div>
          )
        ) : (
          <LedgerTable entries={ledgerEntries} isLoading={isLoadingLedger} />
        )}
      </div>

      <DisburseSettlementModal
        shopId={currentShopId}
        shopName={currentShop?.name || 'Butcher Stall'}
        summary={shopSummary || null}
        isOpen={disburseModalOpen}
        onClose={() => setDisburseModalOpen(false)}
        onSubmit={handleDisburse}
        isSubmitting={disburseMutation.isPending}
      />
    </div>
  );
}
