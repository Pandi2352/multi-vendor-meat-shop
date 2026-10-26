import { useState } from 'react';
import { Bell, Flame, CheckCircle2, History } from 'lucide-react';
import { Spinner, ErrorState, Tabs } from '@/components/ui';
import { useVendorOrders, useUpdateOrderStatus } from '../api/use-vendor-orders';
import { VendorOrderCard } from '../components/vendor-order-card';

interface VendorOrdersPageProps {
  onSelectOrder?: (id: string) => void;
}

type TabKey = 'ACTIVE' | 'NEW' | 'PREP' | 'READY' | 'COMPLETED';

export function VendorOrdersPage({ onSelectOrder }: VendorOrdersPageProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('ACTIVE');
  const { data, isLoading, error, refetch } = useVendorOrders(undefined, { refetchInterval: 10_000 });
  const updateStatus = useUpdateOrderStatus();

  const orders = data?.items ?? [];

  const counts = {
    newOrders: orders.filter((o) => o.status === 'PLACED').length,
    inPrep: orders.filter((o) => ['ACCEPTED', 'PREPARING'].includes(o.status)).length,
    ready: orders.filter((o) => o.status === 'READY').length,
    completed: orders.filter((o) => ['OUT_FOR_DELIVERY', 'DELIVERED', 'REJECTED', 'CANCELLED'].includes(o.status)).length,
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'NEW') return o.status === 'PLACED';
    if (activeTab === 'PREP') return ['ACCEPTED', 'PREPARING'].includes(o.status);
    if (activeTab === 'READY') return o.status === 'READY';
    if (activeTab === 'COMPLETED') return ['OUT_FOR_DELIVERY', 'DELIVERED', 'REJECTED', 'CANCELLED'].includes(o.status);
    return ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status);
  });

  const handleStatusChange = async (
    orderId: string,
    status: string,
    reason?: string,
    actualWeights?: Record<string, number>,
  ) => {
    await updateStatus.mutateAsync({
      id: orderId,
      body: { status: status as never, reason, actualPackedWeights: actualWeights },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
        <p className="mt-3 text-xs text-muted">Syncing live butcher queue...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorState
          title="Failed to load orders"
          description={error.message}
          actionLabel="Retry"
          onAction={() => { void refetch(); }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-text">Live Fulfilment Queue</h2>
            <span className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-md border border-success/30 bg-success-soft text-success">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              Live Feed
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            Accept cuts, weigh portions precisely, and notify delivery courier when ready.
          </p>
        </div>

        {counts.newOrders > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-warning/30 bg-warning-soft text-warning text-xs font-medium">
            <Bell className="h-4 w-4 animate-bounce" />
            <span>{counts.newOrders} new order(s) awaiting acceptance!</span>
          </div>
        )}
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center overflow-x-auto">
        <Tabs<TabKey>
          tabs={[
            { key: 'ACTIVE', label: 'Active Queue', count: counts.newOrders + counts.inPrep + counts.ready, icon: Flame },
            { key: 'NEW', label: 'New Requests', count: counts.newOrders, alert: counts.newOrders > 0 },
            { key: 'PREP', label: 'Cutting & Packing', count: counts.inPrep },
            { key: 'READY', label: 'Ready for Dispatch', count: counts.ready, icon: CheckCircle2 },
            { key: 'COMPLETED', label: 'Completed / Past', count: counts.completed, icon: History },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-12 text-center bg-surface">
          <p className="text-sm font-medium text-text mb-1">Queue is all clear</p>
          <p className="text-xs text-muted">No orders matching this filter right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <VendorOrderCard
              key={order.id}
              order={order}
              onStatusChange={(status, reason, weights) =>
                handleStatusChange(order.id, status, reason, weights)
              }
              onViewDetails={onSelectOrder}
              isUpdating={updateStatus.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
