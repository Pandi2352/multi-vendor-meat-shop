import { CheckCircle2, Clock, Landmark } from 'lucide-react';
import { formatDateIST, formatINR } from '@/utils/format';
import type { Settlement } from '../api/finance.api';

interface SettlementCardProps {
  settlement: Settlement;
}

export function SettlementCard({ settlement }: SettlementCardProps) {
  const isSettled = settlement.status === 'SETTLED';

  return (
    <div className="rounded-md border border-border bg-surface p-4 flex flex-col justify-between gap-4">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Landmark className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold text-text">{settlement.settlementNumber}</h4>
            </div>
            <span className="text-xs text-muted block mt-1">
              {formatDateIST(settlement.periodStart)} – {formatDateIST(settlement.periodEnd)}
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
              isSettled
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
            }`}
          >
            {isSettled ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
            {settlement.status}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-md border border-border bg-surface-raised p-2">
            <span className="text-muted block mb-0.5">Orders Settle Count</span>
            <span className="text-sm font-bold text-text">{settlement.orderCount} COD Orders</span>
          </div>
          <div className="rounded-md border border-border bg-surface-raised p-2">
            <span className="text-muted block mb-0.5">Gross Cash Value</span>
            <span className="text-sm font-bold text-text">{formatINR(settlement.grossSalesPaise)}</span>
          </div>
          <div className="rounded-md border border-border bg-surface-raised p-2">
            <span className="text-muted block mb-0.5">Platform Cut (10%)</span>
            <span className="text-sm font-semibold text-amber-500">
              - {formatINR(settlement.commissionDeductedPaise)}
            </span>
          </div>
          <div className="rounded-md border border-border bg-surface-raised p-2">
            <span className="text-muted block mb-0.5">Net Disbursed Payout</span>
            <span className="text-sm font-bold text-emerald-500">
              {formatINR(settlement.netPayoutPaise)}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted">
        <div>
          {settlement.utrNumber ? (
            <span>
              Bank UTR: <strong className="text-text font-mono">{settlement.utrNumber}</strong>
            </span>
          ) : (
            <span>UTR pending bank disbursement</span>
          )}
        </div>
        {settlement.settledAt ? <span>{formatDateIST(settlement.settledAt)}</span> : null}
      </div>
    </div>
  );
}
