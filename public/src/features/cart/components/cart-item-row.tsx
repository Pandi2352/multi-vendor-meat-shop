import { Trash2, AlertTriangle } from 'lucide-react';
import { formatINR, formatWeight } from '@/utils';
import type { CartItem } from '../api/cart.api';

interface CartItemRowProps {
  item: CartItem;
  onRemove: (productId: string) => void;
}

export function CartItemRow({ item, onRemove }: CartItemRowProps) {
  const cutDisplay = item.cutType ? item.cutType.replace(/_/g, ' ') : '';
  const prepDisplay = item.preparation ? item.preparation.replace(/_/g, ' ') : '';

  return (
    <div className="rounded-md border border-border bg-surface p-3 flex justify-between items-start gap-2">
      <div className="flex-1">
        <p className="font-semibold text-sm text-text">{item.name}</p>
        <p className="text-xs text-muted">
          {formatWeight(item.grams)} × {item.quantity} portion
          {cutDisplay && ` • ${cutDisplay}`}
          {prepDisplay && ` • ${prepDisplay}`}
        </p>
        <p className="text-xs font-bold text-primary mt-1">{formatINR(item.lineTotalPaise)}</p>
        {!item.isAvailable && (
          <p className="text-[11px] text-danger flex items-center gap-1 mt-0.5">
            <AlertTriangle className="h-3 w-3" /> Insufficient fresh daily stock
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onRemove(item.productId)}
        className="p-1 rounded-md text-muted hover:text-danger hover:bg-surface-muted transition-colors"
        aria-label={`Remove ${item.name}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
