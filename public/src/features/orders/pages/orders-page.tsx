import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ChevronRight, Store } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatDateIST, formatINR, formatWeight } from '@/utils';
import { useOrdersList } from '../api/use-orders';
import { OrderStatusBadge } from '../components/order-status-badge';

export function OrdersPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('ALL');
  const { data, isLoading } = useOrdersList();

  const orders = data?.items || [];
  const filteredOrders = orders.filter((o) => {
    if (filter === 'ACTIVE') return !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.status);
    if (filter === 'COMPLETED') return o.status === 'DELIVERED';
    if (filter === 'CANCELLED') return ['CANCELLED', 'REJECTED'].includes(o.status);
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Your Meat Orders</h1>
          <p className="text-xs text-muted mt-1">Track fresh meat orders from nearby butchers</p>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1.5 rounded-md border border-border bg-surface p-1 text-xs">
          {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filter === tab
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted hover:text-text'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted text-sm">Loading your orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-md border border-border bg-surface p-12 text-center">
          <Package className="h-10 w-10 text-muted mx-auto mb-3 opacity-40" />
          <h3 className="font-semibold text-text text-base">No orders found</h3>
          <p className="text-xs text-muted mt-1 mb-4">You have no {filter.toLowerCase()} meat orders.</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Explore Fresh Cuts
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="rounded-md border border-border bg-surface p-5 hover:border-primary/40 transition-colors cursor-pointer"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-text font-mono">{order.orderNumber}</span>
                  <span className="text-xs text-muted">• {formatDateIST(order.createdAt)}</span>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <p className="text-xs font-semibold text-text flex items-center gap-1.5 mb-1">
                    <Store className="h-3.5 w-3.5 text-muted" />
                    {order.shopName || 'Local Butcher Shop'}
                  </p>
                  <p className="text-xs text-muted">
                    {order.items.map((i) => `${i.name} (${formatWeight(i.grams)})`).join(', ')}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-border">
                  <div className="text-right">
                    <span className="text-xs text-muted block">Total (COD)</span>
                    <span className="font-bold text-base text-primary">
                      {formatINR(order.totals.totalPaise)}
                    </span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
