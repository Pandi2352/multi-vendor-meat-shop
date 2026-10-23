import { Check, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatDateIST } from '@/utils';
import type { OrderEvent } from '../api/orders.api';

interface OrderTimelineProps {
  status: string;
  timeline?: OrderEvent[];
  cancelReason?: string;
  rejectReason?: string;
}

const STEPS = [
  { key: 'PLACED', title: 'Order Placed', desc: 'Sent to butcher' },
  { key: 'ACCEPTED', title: 'Accepted', desc: 'Shop confirmed fresh batch' },
  { key: 'PREPARING', title: 'Preparing', desc: 'Clean cut & packed' },
  { key: 'OUT_FOR_DELIVERY', title: 'Out for Delivery', desc: 'Chilled transit' },
  { key: 'DELIVERED', title: 'Delivered', desc: 'Delivered to your door' },
];

const STEP_ORDER = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export function OrderTimeline({ status, timeline, cancelReason, rejectReason }: OrderTimelineProps) {
  const isCancelled = status === 'CANCELLED';
  const isRejected = status === 'REJECTED';
  const currentIndex = STEP_ORDER.indexOf(status);

  if (isCancelled || isRejected) {
    const reason = isCancelled ? cancelReason || 'Cancelled by customer' : rejectReason || 'Declined by shop';
    return (
      <div className="rounded-md border border-danger/30 bg-danger-soft p-4 text-sm text-danger flex items-start gap-3">
        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">{isCancelled ? 'Order Cancelled' : 'Order Declined'}</p>
          <p className="text-xs mt-0.5 opacity-90">{reason}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="relative flex items-center justify-between">
        {/* Progress connecting line */}
        <div className="absolute left-4 right-4 top-4 h-0.5 bg-border -z-0" />
        <div
          className="absolute left-4 top-4 h-0.5 bg-primary transition-all duration-500 -z-0"
          style={{
            width: `${Math.min(100, Math.max(0, (currentIndex / (STEPS.length - 1)) * 100))}%`,
          }}
        />

        {STEPS.map((step) => {
          const stepIndex = STEP_ORDER.indexOf(step.key);
          const isDone = currentIndex >= stepIndex && currentIndex >= 0;
          const isCurrent = status === step.key || (step.key === 'PREPARING' && status === 'READY');
          const matchingEvent = timeline?.find((e) => e.toStatus === step.key);

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center text-center">
              <div
                className={cn(
                  'h-8 w-8 rounded-full border-2 flex items-center justify-center transition-colors',
                  isDone
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-surface text-muted',
                  isCurrent && 'ring-2 ring-primary/30',
                )}
              >
                {isDone ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Clock className="h-3.5 w-3.5" />
                )}
              </div>
              <p
                className={cn(
                  'text-xs font-semibold mt-2 hidden sm:block',
                  isCurrent ? 'text-primary' : isDone ? 'text-text' : 'text-muted',
                )}
              >
                {step.title}
              </p>
              {matchingEvent && (
                <span className="text-[10px] text-muted hidden md:block">
                  {formatDateIST(matchingEvent.createdAt)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
