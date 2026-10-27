import { CalendarDays } from 'lucide-react';
import { Panel } from '@/components/ui';
import { formatINR, formatNumber } from '@/utils/format';
import type { VendorDashboard } from '../api/dashboard.api';
import { SummaryList } from './summary-list';

/** Today's totals for the shop (IST day). */
export function TodayPanel({ today }: { today: VendorDashboard['today'] }) {
  return (
    <Panel title="Today" description="Since midnight" icon={CalendarDays}>
      <SummaryList
        rows={[
          { label: 'Order value', value: formatINR(today.salesPaise), strong: true },
          { label: 'Orders placed', value: formatNumber(today.orders) },
          { label: 'Delivered', value: formatNumber(today.delivered) },
          { label: 'Cancelled or rejected', value: formatNumber(today.cancelled) },
        ]}
      />
    </Panel>
  );
}
