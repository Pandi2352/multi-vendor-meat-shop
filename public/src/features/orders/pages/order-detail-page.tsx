import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Store, HelpCircle, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatDateIST } from '@/utils';
import { useOrderDetail, useCancelOrder, useOrderDeliveryTask } from '../api/use-orders';
import { OrderStatusBadge } from '../components/order-status-badge';
import { OrderTimeline } from '../components/order-timeline';
import { LiveOrderTracker } from '../components/live-order-tracker';
import { OrderItemsSummary } from '../components/order-items-summary';
import { OrderCancellationPrompt } from '../components/order-cancellation-prompt';
import { ReorderButton } from '../components/reorder-button';
import { OrderReviewForm } from '@/features/reviews';
import { useOrderTicket, CreateTicketModal, TicketStatusBadge } from '@/features/tickets';

export function OrderDetailPage() {
  const { orderId = '' } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  const { data: order, isLoading, error } = useOrderDetail(orderId, { refetchInterval: 4000 });
  const isActive = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(order?.status ?? '');
  const { data: deliveryTask } = useOrderDeliveryTask(orderId, {
    enabled: Boolean(orderId),
    refetchInterval: isActive ? 4000 : undefined,
  });
  const { data: existingTicket } = useOrderTicket(orderId, Boolean(orderId));
  const cancelOrder = useCancelOrder();

  if (isLoading) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-sm text-muted">Loading live tracking details...</div>;
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
  const isDelivered = order.status === 'DELIVERED';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 w-full space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/orders')}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-text font-medium cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> All Orders
        </button>
        <OrderStatusBadge status={order.status} size="lg" />
      </div>

      {/* Support Ticket Banner if active or filed */}
      {existingTicket && (
        <div className="rounded-md border border-border bg-surface p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="h-5 w-5 text-warning" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-text">{existingTicket.ticketNumber}</span>
                <TicketStatusBadge status={existingTicket.status} />
              </div>
              <p className="text-xs text-muted mt-0.5">Dispute filed for this order ({existingTicket.reason})</p>
            </div>
          </div>
          <Link to="/tickets"><Button variant="outline" size="sm">View Support Ticket</Button></Link>
        </div>
      )}

      {/* Live Order Tracker */}
      <LiveOrderTracker order={order} deliveryTask={deliveryTask} />

      {/* Customer Review (Delivered Orders) */}
      {isDelivered && (
        <OrderReviewForm orderId={order.id} shopName={order.shopName || 'Butcher Stall'} />
      )}

      {/* Order Info & Live Stepper */}
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

      {/* Items & Delivery Address */}
      <div className="rounded-md border border-border bg-surface p-6 space-y-4">
        <div className="flex items-center gap-2 text-xs text-muted border-b border-border pb-3">
          <Store className="h-4 w-4 text-primary" />
          <span className="font-semibold text-text">{order.shopName || 'Butcher Shop'}</span>
          <span>•</span>
          <MapPin className="h-4 w-4 text-muted" />
          <span>{order.deliveryAddress.text}, {order.deliveryAddress.district}</span>
        </div>

        <OrderItemsSummary order={order} />

        <div className="border-t border-border pt-4 flex flex-wrap items-center justify-between gap-3">
          {isCancellable && (
            <OrderCancellationPrompt
              isLoading={cancelOrder.isPending}
              onConfirm={(reason) => cancelOrder.mutate({ id: order.id, body: { reason } })}
            />
          )}

          {isDelivered && (
            <div className="flex items-center gap-2">
              <ReorderButton orderId={order.id} size="sm" variant="primary" />
              {!existingTicket && (
                <Button variant="outline" size="sm" onClick={() => setIsIssueModalOpen(true)} leftIcon={<HelpCircle className="h-4 w-4 text-danger" />}>
                  Report Issue
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <CreateTicketModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        orderId={order.id}
        orderNumber={order.orderNumber}
        orderTotalPaise={order.totals.totalPaise}
      />
    </div>
  );
}
