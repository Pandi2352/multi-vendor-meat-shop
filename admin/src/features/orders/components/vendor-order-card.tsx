import { useState } from 'react';
import { ChefHat, Check, X, Scale, Eye, MapPin } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatINR, formatWeight, formatTimeIST } from '@/utils/format';
import { VendorOrderStatusBadge } from './vendor-order-status-badge';
import { WeightRecordingModal } from './weight-recording-modal';
import { RejectOrderModal } from './reject-order-modal';
import type { OrderResponse } from '../api/vendor-orders.api';

interface VendorOrderCardProps {
  order: OrderResponse;
  onStatusChange: (status: string, reason?: string, actualWeights?: Record<string, number>) => Promise<void>;
  onViewDetails?: (orderId: string) => void;
  isUpdating?: boolean;
}

export function VendorOrderCard({ order, onStatusChange, onViewDetails, isUpdating }: VendorOrderCardProps) {
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  return (
    <div className="rounded-md border border-border bg-surface p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-text font-mono">{order.orderNumber}</span>
              <VendorOrderStatusBadge status={order.status} size="sm" />
            </div>
            <p className="text-[11px] text-muted mt-0.5">Placed at {formatTimeIST(order.createdAt)}</p>
          </div>
          <span className="font-bold text-sm text-primary">{formatINR(order.totals.totalPaise)}</span>
        </div>

        {/* Customer & Address Snippet */}
        <div className="rounded-md bg-surface-muted p-2.5 mb-3 text-xs space-y-1">
          <p className="text-[11px] text-muted flex items-start gap-1">
            <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
            <span className="truncate">{order.deliveryAddress.text}, {order.deliveryAddress.pincode}</span>
          </p>
          {order.customerNotes && (
            <p className="text-[11px] text-primary italic">Note: {order.customerNotes}</p>
          )}
        </div>

        {/* Cuts list */}
        <div className="space-y-1.5 mb-4">
          {order.items.map((item) => (
            <div key={item.productId} className="flex items-center justify-between text-xs py-1 border-b border-border/50 last:border-0">
              <div>
                <span className="font-medium text-text">{item.name}</span>
                {item.cutType && <span className="text-muted ml-1.5">({item.cutType})</span>}
              </div>
              <div className="text-right">
                <span className="font-medium text-text">{formatWeight(item.actualPackedGrams ?? item.grams)}</span>
                {item.actualPackedGrams && (
                  <span className="block text-[10px] text-success">Weighed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Controls */}
      <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
        {onViewDetails && (
          <Button variant="outline" size="sm" onClick={() => onViewDetails(order.id)} leftIcon={<Eye className="h-3.5 w-3.5" />}>
            View
          </Button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {order.status === 'PLACED' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRejectModalOpen(true)}
                disabled={isUpdating}
                leftIcon={<X className="h-3.5 w-3.5 text-danger" />}
              >
                Decline
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onStatusChange('ACCEPTED')}
                loading={isUpdating}
                leftIcon={<Check className="h-3.5 w-3.5" />}
              >
                Accept
              </Button>
            </>
          )}

          {order.status === 'ACCEPTED' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onStatusChange('PREPARING')}
              loading={isUpdating}
              leftIcon={<ChefHat className="h-3.5 w-3.5" />}
            >
              Start Prep
            </Button>
          )}

          {order.status === 'PREPARING' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsWeightModalOpen(true)}
              loading={isUpdating}
              leftIcon={<Scale className="h-3.5 w-3.5" />}
            >
              Pack & Weigh
            </Button>
          )}

          {order.status === 'READY' && (
            <span className="text-xs text-success font-medium flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> Awaiting Courier
            </span>
          )}
        </div>
      </div>

      <WeightRecordingModal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        items={order.items}
        onSubmit={async (weights) => {
          await onStatusChange('READY', 'Order packed and weighed', weights);
        }}
        isSubmitting={isUpdating}
      />

      <RejectOrderModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        orderNumber={order.orderNumber}
        onConfirm={async (reason) => {
          await onStatusChange('REJECTED', reason);
        }}
        isSubmitting={isUpdating}
      />
    </div>
  );
}
