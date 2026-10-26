import { useState } from 'react';
import { Gavel, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatINR } from '@/utils/format';
import { useDisputes, useResolveDispute, type Dispute, type DisputeReason, type DisputeStatus, type ResolveDisputePayload } from '../api';
import { DisputeCard } from '../components/dispute-card';
import { DisputeFilterBar } from '../components/dispute-filter-bar';
import { ResolveDisputeModal } from '../components/resolve-dispute-modal';

export function AdminDisputesPage() {
  const [statusFilter, setStatusFilter] = useState<DisputeStatus | undefined>(undefined);
  const [reasonFilter, setReasonFilter] = useState<DisputeReason | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [activeDispute, setActiveDispute] = useState<Dispute | null>(null);

  const { data, isLoading, refetch } = useDisputes({
    status: statusFilter,
    reason: reasonFilter,
    search: search.trim() || undefined,
  });

  const disputes = data?.items || [];
  const resolveMutation = useResolveDispute();

  const handleResolveSubmit = (id: string, payload: ResolveDisputePayload) => {
    resolveMutation.mutate(
      { id, payload },
      {
        onSuccess: () => setActiveDispute(null),
      },
    );
  };

  const openCount = disputes.filter((d) => d.status === 'OPEN').length;
  const underReviewCount = disputes.filter((d) => d.status === 'UNDER_REVIEW').length;
  const totalRefundedPaise = disputes.reduce((sum, d) => sum + (d.refundAmountPaise || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Gavel className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-text">Customer Disputes & Refund Arbitration</h1>
          </div>
          <p className="text-xs text-muted mt-1">
            Meat freshness issues, underweight claims, incorrect cuts, and stall ledger debits
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} loading={isLoading}>
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="rounded-md border border-border bg-surface p-4 space-y-1">
          <span className="text-muted block text-[11px]">Total Disputes</span>
          <p className="text-lg font-bold text-text">{data?.total || 0}</p>
          <span className="text-[10px] text-muted">Customer claims filed</span>
        </div>
        <div className="rounded-md border border-border bg-surface p-4 space-y-1">
          <span className="text-muted block text-[11px]">Awaiting Arbitration</span>
          <p className="text-lg font-bold text-rose-500">{openCount}</p>
          <span className="text-[10px] text-rose-500/80">Immediate resolution required</span>
        </div>
        <div className="rounded-md border border-border bg-surface p-4 space-y-1">
          <span className="text-muted block text-[11px]">Under Investigation</span>
          <p className="text-lg font-bold text-amber-500">{underReviewCount}</p>
          <span className="text-[10px] text-muted">Verifying scales & photos</span>
        </div>
        <div className="rounded-md border border-border bg-surface p-4 space-y-1">
          <span className="text-muted block text-[11px]">Refunds Disbursed</span>
          <p className="text-lg font-bold text-emerald-600">{formatINR(totalRefundedPaise)}</p>
          <span className="text-[10px] text-muted">Settled customer refunds</span>
        </div>
      </div>

      {/* Filter Bar */}
      <DisputeFilterBar
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        reasonFilter={reasonFilter}
        onReasonChange={setReasonFilter}
        search={search}
        onSearchChange={setSearch}
      />

      {/* Content */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-muted">Loading disputes...</div>
      ) : disputes.length === 0 ? (
        <div className="rounded-md border border-border bg-surface p-12 text-center space-y-2">
          <ShieldCheck className="h-8 w-8 text-emerald-600 mx-auto" />
          <p className="text-sm font-semibold text-text">No Disputes Found</p>
          <p className="text-xs text-muted max-w-sm mx-auto">
            There are currently no customer meat disputes matching the selected filter criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map((dispute) => (
            <DisputeCard key={dispute.id} dispute={dispute} onResolve={setActiveDispute} />
          ))}
        </div>
      )}

      {/* Arbitration Modal */}
      <ResolveDisputeModal
        dispute={activeDispute}
        isOpen={Boolean(activeDispute)}
        onClose={() => setActiveDispute(null)}
        onSubmit={handleResolveSubmit}
        isSubmitting={resolveMutation.isPending}
      />
    </div>
  );
}
