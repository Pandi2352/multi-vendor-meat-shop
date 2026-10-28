import { useState, useMemo } from 'react';
import { Bike, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { formatINR } from '@/utils/format';
import { toast } from '@/components/ui';
import { getErrorMessage } from '@/lib/api-error';
import { useMyDeliveryTasks, useCompleteDelivery } from '../api/use-delivery';
import type { DeliveryTaskResponse } from '../api/delivery.api';
import { RiderTaskCard } from '../components/rider-task-card';
import { VerifyDeliveryOtpModal } from '../components/verify-delivery-otp-modal';

export function MyDeliveriesPage() {
  const [tab, setTab] = useState<'active' | 'delivered'>('active');
  const [selectedTask, setSelectedTask] = useState<DeliveryTaskResponse | null>(null);

  const { data, isLoading, error } = useMyDeliveryTasks({ limit: 50 }, { refetchInterval: 5000 });
  const completeDelivery = useCompleteDelivery();

  const tasks = data?.items ?? [];

  const { activeTasks, deliveredTasks, cashInHandPaise } = useMemo(() => {
    const active = tasks.filter((t) => t.status === 'ASSIGNED' || t.status === 'PICKED_UP');
    const delivered = tasks.filter((t) => t.status === 'DELIVERED');
    const cash = delivered.reduce((sum, t) => (t.codCollected ? sum + t.codAmountPaise : sum), 0);
    return { activeTasks: active, deliveredTasks: delivered, cashInHandPaise: cash };
  }, [tasks]);

  const displayTasks = tab === 'active' ? activeTasks : deliveredTasks;

  const handleVerify = async ({ otp, collectedCod }: { otp: string; collectedCod: boolean }) => {
    if (!selectedTask) return;
    try {
      await completeDelivery.mutateAsync({
        id: selectedTask.id,
        body: { otp, collectedCod },
      });
      toast.success(`Order ${selectedTask.orderNumber} successfully delivered!`);
      setSelectedTask(null);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to complete delivery. Please check customer OTP.'));
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-text flex items-center gap-2">
          <Bike className="h-5 w-5 text-primary" /> My Deliveries
        </h1>
        <p className="text-xs text-muted mt-0.5">Assigned pickups and customer drop-offs</p>
      </div>

      {/* Quick Status Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-md border border-border bg-surface p-3 text-center">
          <span className="text-[11px] text-muted block uppercase tracking-wider font-semibold">Active</span>
          <span className="text-xl font-bold font-mono text-primary">{activeTasks.length}</span>
        </div>
        <div className="rounded-md border border-border bg-surface p-3 text-center">
          <span className="text-[11px] text-muted block uppercase tracking-wider font-semibold">Delivered</span>
          <span className="text-xl font-bold font-mono text-success">{deliveredTasks.length}</span>
        </div>
        <div className="rounded-md border border-border bg-surface p-3 text-center">
          <span className="text-[11px] text-muted block uppercase tracking-wider font-semibold">Cash in Hand</span>
          <span className="text-base font-bold font-mono text-warning truncate block">
            {formatINR(cashInHandPaise)}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-md border border-border bg-surface p-1">
        <button
          type="button"
          onClick={() => setTab('active')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            tab === 'active' ? 'bg-primary text-primary-foreground' : 'text-muted hover:text-text'
          }`}
        >
          Active Pickups ({activeTasks.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('delivered')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            tab === 'delivered' ? 'bg-primary text-primary-foreground' : 'text-muted hover:text-text'
          }`}
        >
          Completed Today ({deliveredTasks.length})
        </button>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="text-center py-12 text-xs text-muted">Loading assigned tasks...</div>
      ) : error ? (
        <div className="text-center py-12 text-xs text-danger flex items-center justify-center gap-1.5">
          <AlertCircle className="h-4 w-4" /> Failed to load deliveries.
        </div>
      ) : displayTasks.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-8 text-center space-y-2">
          {tab === 'active' ? (
            <>
              <Clock className="h-8 w-8 text-muted mx-auto" />
              <p className="text-sm font-semibold text-text">No active deliveries right now</p>
              <p className="text-xs text-muted">New butcher stall pickups assigned to you will show up here.</p>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-8 w-8 text-muted mx-auto" />
              <p className="text-sm font-semibold text-text">No completed deliveries yet today</p>
              <p className="text-xs text-muted">Orders delivered with verified customer OTPs will appear here.</p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayTasks.map((task) => (
            <RiderTaskCard key={task.id} task={task} onDeliver={(t) => setSelectedTask(t)} />
          ))}
        </div>
      )}

      {/* OTP & COD Modal */}
      {selectedTask && (
        <VerifyDeliveryOtpModal
          isOpen={Boolean(selectedTask)}
          onClose={() => setSelectedTask(null)}
          orderNumber={selectedTask.orderNumber}
          codAmountPaise={selectedTask.codAmountPaise}
          onVerify={handleVerify}
          isSubmitting={completeDelivery.isPending}
        />
      )}
    </div>
  );
}
