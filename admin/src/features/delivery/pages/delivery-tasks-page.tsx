import { useState } from 'react';
import { Truck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Spinner, ErrorState } from '@/components/ui';
import {
  useDeliveryTasks,
  useAssignPartner,
  usePickupDelivery,
  useCompleteDelivery,
} from '../api/use-delivery';
import { DeliveryTaskCard } from '../components/delivery-task-card';

type TabKey = 'ALL' | 'UNASSIGNED' | 'IN_TRANSIT' | 'DELIVERED';

export function DeliveryTasksPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('ALL');
  const { data, isLoading, error, refetch } = useDeliveryTasks(undefined, { refetchInterval: 10_000 });
  const assignPartner = useAssignPartner();
  const pickup = usePickupDelivery();
  const completeDelivery = useCompleteDelivery();

  const tasks = data?.items ?? [];

  const counts = {
    unassigned: tasks.filter((t) => t.status === 'UNASSIGNED').length,
    inTransit: tasks.filter((t) => ['ASSIGNED', 'PICKED_UP'].includes(t.status)).length,
    delivered: tasks.filter((t) => t.status === 'DELIVERED').length,
  };

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'UNASSIGNED') return t.status === 'UNASSIGNED';
    if (activeTab === 'IN_TRANSIT') return ['ASSIGNED', 'PICKED_UP'].includes(t.status);
    if (activeTab === 'DELIVERED') return t.status === 'DELIVERED';
    return true;
  });

  const isUpdating = assignPartner.isPending || pickup.isPending || completeDelivery.isPending;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
        <p className="mt-3 text-xs text-muted">Loading fleet task roster...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorState
          title="Failed to load delivery tasks"
          description={error.message}
          actionLabel="Retry"
          onAction={() => { void refetch(); }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-text">Delivery Fleet Orchestration</h2>
            <span className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-md border border-info/30 bg-info-soft text-info">
              <span className="h-2 w-2 rounded-full bg-info animate-pulse" />
              Live Fleet
            </span>
          </div>
          <p className="text-xs text-muted mt-1">
            Dispatch hyper-local riders, track shop pickup, and enforce OTP proof with COD cash settlement.
          </p>
        </div>

        {counts.unassigned > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-warning/30 bg-warning-soft text-warning text-xs font-medium">
            <AlertCircle className="h-4 w-4" />
            <span>{counts.unassigned} order(s) awaiting courier assignment!</span>
          </div>
        )}
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto text-xs">
        {[
          { key: 'ALL' as TabKey, label: 'All Tasks', count: tasks.length },
          { key: 'UNASSIGNED' as TabKey, label: 'Awaiting Courier', count: counts.unassigned, icon: Clock, alert: counts.unassigned > 0 },
          { key: 'IN_TRANSIT' as TabKey, label: 'In Transit', count: counts.inTransit, icon: Truck },
          { key: 'DELIVERED' as TabKey, label: 'Delivered (COD Paid)', count: counts.delivered, icon: CheckCircle2 },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'text-muted hover:text-text hover:bg-surface-muted'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === tab.key
                  ? 'bg-white/20 text-primary-foreground'
                  : tab.alert
                  ? 'bg-warning text-black'
                  : 'bg-surface-muted text-muted'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-12 text-center bg-surface">
          <p className="text-sm font-medium text-text mb-1">No active delivery tasks</p>
          <p className="text-xs text-muted">When butchers mark cuts ready, tasks will appear here for dispatch.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <DeliveryTaskCard
              key={task.id}
              task={task}
              onAssign={async (partner) => {
                await assignPartner.mutateAsync({ id: task.id, body: partner });
              }}
              onPickup={async () => {
                await pickup.mutateAsync(task.id);
              }}
              onDeliver={async (data) => {
                await completeDelivery.mutateAsync({ id: task.id, body: data });
              }}
              isUpdating={isUpdating}
            />
          ))}
        </div>
      )}
    </div>
  );
}
