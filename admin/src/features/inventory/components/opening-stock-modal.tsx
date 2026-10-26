import { useState } from 'react';
import { PackagePlus, X } from 'lucide-react';
import { Button, CustomSelect } from '@/components/ui';
import type { Product } from '../api/inventory.api';

interface OpeningStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  selectedProductId?: string;
  onSetStock: (data: { productId: string; openingGrams: number; notes?: string }) => Promise<void>;
  isSubmitting?: boolean;
}

export function OpeningStockModal({
  isOpen,
  onClose,
  products,
  selectedProductId,
  onSetStock,
  isSubmitting,
}: OpeningStockModalProps) {
  const [productId, setProductId] = useState(selectedProductId || products[0]?.id || '');
  const [kgValue, setKgValue] = useState('20');
  const [notes, setNotes] = useState('Morning fresh delivery');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const kg = parseFloat(kgValue);
    if (isNaN(kg) || kg < 0 || !productId) return;
    const openingGrams = Math.round(kg * 1000);
    await onSetStock({ productId, openingGrams, notes: notes.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-md border border-border bg-surface p-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-text">Morning Opening Stock</h3>
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
          Set the available freshly prepared cut stock for today in kilograms (converted to integer grams).
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-text block mb-1">Meat Cut / Product</label>
            <CustomSelect
              value={productId}
              onChange={(val) => setProductId(val as string)}
              options={products.map((p) => ({
                label: p.name,
                value: p.id,
              }))}
              searchable
              clearable={false}
              placeholder="Select meat cut..."
              size="sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text block mb-1">Weight in Kilograms (kg)</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={kgValue}
                onChange={(e) => setKgValue(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-md border border-border bg-surface text-text focus:outline-hidden focus:ring-1 focus:ring-primary"
                placeholder="e.g. 25"
              />
              <span className="absolute right-3 top-2 text-xs text-muted">kg</span>
            </div>
            <p className="text-[11px] text-muted mt-1">
              Precision: {Math.round((parseFloat(kgValue) || 0) * 1000)} grams
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-text block mb-1">Batch / Source Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Namakkal broiler batch #4"
              className="w-full px-3 py-2 text-xs rounded-md border border-border bg-surface text-text focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
              Save Opening Stock
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
