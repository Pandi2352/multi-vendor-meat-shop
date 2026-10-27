import { ArrowRight, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Panel } from '@/components/ui';
import { buildPath, ROUTES } from '@/config/routes';
import { VendorOrderStatusBadge } from '@/features/orders';
import { formatINR, formatTimeIST, formatWeight } from '@/utils/format';
import type { DashboardOrderPreview } from '../api/dashboard.api';

const viewAll = (
  <Link to={ROUTES.VENDOR_ORDERS} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
    Open queue <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
  </Link>
);

/** Oldest in-progress orders first — the ones most at risk of running late. */
export function OrderQueuePreview({ orders, className }: { orders: DashboardOrderPreview[]; className?: string }) {
  return (
    <Panel title="Up next" description="Oldest orders first" icon={ClipboardList} action={viewAll} flush className={className}>
      {orders.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-muted">No orders in progress. New orders show up here.</p>
      ) : (
        <ul className="divide-y divide-border">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                to={buildPath(ROUTES.VENDOR_ORDER_DETAIL, { orderId: order.id })}
                className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-muted/60"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text">{order.orderNumber}</p>
                  <p className="text-xs text-muted">
                    {formatTimeIST(order.createdAt)} · {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'} ·{' '}
                    {formatWeight(order.totalWeightGrams)}
                  </p>
                </div>
                <span className="hidden text-sm font-medium text-text tabular-nums sm:block">
                  {formatINR(order.totalPaise)}
                </span>
                <VendorOrderStatusBadge status={order.status} size="sm" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
