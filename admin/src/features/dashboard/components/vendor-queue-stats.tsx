import { Bell, Bike, PackageCheck, Scissors } from 'lucide-react';
import { StatCard } from '@/components/ui';
import { vendorOrdersTabPath } from '@/features/orders';
import { formatNumber } from '@/utils/format';
import type { VendorDashboard } from '../api/dashboard.api';

/** The four prep-queue stages, each linking to its tab on the orders page. */
export function VendorQueueStats({ inProgress }: { inProgress: VendorDashboard['inProgress'] }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label="New orders"
        value={formatNumber(inProgress.newOrders)}
        hint={inProgress.newOrders > 0 ? 'Waiting for you to accept' : 'Nothing waiting'}
        icon={Bell}
        tone="warning"
        attention={inProgress.newOrders > 0}
        to={vendorOrdersTabPath('NEW')}
      />
      <StatCard
        label="Cutting & packing"
        value={formatNumber(inProgress.preparing)}
        hint="Accepted or being prepared"
        icon={Scissors}
        tone="primary"
        to={vendorOrdersTabPath('PREP')}
      />
      <StatCard
        label="Ready for pickup"
        value={formatNumber(inProgress.ready)}
        hint="Packed, waiting for a rider"
        icon={PackageCheck}
        tone="success"
        to={vendorOrdersTabPath('READY')}
      />
      <StatCard
        label="Out for delivery"
        value={formatNumber(inProgress.outForDelivery)}
        hint="On the way to customers"
        icon={Bike}
        tone="info"
        to={vendorOrdersTabPath('COMPLETED')}
      />
    </div>
  );
}
