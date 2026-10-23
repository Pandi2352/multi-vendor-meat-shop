import { useState } from 'react';
import { Store, MapPin, Truck, CheckCircle2, UserCheck, Banknote } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatINR } from '@/utils/format';
import { DeliveryStatusBadge } from './delivery-status-badge';
import { AssignPartnerModal } from './assign-partner-modal';
import { VerifyDeliveryOtpModal } from './verify-delivery-otp-modal';
import type { DeliveryTaskResponse } from '../api/delivery.api';

interface DeliveryTaskCardProps {
  task: DeliveryTaskResponse;
  onAssign: (partner: { partnerId: string; partnerName: string; partnerPhone: string }) => Promise<void>;
  onPickup: () => Promise<void>;
  onDeliver: (data: { otp: string; collectedCod: boolean }) => Promise<void>;
  isUpdating?: boolean;
}

export function DeliveryTaskCard({
  task,
  onAssign,
  onPickup,
  onDeliver,
  isUpdating,
}: DeliveryTaskCardProps) {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDeliverModalOpen, setIsDeliverModalOpen] = useState(false);

  return (
    <div className="rounded-md border border-border bg-surface p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-text font-mono">{task.orderNumber}</span>
              <DeliveryStatusBadge status={task.status} size="sm" />
            </div>
            <p className="text-[11px] text-muted mt-0.5">{task.shopName}</p>
          </div>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-warning/30 bg-warning-soft text-text text-xs font-bold font-mono">
            <Banknote className="h-3.5 w-3.5 text-warning" />
            {formatINR(task.codAmountPaise)} COD
          </span>
        </div>

        {/* Addresses */}
        <div className="space-y-2 mb-4 text-xs">
          <div className="rounded-md bg-surface-muted p-2 flex items-start gap-2">
            <Store className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[11px] text-text">Pickup: {task.shopName}</p>
              <p className="text-[11px] text-muted truncate">{task.pickupAddress.text}</p>
            </div>
          </div>
          <div className="rounded-md bg-surface-muted p-2 flex items-start gap-2">
            <MapPin className="h-3.5 w-3.5 text-info shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[11px] text-text">Drop: {task.deliveryAddress.district} ({task.deliveryAddress.pincode})</p>
              <p className="text-[11px] text-muted truncate">{task.deliveryAddress.text}</p>
            </div>
          </div>
        </div>

        {/* Rider Info */}
        <div className="text-xs text-muted mb-4 pb-2 border-b border-border/50 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5" />
            {task.partnerName ? `${task.partnerName} (${task.partnerPhone})` : 'No Courier Assigned'}
          </span>
          {task.otpPlain && (
            <span className="text-[10px] text-muted font-mono">OTP: {task.otpPlain}</span>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="pt-2 flex items-center justify-end gap-2">
        {task.status === 'UNASSIGNED' && (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => setIsAssignModalOpen(true)}
            loading={isUpdating}
            leftIcon={<UserCheck className="h-3.5 w-3.5" />}
          >
            Assign Courier
          </Button>
        )}

        {task.status === 'ASSIGNED' && (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={onPickup}
            loading={isUpdating}
            leftIcon={<Truck className="h-3.5 w-3.5" />}
          >
            Confirm Shop Pickup
          </Button>
        )}

        {task.status === 'PICKED_UP' && (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => setIsDeliverModalOpen(true)}
            loading={isUpdating}
            leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
          >
            Deliver & Collect COD
          </Button>
        )}

        {task.status === 'DELIVERED' && (
          <span className="text-xs text-success font-medium flex items-center gap-1 w-full justify-center py-1">
            <CheckCircle2 className="h-4 w-4" /> Delivered • COD Reconciled
          </span>
        )}
      </div>

      <AssignPartnerModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        orderNumber={task.orderNumber}
        onAssign={onAssign}
        isSubmitting={isUpdating}
      />

      <VerifyDeliveryOtpModal
        isOpen={isDeliverModalOpen}
        onClose={() => setIsDeliverModalOpen(false)}
        orderNumber={task.orderNumber}
        codAmountPaise={task.codAmountPaise}
        onVerify={onDeliver}
        isSubmitting={isUpdating}
      />
    </div>
  );
}
