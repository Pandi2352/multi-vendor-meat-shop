import { AlertTriangle, History, PenTool, Scale } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatWeight } from '@/utils/format';
import type { InventoryBatch, Product } from '../api/inventory.api';

interface InventoryProductCardProps {
  product: Product;
  batch?: InventoryBatch;
  onAdjust: (productId: string) => void;
  onViewMovements: (productId: string) => void;
  onSetOpening: (productId: string) => void;
}

export function InventoryProductCard({
  product,
  batch,
  onAdjust,
  onViewMovements,
  onSetOpening,
}: InventoryProductCardProps) {
  const availableGrams = batch ? batch.availableGrams : 0;
  const openingGrams = batch ? batch.totalOpeningGrams : 0;
  const reservedGrams = batch ? batch.reservedGrams : 0;
  const dispatchedGrams = batch ? Math.max(0, batch.totalOpeningGrams - batch.availableGrams) : 0;
  const isLowStock = batch ? batch.availableGrams < 3000 : true; // low stock if < 3kg

  return (
    <div className="rounded-md border border-border bg-surface p-4 flex flex-col justify-between gap-4">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold text-text">{product.name}</h4>
            <span className="text-xs text-muted uppercase tracking-wider">{product.sellMode}</span>
          </div>
          {batch ? (
            <span
              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                isLowStock
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
              }`}
            >
              {isLowStock ? <AlertTriangle className="h-3 w-3" /> : null}
              {isLowStock ? 'Low Stock' : 'In Stock'}
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-500/10 text-red-500 border border-red-500/20">
              No Opening Stock
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-md border border-border bg-surface-raised p-2">
            <span className="text-muted block mb-0.5">Available Fresh</span>
            <span className="text-base font-bold text-text">{formatWeight(availableGrams)}</span>
          </div>
          <div className="rounded-md border border-border bg-surface-raised p-2">
            <span className="text-muted block mb-0.5">Opening Stock</span>
            <span className="text-sm font-semibold text-text">{formatWeight(openingGrams)}</span>
          </div>
          <div className="rounded-md border border-border bg-surface-raised p-2">
            <span className="text-muted block mb-0.5">Reserved / Packing</span>
            <span className="text-sm font-semibold text-text">{formatWeight(reservedGrams)}</span>
          </div>
          <div className="rounded-md border border-border bg-surface-raised p-2">
            <span className="text-muted block mb-0.5">Fulfilled / Out</span>
            <span className="text-sm font-semibold text-text">{formatWeight(dispatchedGrams)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-border">
        {!batch ? (
          <Button
            size="sm"
            variant="primary"
            className="w-full"
            onClick={() => onSetOpening(product.id)}
          >
            <Scale className="h-3.5 w-3.5 mr-1.5" />
            Set Opening Stock
          </Button>
        ) : (
          <>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onAdjust(product.id)}
            >
              <PenTool className="h-3.5 w-3.5 mr-1.5" />
              Adjust
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="flex-1"
              onClick={() => onViewMovements(product.id)}
            >
              <History className="h-3.5 w-3.5 mr-1.5" />
              History
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
