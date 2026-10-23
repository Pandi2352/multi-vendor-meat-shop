import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productId: string;
  onAdjust: (data: { productId: string; type: 'RECEIVED' | 'WASTAGE' | 'ADJUSTMENT'; grams: number; notes?: string }) => Promise<void>;
  isSubmitting?: boolean;
}

export function StockAdjustmentModal({
  isOpen,
  onClose,
  productName,
  productId,
  onAdjust,
  isSubmitting,
}: StockAdjustmentModalProps) {
  const [type, setType] = useState<'RECEIVED' | 'WASTAGE' | 'ADJUSTMENT'>('WASTAGE');
  const [kgValue, setKgValue] = useState('2.5');
  const [notes, setNotes] = useState('Bones and trimming loss');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const kg = parseFloat(kgValue);
    if (isNaN(kg) || kg <= 0) return;
    const grams = Math.round(kg * 1000);
    await onAdjust({ productId, type, grams, notes: notes.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-md border border-border bg-surface p-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-text">Stock Adjustment</h3>
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
          Adjust stock level for <span className="font-semibold text-text">{productName}</span> with an immutable ledger movement record.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text block mb-1">Adjustment Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'WASTAGE' as const, label: 'Trimming Loss (-)', sub: 'Bones / Fat' },
                { key: 'RECEIVED' as const, label: 'Fresh Lot (+)', sub: 'Midday Delivery' },
                { key: 'ADJUSTMENT' as const, label: 'Audit Count', sub: 'Scale Sync' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setType(item.key)}
                  className={`p-2 rounded-md border text-left transition-colors ${
                    type === item.key
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-surface hover:bg-surface-muted text-muted'
                  }`}
                >
                  <p className="text-xs font-bold">{item.label}</p>
                  <p className="text-[10px] text-muted">{item.sub}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-text block mb-1">Weight in Kilograms (kg)</label>
            <div className="relative">
              <input
                type="number"
                step="0.05"
                min="0.05"
                required
                value={kgValue}
                onChange={(e) => setKgValue(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-text focus:outline-hidden focus:ring-1 focus:ring-primary"
                placeholder="e.g. 2.5"
              />
              <span className="absolute right-3 top-2 text-xs text-muted">kg</span>
            </div>
            <p className="text-[11px] text-muted mt-1">
              Quantity: {Math.round((parseFloat(kgValue) || 0) * 1000)} grams
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-text block mb-1">Audit Reason</label>
            <input
              type="text"
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Extra skin and bone removed for boneless cut"
              className="w-full px-3 py-2 text-xs rounded-md border border-border bg-surface text-text focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
              Record Adjustment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
