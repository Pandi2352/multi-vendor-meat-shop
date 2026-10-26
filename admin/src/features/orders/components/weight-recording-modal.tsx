import { useState } from 'react';
import { Scale, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { calculateWeightVariance, formatWeight } from '@/utils/format';
import type { OrderItem } from '../api/vendor-orders.api';

interface WeightRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  onSubmit: (actualWeights: Record<string, number>) => Promise<void>;
  isSubmitting?: boolean;
}

export function WeightRecordingModal({
  isOpen,
  onClose,
  items,
  onSubmit,
  isSubmitting,
}: WeightRecordingModalProps) {
  const [weights, setWeights] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const item of items) {
      initial[item.productId] = item.actualPackedGrams ?? item.grams;
    }
    return initial;
  });

  if (!isOpen) return null;

  const handleWeightChange = (productId: string, val: string) => {
    const num = parseInt(val, 10);
    setWeights((prev) => ({ ...prev, [productId]: isNaN(num) ? 0 : num }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(weights);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-md border border-border bg-surface p-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-text">Record Actual Packed Weights</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-muted hover:text-text rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-muted mt-3 mb-4">
          Enter the precise scale weight in grams for each cut before packing. Variance must be within ±10%.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {items.map((item) => {
              const currentWeight = weights[item.productId] ?? item.grams;
              const variance = calculateWeightVariance(item.grams, currentWeight);
              const isExceeded = Math.abs(variance) > 10;

              return (
                <div key={item.productId} className="rounded-md border border-border bg-surface-muted p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-medium text-xs text-text">{item.name}</span>
                    <span className="text-xs text-muted">Target: {formatWeight(item.grams)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        required
                        value={currentWeight || ''}
                        onChange={(e) => handleWeightChange(item.productId, e.target.value)}
                        className="w-full px-3 py-1.5 text-sm rounded-md border border-border bg-surface text-text focus:outline-hidden focus:border-primary"
                        placeholder="Weight in grams"
                      />
                      <span className="absolute right-3 top-1.5 text-xs text-muted">grams</span>
                    </div>
                    <div className="w-20 text-right">
                      <span
                        className={`text-xs font-semibold ${
                          isExceeded ? 'text-danger' : variance === 0 ? 'text-muted' : 'text-primary'
                        }`}
                      >
                        {variance > 0 ? `+${variance}%` : `${variance}%`}
                      </span>
                    </div>
                  </div>
                  {isExceeded && (
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-danger">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>Variance exceeds ±10% threshold. Verify cut with customer.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
              Confirm & Mark Ready
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
