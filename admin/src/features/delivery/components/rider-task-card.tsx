import { useState } from 'react';
import { Store, MapPin, Navigation, CheckCircle2, PackageCheck } from 'lucide-react';
import { Button, Alert, toast } from '@/components/ui';
import { getErrorMessage } from '@/lib/api-error';
import { formatINR } from '@/utils/format';
import type { DeliveryTaskResponse } from '../api/delivery.api';
import { DeliveryStatusBadge } from './delivery-status-badge';
import { usePickupDelivery } from '../api/use-delivery';

interface RiderTaskCardProps {
  task: DeliveryTaskResponse;
  onDeliver: (task: DeliveryTaskResponse) => void;
}

export function RiderTaskCard({ task, onDeliver }: RiderTaskCardProps) {
  const pickup = usePickupDelivery();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAssigned = task.status === 'ASSIGNED';
  const isPickedUp = task.status === 'PICKED_UP';
  const isDelivered = task.status === 'DELIVERED';

  const pickupQuery = encodeURIComponent(`${task.pickupAddress.text}, ${task.pickupAddress.district}`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${pickupQuery}`;

  const handlePickup = async () => {
    try {
      setErrorMsg(null);
      await pickup.mutateAsync(task.id);
      toast.success(`Picked up order ${task.orderNumber} from stall!`);
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to confirm pickup. Please try again.');
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="rounded-md border border-border bg-surface p-4 sm:p-5 space-y-4">
      {/* Header: Order Number & Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <span className="font-mono font-bold text-base text-text">{task.orderNumber}</span>
          <p className="text-xs text-muted mt-0.5">Assigned to you</p>
        </div>
        <DeliveryStatusBadge status={task.status} />
      </div>

      {/* Pickup Stall Info */}
      <div className="rounded-md border border-border bg-muted/10 p-3 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-text">
            <Store className="h-4 w-4 text-primary" />
            <span>Pickup: {task.shopName}</span>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-border bg-surface text-[11px] font-semibold text-primary hover:bg-muted/10"
          >
            <Navigation className="h-3 w-3" /> Map
          </a>
        </div>
        <p className="text-xs text-muted pl-5.5">
          {task.pickupAddress.text}, {task.pickupAddress.district} - {task.pickupAddress.pincode}
        </p>
      </div>

      {/* Customer Drop-off Info */}
      <div className="rounded-md border border-border bg-muted/10 p-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-text">
          <MapPin className="h-4 w-4 text-muted" />
          <span>Delivery Drop-off</span>
        </div>
        <p className="text-xs text-muted pl-5.5">
          {task.deliveryAddress.text}, {task.deliveryAddress.district} - {task.deliveryAddress.pincode}
        </p>
      </div>

      {/* COD Collection Notice */}
      {task.codAmountPaise > 0 && (
        <div className="rounded-md border border-warning/30 bg-warning-soft px-3 py-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-warning">
            {task.codCollected ? '✓ COD Collected' : 'Collect Cash on Delivery:'}
          </span>
          <span className="font-mono font-bold text-warning text-sm">
            {formatINR(task.codAmountPaise)}
          </span>
        </div>
      )}

      {errorMsg && <Alert tone="danger">{errorMsg}</Alert>}

      {/* Action Buttons */}
      <div className="pt-1">
        {isAssigned && (
          <Button
            variant="primary"
            className="w-full flex items-center justify-center gap-2"
            loading={pickup.isPending}
            onClick={handlePickup}
          >
            <PackageCheck className="h-4 w-4" /> Confirm Picked Up from Stall
          </Button>
        )}

        {isPickedUp && (
          <Button
            variant="primary"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => onDeliver(task)}
          >
            <CheckCircle2 className="h-4 w-4" /> Verify Customer OTP & Complete Delivery
          </Button>
        )}

        {isDelivered && (
          <div className="text-center py-2 text-xs font-medium text-success flex items-center justify-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> Delivered & Verified
          </div>
        )}
      </div>
    </div>
  );
}
