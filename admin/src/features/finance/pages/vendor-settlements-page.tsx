import { useState } from 'react';
import { CircleDollarSign, Landmark, RefreshCw, Send } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatINR } from '@/utils/format';
import {
  useFinanceSummary,
  useLedgerEntries,
  useRequestSettlement,
  useSettlements,
} from '../api/use-finance';
import { SettlementCard } from '../components/settlement-card';
import { LedgerTable } from '../components/ledger-table';

export function VendorSettlementsPage() {
  const [activeTab, setActiveTab] = useState<'SETTLEMENTS' | 'LEDGER'>('SETTLEMENTS');
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [notes, setNotes] = useState('Standard weekly settlement payout request');

  const { data: summary, isLoading: isLoadingSummary, refetch: refetchSummary } = useFinanceSummary();
  const { data: settlements = [], isLoading: isLoadingSettlements } = useSettlements();
  const { data: ledgerEntries = [], isLoading: isLoadingLedger } = useLedgerEntries();
  const requestMutation = useRequestSettlement();

  const handleRequestPayout = async () => {
    await requestMutation.mutateAsync(notes);
    setRequestModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text flex items-center gap-2">
            <CircleDollarSign className="h-6 w-6 text-primary" />
            Financial Ledger & Settlements
          </h1>
          <p className="text-xs text-muted mt-1">
            Double-entry running ledger in integer paise, automated 10% platform commission on COD delivery, and payout history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchSummary()}
            loading={isLoadingSummary}
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setRequestModalOpen(true)}
            disabled={!summary || summary.pendingOrdersCount === 0}
          >
            <Send className="h-4 w-4 mr-1.5" />
            Request Payout ({summary?.pendingOrdersCount ?? 0})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-md border border-border bg-surface p-4">
          <span className="text-xs text-muted block mb-1">Available Payable Balance</span>
          <span className="text-lg font-bold text-emerald-500">
            {formatINR(summary?.payableBalancePaise ?? 0)}
          </span>
        </div>
        <div className="rounded-md border border-border bg-surface p-4">
          <span className="text-xs text-muted block mb-1">Total COD Sales (Gross)</span>
          <span className="text-lg font-bold text-text">
            {formatINR(summary?.totalGrossSalesPaise ?? 0)}
          </span>
        </div>
        <div className="rounded-md border border-border bg-surface p-4">
          <span className="text-xs text-muted block mb-1">Platform Commission (10%)</span>
          <span className="text-lg font-bold text-amber-500">
            {formatINR(summary?.totalCommissionDeductedPaise ?? 0)}
          </span>
        </div>
        <div className="rounded-md border border-border bg-surface p-4">
          <span className="text-xs text-muted block mb-1">Disbursed Payouts</span>
          <span className="text-lg font-bold text-text">
            {formatINR(summary?.totalSettledPayoutPaise ?? 0)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Button
          variant={activeTab === 'SETTLEMENTS' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('SETTLEMENTS')}
        >
          <Landmark className="h-4 w-4 mr-1.5" />
          Settlement Batches ({settlements.length})
        </Button>
        <Button
          variant={activeTab === 'LEDGER' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('LEDGER')}
        >
          <CircleDollarSign className="h-4 w-4 mr-1.5" />
          Double-Entry Ledger ({ledgerEntries.length})
        </Button>
      </div>

      {activeTab === 'SETTLEMENTS' ? (
        isLoadingSettlements ? (
          <div className="text-center py-12 text-xs text-muted">Loading settlements...</div>
        ) : settlements.length === 0 ? (
          <div className="text-center py-12 rounded-md border border-dashed border-border bg-surface text-xs text-muted">
            No settlements generated yet. When delivered COD orders accumulate, click &quot;Request Payout&quot; to batch settle.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settlements.map((s) => (
              <SettlementCard key={s.id} settlement={s} />
            ))}
          </div>
        )
      ) : (
        <LedgerTable entries={ledgerEntries} isLoading={isLoadingLedger} />
      )}

      {requestModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-md border border-border bg-surface p-6 space-y-4">
            <div className="flex items-center gap-2 text-text font-semibold">
              <Landmark className="h-5 w-5 text-primary" />
              <span>Confirm Payout Settlement</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              You have <strong>{summary?.pendingOrdersCount}</strong> delivered COD orders eligible for payout.
              The automated platform commission of 10% is deducted, leaving a net disbursal of:
            </p>
            <div className="rounded-md border border-border bg-surface-raised p-4 text-center">
              <span className="text-xs text-muted block mb-1">Net Disbursal to Bank Account</span>
              <span className="text-xl font-bold text-emerald-500">
                {formatINR(summary?.pendingSettlementPaise ?? 0)}
              </span>
            </div>
            <div>
              <label className="block text-xs font-medium text-text mb-1">Settlement Memo / Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button variant="ghost" size="sm" onClick={() => setRequestModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleRequestPayout}
                loading={requestMutation.isPending}
              >
                Confirm Payout
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
