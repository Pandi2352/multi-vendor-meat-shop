import { formatINR } from '@/utils/format';
import type { GlobalFinanceOverview } from '../api';

interface MarketplaceOverviewTilesProps {
  overview?: GlobalFinanceOverview;
}

export function MarketplaceOverviewTiles({ overview }: MarketplaceOverviewTilesProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
      <div className="rounded-md border border-border bg-surface p-4 space-y-1">
        <span className="text-muted block text-[11px]">Total Marketplace GMV</span>
        <p className="text-lg font-bold text-text">{formatINR(overview?.totalGrossSalesPaise || 0)}</p>
        <span className="text-[10px] text-muted">All butcher stall meat orders</span>
      </div>
      <div className="rounded-md border border-border bg-surface p-4 space-y-1">
        <span className="text-muted block text-[11px]">Platform Commission (10%)</span>
        <p className="text-lg font-bold text-primary">{formatINR(overview?.totalCommissionCollectedPaise || 0)}</p>
        <span className="text-[10px] text-emerald-600 font-medium">Platform revenue retained</span>
      </div>
      <div className="rounded-md border border-border bg-surface p-4 space-y-1">
        <span className="text-muted block text-[11px]">Pending Vendor Payouts</span>
        <p className="text-lg font-bold text-amber-500">{formatINR(overview?.pendingPayoutPaise || 0)}</p>
        <span className="text-[10px] text-muted">{overview?.pendingOrdersCount || 0} delivered orders awaiting payout</span>
      </div>
      <div className="rounded-md border border-border bg-surface p-4 space-y-1">
        <span className="text-muted block text-[11px]">Completed Payouts</span>
        <p className="text-lg font-bold text-emerald-600">{formatINR(overview?.completedPayoutPaise || 0)}</p>
        <span className="text-[10px] text-muted">{overview?.settlementsCount || 0} batches settled via bank transfer</span>
      </div>
    </div>
  );
}
