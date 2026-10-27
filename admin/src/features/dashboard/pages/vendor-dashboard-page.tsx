import { Badge, ErrorState, LoaderState, type BadgeProps } from '@/components/ui';
import { useCurrentUser } from '@/features/auth';
import { getErrorMessage } from '@/lib/api-error';
import type { VendorDashboard } from '../api/dashboard.api';
import { useVendorDashboard } from '../api/use-vendor-dashboard';
import { DashboardHeader } from '../components/dashboard-header';
import { OrderQueuePreview } from '../components/order-queue-preview';
import { PayoutsPanel } from '../components/payouts-panel';
import { StockAlertsPanel } from '../components/stock-alerts-panel';
import { TodayPanel } from '../components/today-panel';
import { VendorQueueStats } from '../components/vendor-queue-stats';

const SHOP_STATUS: Record<VendorDashboard['shop']['shopStatus'], { label: string; tone: BadgeProps['tone'] }> = {
  OPEN: { label: 'Open for orders', tone: 'success' },
  PAUSED: { label: 'Paused', tone: 'warning' },
  CLOSED: { label: 'Closed', tone: 'neutral' },
};

/** Home for shop owners and staff: what needs doing now, today's numbers, stock, and (owners) payouts. */
export function VendorDashboardPage() {
  const user = useCurrentUser();
  const { data, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } = useVendorDashboard();

  if (isLoading) return <LoaderState title="Loading your shop…" description="Orders, stock and payouts" />;
  if (isError || !data) {
    return (
      <ErrorState
        title="Couldn’t load your dashboard"
        description={getErrorMessage(error)}
        actionLabel="Try again"
        onAction={() => void refetch()}
      />
    );
  }

  const status = SHOP_STATUS[data.shop.shopStatus];
  const firstName = user?.name.split(' ')[0];

  return (
    <div className="flex w-full flex-col gap-5">
      <DashboardHeader
        title={data.shop.shopName}
        subtitle={firstName ? `Vanakkam, ${firstName}. Here’s your shop today.` : 'Here’s your shop today.'}
        badge={
          <Badge tone={status.tone} size="sm" dot>
            {status.label}
          </Badge>
        }
        date={data.date}
        updatedAt={dataUpdatedAt}
        refreshing={isFetching}
        onRefresh={() => void refetch()}
      />

      <VendorQueueStats inProgress={data.inProgress} />

      <div className="grid gap-5 lg:grid-cols-3">
        <OrderQueuePreview orders={data.queue} className="lg:col-span-2" />
        <TodayPanel today={data.today} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <StockAlertsPanel stock={data.stock} className={data.payouts ? 'lg:col-span-2' : 'lg:col-span-3'} />
        {data.payouts && <PayoutsPanel payouts={data.payouts} />}
      </div>
    </div>
  );
}
