import { Pencil, Power, Trash2, Sparkles, Scale, Scissors } from 'lucide-react';
import { formatINR, formatWeight } from '@/utils/format';
import type { VendorProduct } from '../api';
import { ProductStatusBadge } from './product-status-badge';
import { CUT_TYPES, PREPARATION_OPTIONS } from '../constants';

interface ProductCardProps {
  product: VendorProduct;
  categoryName?: string;
  onEdit: (product: VendorProduct) => void;
  onToggleStatus: (product: VendorProduct) => void;
  onArchive: (product: VendorProduct) => void;
  /** Hides edit, pause and archive (for staff without product.manage). */
  readOnly?: boolean;
}

export function ProductCard({
  product,
  categoryName,
  onEdit,
  onToggleStatus,
  onArchive,
  readOnly = false,
}: ProductCardProps) {
  const cutMeta = CUT_TYPES.find((c) => c.value === product.cutType);
  const isActive = product.status === 'ACTIVE';

  return (
    <div className="p-4 rounded-md border border-border bg-surface hover:border-primary/40 transition-colors flex flex-col justify-between space-y-3 text-xs">
      <div className="space-y-2">
        {/* Title and Status */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              {categoryName || 'Meat Cut'}
            </span>
            <h3 className="font-semibold text-text text-sm leading-tight mt-0.5">{product.name}</h3>
            {cutMeta && (
              <p className="text-muted text-[11px] mt-0.5">
                {cutMeta.label} ({cutMeta.tamilLabel})
              </p>
            )}
          </div>
          <ProductStatusBadge status={product.status} />
        </div>

        {/* Pricing & Weights */}
        <div className="p-2.5 rounded-md bg-surface-muted border border-border space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-muted text-[11px]">Price per kg:</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-text">
                {formatINR(product.pricePerKgPaise)}
              </span>
              {product.mrpPerKgPaise && product.mrpPerKgPaise > product.pricePerKgPaise && (
                <span className="text-xs line-through text-muted">
                  {formatINR(product.mrpPerKgPaise)}
                </span>
              )}
              <span className="text-[11px] text-muted">/ kg</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-muted text-[11px]">
            <span className="flex items-center gap-1">
              <Scale className="h-3 w-3" /> Min order:
            </span>
            <span className="font-medium text-text">{formatWeight(product.minGrams)}</span>
          </div>

          {/* Package sizes */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted">Available sizes:</span>
            <div className="flex flex-wrap gap-1 justify-end">
              {product.allowedWeightsGrams.slice(0, 3).map((w) => (
                <span
                  key={w}
                  className="px-1.5 py-0.2 rounded-md bg-surface border border-border text-[10px] font-medium text-text"
                >
                  {formatWeight(w)}
                </span>
              ))}
              {product.allowedWeightsGrams.length > 3 && (
                <span className="text-[10px] text-muted">
                  +{product.allowedWeightsGrams.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Butchery preparation options */}
        {product.allowedPreparation.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[11px] text-muted">
              <Scissors className="h-3 w-3" />
              <span>Cutting & cleaning options:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {product.allowedPreparation.map((prep) => {
                const opt = PREPARATION_OPTIONS.find((p) => p.value === prep);
                return (
                  <span
                    key={prep}
                    className="px-1.5 py-0.5 rounded-md bg-primary/5 text-primary border border-primary/20 text-[10px] font-medium"
                  >
                    {opt?.label || prep}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {product.isFreshDaily && (
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <Sparkles className="h-3 w-3" />
            <span>Farm fresh butchered daily morning</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!readOnly && (
        <div className="pt-2 border-t border-border flex items-center justify-between gap-1.5">
          {/* Edit Button - Sky Blue */}
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 hover:border-sky-300 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800"
          >
            <Pencil className="h-3 w-3 text-sky-600 dark:text-sky-400" />
            <span>Edit Cut</span>
          </button>

          <div className="flex items-center gap-1.5">
            {/* Toggle In-Stock / Out-of-Stock */}
            <button
              type="button"
              onClick={() => onToggleStatus(product)}
              title={isActive ? 'Mark as Out of Stock' : 'Mark as In Stock'}
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              }`}
            >
              <Power className="h-3 w-3" />
              <span>{isActive ? 'Pause Stock' : 'Activate'}</span>
            </button>

            {/* Archive / Delete */}
            <button
              type="button"
              onClick={() => onArchive(product)}
              title="Archive this meat cut"
              className="inline-flex items-center gap-1 p-1 text-xs font-medium rounded-md transition-colors text-muted hover:text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
