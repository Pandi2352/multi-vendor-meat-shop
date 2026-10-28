import { useState, useEffect, useRef } from 'react';
import { Bell, Flame, CheckCircle2, History, Volume2, VolumeX } from 'lucide-react';
import { Spinner, ErrorState, Tabs, Button } from '@/components/ui';
import { useSearchParamState } from '@/hooks';
import { playNewOrderChime } from '@/utils/order-sound';
import { useVendorOrders, useUpdateOrderStatus } from '../api/use-vendor-orders';
import { VendorOrderCard } from '../components/vendor-order-card';
import { VENDOR_ORDER_TABS, type VendorOrderTab } from '../constants/order-tabs';

interface VendorOrdersPageProps {
  onSelectOrder?: (id: string) => void;
}

type TabKey = VendorOrderTab;

export function VendorOrdersPage({ onSelectOrder }: VendorOrdersPageProps) {
  const [activeTab, setActiveTab] = useSearchParamState<TabKey>('tab', VENDOR_ORDER_TABS, 'ACTIVE');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('vendor_order_sound') !== 'disabled';
    } catch {
      return true;
    }
  });

  const { data, isLoading, error, refetch } = useVendorOrders(undefined, { refetchInterval: 10_000 });
  const updateStatus = useUpdateOrderStatus();

  const orders = data?.items ?? [];
  const prevNewCountRef = useRef<number>(0);

  const counts = {
    newOrders: orders.filter((o) => o.status === 'PLACED').length,
    inPrep: orders.filter((o) => ['ACCEPTED', 'PREPARING'].includes(o.status)).length,
    ready: orders.filter((o) => o.status === 'READY').length,
    completed: orders.filter((o) => ['OUT_FOR_DELIVERY', 'DELIVERED', 'REJECTED', 'CANCELLED'].includes(o.status)).length,
  };

  // Play audio chime when a new unfulfilled order arrives
  useEffect(() => {
    if (counts.newOrders > prevNewCountRef.current && soundEnabled) {
      playNewOrderChime();
    }
    prevNewCountRef.current = counts.newOrders;
  }, [counts.newOrders, soundEnabled]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      localStorage.setItem('vendor_order_sound', next ? 'enabled' : 'disabled');
      if (next) playNewOrderChime();
    } catch {
      // storage unavailable
    }
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
    <div className="space-y-5">
      {/* High-visibility alert banner when incoming orders require acceptance */}
      {counts.newOrders > 0 && (
        <div className="p-4 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-md bg-amber-500/20 text-amber-600">
              <Bell className="h-5 w-5 animate-bounce" />
            </span>
            <div>
              <p className="font-bold text-sm">
                {counts.newOrders} New Customer Order{counts.newOrders > 1 ? 's' : ''} Received!
              </p>
              <p className="text-xs text-muted">
                Fresh meat cuts requested. Please accept and begin cutting to meet the delivery ETA.
              </p>
            </div>
          </div>
          {activeTab !== 'NEW' && (
            <Button variant="primary" size="sm" onClick={() => setActiveTab('NEW')}>
              View New Orders
            </Button>
          )}
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-text">Live Butchery Queue</h2>
            <span className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Feed (10s)
            </span>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Accept cuts, record precise dressed weights, and mark parcels ready for courier dispatch.
          </p>
        </div>

        {/* Audio notification toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSound}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
              soundEnabled
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-surface border-border text-muted hover:text-text'
            }`}
            title={soundEnabled ? 'Order sound alert enabled' : 'Order sound alert muted'}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span>{soundEnabled ? 'Chime Alert On' : 'Chime Muted'}</span>
          </button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center overflow-x-auto">
        <Tabs<TabKey>
          tabs={[
            { key: 'ACTIVE', label: 'Active Queue', count: counts.newOrders + counts.inPrep + counts.ready, icon: Flame },
            { key: 'NEW', label: 'New Requests', count: counts.newOrders, alert: counts.newOrders > 0 },
            { key: 'PREP', label: 'Cutting & Packing', count: counts.inPrep },
            { key: 'READY', label: 'Ready for Courier', count: counts.ready, icon: CheckCircle2 },
            { key: 'COMPLETED', label: 'Past Orders', count: counts.completed, icon: History },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-12 text-center bg-surface space-y-1">
          <p className="text-sm font-medium text-text">Queue is all clear</p>
          <p className="text-xs text-muted">No orders in this stage right now.</p>
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
