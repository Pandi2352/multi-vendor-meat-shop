import { ArrowRight, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Panel } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { formatDateIST, formatINR } from '@/utils/format';
import type { VendorPayoutSummary } from '../api/dashboard.api';
import { SummaryList } from './summary-list';

/** Owner-only money summary: what the shop is owed and the last payout. */
export function PayoutsPanel({ payouts }: { payouts: VendorPayoutSummary }) {
  const last = payouts.lastPayout;
  return (
    <Panel
      title="Payouts"
      icon={Wallet}
      action={
        <Link to={ROUTES.VENDOR_SETTLEMENTS} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          Settlements <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
        </Link>
      }
    >
      <SummaryList
        rows={[
          { label: 'Owed to you', value: formatINR(payouts.payableBalancePaise), strong: true },
          { label: 'Not yet settled', value: formatINR(payouts.pendingSettlementPaise) },
          { label: 'Paid out so far', value: formatINR(payouts.totalSettledPayoutPaise) },
          {
            label: 'Last payout',
            value: last ? `${formatINR(last.netPayoutPaise)} · ${formatDateIST(last.createdAt)}` : 'None yet',
          },
        ]}
      />
    </Panel>
  );
}
