import { useState } from 'react';
import { Bike, Phone, ShieldCheck, Mail, Check } from 'lucide-react';
import { formatINR } from '@/utils';
import type { OrderResponse, DeliveryTaskResponse } from '../api/orders.api';
import { useResendDeliveryOtp } from '../api/use-orders';

import { toast } from '@/components/ui';

interface LiveOrderTrackerProps {
  order: OrderResponse;
  deliveryTask?: DeliveryTaskResponse;
}

export function LiveOrderTracker({ order, deliveryTask }: LiveOrderTrackerProps) {
  const resendOtp = useResendDeliveryOtp();
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  const isDelivered = order.status === 'DELIVERED';
  const isCancelled = ['CANCELLED', 'REJECTED'].includes(order.status);
  const isPickedUp = deliveryTask?.status === 'PICKED_UP' || order.status === 'OUT_FOR_DELIVERY';
  const hasPartner = Boolean(deliveryTask?.partnerName);

  if (isCancelled) return null;

  const handleResendOtp = async () => {
    if (!order.id) return;
    try {
      const res = await resendOtp.mutateAsync(order.id);
      const msg = `OTP sent to Gmail (${res.maskedEmail})`;
      setEmailStatus(msg);
      toast.success(msg);
      setTimeout(() => setEmailStatus(null), 8000);
    } catch {
      const msg = 'Failed to send OTP to Gmail. Please try again.';
      setEmailStatus(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-4">
      {/* 4-digit Customer Handover OTP Card */}
      {!isDelivered && deliveryTask?.otpPlain && (
        <div className="rounded-md border border-primary/40 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Delivery Handover OTP
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-warning-soft text-warning font-semibold">
                Cash On Delivery
              </span>
            </div>
            <p className="text-xs text-muted">
              Pay <strong className="text-text">{formatINR(order.totals.totalPaise)}</strong> cash to rider. Share this 4-digit OTP only upon receiving package.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendOtp.isPending}
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Mail className="h-3.5 w-3.5" />
                {resendOtp.isPending ? 'Sending to Gmail...' : 'Email OTP to my Gmail'}
              </button>
              {emailStatus && (
                <span className="text-[11px] text-success font-medium flex items-center gap-1">
                  <Check className="h-3 w-3" /> {emailStatus}
                </span>
              )}
            </div>
          </div>

          <div className="px-4 py-2 font-mono font-black text-2xl tracking-widest rounded-md border border-primary bg-surface text-primary self-start sm:self-auto">
            {deliveryTask.otpPlain}
          </div>
        </div>
      )}

      {/* Live Courier Partner Card */}
      {hasPartner && (
        <div className="rounded-md border border-border bg-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Bike className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-text">{deliveryTask?.partnerName}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-medium">
                  {isDelivered ? 'Delivered' : isPickedUp ? 'On the way to you' : 'Heading to stall'}
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                {isPickedUp ? 'Picked up fresh cuts from stall counter' : 'Assigned delivery partner'}
              </p>
            </div>
          </div>

          {deliveryTask?.partnerPhone && !isDelivered && (
            <a
              href={`tel:${deliveryTask.partnerPhone}`}
              className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-md border border-border bg-surface hover:bg-muted/10 text-xs font-semibold text-text transition-colors self-start sm:self-auto"
            >
              <Phone className="h-3.5 w-3.5 text-primary" />
              Call Courier ({deliveryTask.partnerPhone})
            </a>
          )}
        </div>
      )}
    </div>
  );
}
