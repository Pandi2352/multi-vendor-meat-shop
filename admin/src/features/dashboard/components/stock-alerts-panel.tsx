import { ArrowRight, CircleCheck, Warehouse } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Panel, type BadgeProps } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { formatNumber, formatWeight } from '@/utils/format';
import type { StockAlert, VendorDashboard } from '../api/dashboard.api';

const LEVEL: Record<StockAlert['level'], { label: string; tone: BadgeProps['tone'] }> = {
  OUT_OF_STOCK: { label: 'Sold out', tone: 'danger' },
  NOT_STOCKED: { label: 'No stock today', tone: 'warning' },
  LOW_STOCK: { label: 'Running low', tone: 'warning' },
};

/** Which products need opening stock or a top-up today. */
export function StockAlertsPanel({ stock, className }: { stock: VendorDashboard['stock']; className?: string }) {
  const description =
    stock.activeProducts === 0
      ? 'No active products yet'
      : `${formatNumber(stock.stockedToday)} of ${formatNumber(stock.activeProducts)} products stocked today`;

  return (
    <Panel
      title="Stock"
      description={description}
      icon={Warehouse}
      flush
      className={className}
      action={
        <Link to={ROUTES.VENDOR_INVENTORY} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          Inventory <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
        </Link>
      }
    >
      {stock.alerts.length === 0 ? (
        <p className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted">
          <CircleCheck aria-hidden="true" className="h-4 w-4 text-success" />
          {stock.activeProducts === 0 ? 'Add products to start selling.' : 'Everything is stocked.'}
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {stock.alerts.map((alert) => (
            <li key={alert.productId} className="flex items-center gap-3 px-4 py-3">
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-text">{alert.productName}</span>
              {alert.level === 'LOW_STOCK' && (
                <span className="text-xs text-muted tabular-nums">{formatWeight(alert.availableGrams)} left</span>
              )}
              <Badge tone={LEVEL[alert.level].tone} size="sm">
                {LEVEL[alert.level].label}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
