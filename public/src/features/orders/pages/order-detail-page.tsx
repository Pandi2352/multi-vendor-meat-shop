import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Store, PackageCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatDateIST, formatINR, formatWeight } from '@/utils';
import { useOrderDetail, useCancelOrder } from '../api/use-orders';
import { OrderStatusBadge } from '../components/order-status-badge';
import { OrderTimeline } from '../components/order-timeline';

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useOrderDetail(orderId || '', { refetchInterval: 10000 });
  const cancelOrder = useCancelOrder();
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  if (isLoading) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-sm text-muted">Loading order details...</div>;
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-danger mb-4">Could not load order details.</p>
        <Button variant="outline" onClick={() => navigate('/orders')}>Back to Orders</Button>
      </div>
    );
  }

  const isCancellable = ['PLACED', 'PENDING_PAYMENT'].includes(order.status);

  const handleCancel = async () => {
    if (!orderId) return;
    await cancelOrder.mutateAsync({ id: orderId, body: { reason: cancelReason || 'Cancelled by customer' } });
    setShowCancelPrompt(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 w-full space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/orders')}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-text font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> All Orders
        </button>
        <OrderStatusBadge status={order.status} size="lg" />
      </div>

      <div className="rounded-md border border-border bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4 mb-6">
          <div>
            <h1 className="text-xl font-bold font-mono text-text">{order.orderNumber}</h1>
            <p className="text-xs text-muted mt-0.5">Placed on {formatDateIST(order.createdAt)}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted block">Payment</span>
            <span className="font-semibold text-xs text-text">{order.payment.method} ({order.payment.status})</span>
          </div>
        </div>

        <OrderTimeline
          status={order.status}
          timeline={order.timeline}
          cancelReason={order.cancelReason}
          rejectReason={order.rejectReason}
        />
      </div>

      <div className="rounded-md border border-border bg-surface p-6 space-y-4">
        <div className="flex items-center gap-2 text-xs text-muted border-b border-border pb-3">
          <Store className="h-4 w-4 text-primary" />
          <span className="font-semibold text-text">{order.shopName || 'Butcher Shop'}</span>
          <span>•</span>
          <MapPin className="h-4 w-4 text-muted" />
          <span>{order.deliveryAddress.text}, {order.deliveryAddress.district}</span>
        </div>

        <div className="divide-y divide-border">
          {order.items.map((item) => (
            <div key={item.productId} className="py-3 flex justify-between items-start gap-4">
              <div>
                <p className="text-sm font-semibold text-text">{item.name}</p>
                <p className="text-xs text-muted">
                  Ordered: {formatWeight(item.grams)} × {item.quantity}
                  {item.cutType ? ` • ${item.cutType}` : ''}
                  {item.preparation ? ` • ${item.preparation}` : ''}
                </p>
                {item.actualPackedGrams && (
                  <p className="text-xs font-medium text-success flex items-center gap-1 mt-1">
                    <PackageCheck className="h-3.5 w-3.5" />
                    Actual Packed: {formatWeight(item.actualPackedGrams)}
                  </p>
                )}
              </div>
              <span className="font-bold text-sm text-text">{formatINR(item.lineTotalPaise)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-4 space-y-1.5 text-xs">
          <div className="flex justify-between text-muted">
            <span>Meat Subtotal ({formatWeight(order.totals.totalWeightGrams)})</span>
            <span>{formatINR(order.totals.subtotalPaise)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Chilled Thermal Pouch</span>
            <span>{formatINR(order.totals.packagingFeePaise)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Delivery Fee</span>
            <span>{order.totals.deliveryFeePaise === 0 ? 'FREE' : formatINR(order.totals.deliveryFeePaise)}</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between font-bold text-base text-text">
            <span>Total Payable on Delivery</span>
            <span className="text-primary">{formatINR(order.totals.totalPaise)}</span>
          </div>
        </div>

        {isCancellable && (
          <div className="border-t border-border pt-4">
            {!showCancelPrompt ? (
              <Button variant="danger" size="sm" onClick={() => setShowCancelPrompt(true)}>
                Cancel Order
              </Button>
            ) : (
              <div className="p-3 rounded-md border border-danger/30 bg-danger-soft space-y-2">
                <p className="text-xs font-semibold text-danger flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> Confirm cancellation?
                </p>
                <input
                  type="text"
                  placeholder="Reason for cancellation (optional)"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full text-xs rounded-md border border-border bg-surface px-2.5 py-1.5 text-text"
                />
                <div className="flex gap-2 pt-1">
                  <Button variant="danger" size="sm" loading={cancelOrder.isPending} onClick={handleCancel}>
                    Yes, Cancel Order
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowCancelPrompt(false)}>
                    Keep Order
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
