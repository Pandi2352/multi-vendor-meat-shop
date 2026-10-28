import { PackageCheck } from 'lucide-react';
import { formatINR, formatWeight } from '@/utils';
import type { OrderResponse } from '../api/orders.api';

interface OrderItemsSummaryProps {
  order: OrderResponse;
}

export function OrderItemsSummary({ order }: OrderItemsSummaryProps) {
  return (
    <div className="space-y-4">
      <div className="divide-y divide-border">
        {order.items.map((item) => (
          <div key={item.productId} className="py-3 flex justify-between items-start gap-4">
            <div>
              <p className="text-sm font-semibold text-text">{item.name}</p>
              <p className="text-xs text-muted">
                Ordered: {formatWeight(item.grams)} × {item.quantity}
                {item.cutType ? ` • ${item.cutType}` : ''}
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
          <span>Total Payable on Delivery (COD)</span>
          <span className="text-primary">{formatINR(order.totals.totalPaise)}</span>
        </div>
      </div>
    </div>
  );
}
