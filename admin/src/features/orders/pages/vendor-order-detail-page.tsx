import { useState } from 'react';
import { ArrowLeft, ChefHat, Check, X, Scale, MapPin, Clock } from 'lucide-react';
import { Button, Spinner, ErrorState } from '@/components/ui';
import { formatINR, formatWeight, formatDateIST, calculateWeightVariance } from '@/utils/format';
import { useVendorOrderDetail, useUpdateOrderStatus } from '../api/use-vendor-orders';
import { VendorOrderStatusBadge } from '../components/vendor-order-status-badge';
import { WeightRecordingModal } from '../components/weight-recording-modal';
import { RejectOrderModal } from '../components/reject-order-modal';

interface VendorOrderDetailPageProps {
  orderId: string;
  onBack: () => void;
}

export function VendorOrderDetailPage({ orderId, onBack }: VendorOrderDetailPageProps) {
  const { data: order, isLoading, error, refetch } = useVendorOrderDetail(orderId);
  const updateStatus = useUpdateOrderStatus();
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
        <p className="mt-3 text-xs text-muted">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <ErrorState
          title="Order not found"
          description={error?.message ?? 'Could not find order'}
          actionLabel="Retry"
          onAction={() => { void refetch(); }}
        />
        <Button variant="outline" size="sm" onClick={onBack} className="mt-4" leftIcon={<ArrowLeft className="h-4 w-4" />}>
          Back to Queue
        </Button>
      </div>
    );
  }

  const handleStatusChange = async (status: string, reason?: string, weights?: Record<string, number>) => {
    await updateStatus.mutateAsync({
      id: order.id,
      body: { status: status as never, reason, actualPackedWeights: weights },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onBack} leftIcon={<ArrowLeft className="h-4 w-4" />}>
          Back to Queue
        </Button>
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-base text-text">{order.orderNumber}</span>
          <VendorOrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-md border border-border bg-surface p-5">
            <h3 className="text-sm font-semibold text-text mb-4">Meat Cuts & Portions</h3>
            <div className="space-y-3">
              {order.items.map((item) => {
                const variance = item.actualPackedGrams
                  ? calculateWeightVariance(item.grams, item.actualPackedGrams)
                  : null;

                return (
                  <div key={item.productId} className="p-3 rounded-md border border-border bg-surface-muted">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="font-semibold text-xs text-text">{item.name}</span>
                        {item.cutType && <span className="text-xs text-muted ml-2">Cut: {item.cutType}</span>}
                      </div>
                      <span className="font-bold text-xs text-primary">{formatINR(item.lineTotalPaise)}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-border/40">
                      <span className="text-muted">Target: {formatWeight(item.grams)}</span>
                      <div className="flex items-center gap-2">
                        {item.actualPackedGrams ? (
                          <>
                            <span className="font-medium text-text">Packed: {formatWeight(item.actualPackedGrams)}</span>
                            {variance !== null && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${variance > 0 ? 'bg-primary/20 text-primary' : 'bg-surface text-muted'}`}>
                                {variance > 0 ? `+${variance}%` : `${variance}%`}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-muted italic">Scale weight pending</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-border space-y-1.5 text-xs text-muted">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>{formatINR(order.totals.subtotalPaise)}</span>
              </div>
              <div className="flex justify-between">
                <span>Thermal Packaging</span>
                <span>{formatINR(order.totals.packagingFeePaise)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-text pt-2 border-t border-border">
                <span>Total Amount ({order.payment.method})</span>
                <span className="text-primary">{formatINR(order.totals.totalPaise)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-border bg-surface p-5">
            <h3 className="text-sm font-semibold text-text mb-4">Lifecycle Audit Trail</h3>
            <div className="space-y-3">
              {(order.timeline ?? []).map((evt, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <Clock className="h-4 w-4 text-muted shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text">{evt.toStatus}</span>
                      <span className="text-muted">by {evt.actorRole}</span>
                    </div>
                    {evt.reason && <p className="text-muted mt-0.5">{evt.reason}</p>}
                    <span className="text-[10px] text-muted">{formatDateIST(evt.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-md border border-border bg-surface p-5 space-y-4">
            <h3 className="text-sm font-semibold text-text">Customer & Delivery</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted shrink-0 mt-0.5" />
                <div className="text-muted">
                  <p>{order.deliveryAddress.text}</p>
                  <p>{order.deliveryAddress.district}, {order.deliveryAddress.pincode}</p>
                </div>
              </div>
              {order.customerNotes && (
                <p className="text-xs text-primary bg-primary/5 p-2 rounded-md">Note: {order.customerNotes}</p>
              )}
            </div>
          </div>

          <div className="rounded-md border border-border bg-surface p-5 space-y-3">
            <h3 className="text-sm font-semibold text-text mb-2">Fulfilment Actions</h3>
            {order.status === 'PLACED' && (
              <>
                <Button variant="primary" fullWidth size="sm" onClick={() => handleStatusChange('ACCEPTED')} loading={updateStatus.isPending} leftIcon={<Check className="h-4 w-4" />}>
                  Accept Order
                </Button>
                <Button variant="outline" fullWidth size="sm" onClick={() => setIsRejectModalOpen(true)} disabled={updateStatus.isPending} leftIcon={<X className="h-4 w-4 text-danger" />}>
                  Decline Order
                </Button>
              </>
            )}
            {order.status === 'ACCEPTED' && (
              <Button variant="primary" fullWidth size="sm" onClick={() => handleStatusChange('PREPARING')} loading={updateStatus.isPending} leftIcon={<ChefHat className="h-4 w-4" />}>
                Start Cutting & Packing
              </Button>
            )}
            {order.status === 'PREPARING' && (
              <Button variant="primary" fullWidth size="sm" onClick={() => setIsWeightModalOpen(true)} loading={updateStatus.isPending} leftIcon={<Scale className="h-4 w-4" />}>
                Record Scale Weights & Mark Ready
              </Button>
            )}
            {order.status === 'READY' && (
              <div className="p-3 rounded-md bg-success-soft text-success text-xs font-medium text-center">
                Cuts Packed. Awaiting pickup by delivery fleet partner.
              </div>
            )}
          </div>
        </div>
      </div>

      <WeightRecordingModal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        items={order.items}
        onSubmit={async (weights) => {
          await handleStatusChange('READY', 'Packed and weighed on shop scales', weights);
        }}
        isSubmitting={updateStatus.isPending}
      />

      <RejectOrderModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        orderNumber={order.orderNumber}
        onConfirm={async (reason) => {
          await handleStatusChange('REJECTED', reason);
        }}
        isSubmitting={updateStatus.isPending}
      />
    </div>
  );
}
