import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';
import type {
  VendorProduct,
  CutType,
  PreparationOption,
  CategoryItem,
  CreateProductPayload,
} from '../api';
import { CUT_TYPES } from '../constants';
import { ProductFormPresets } from './product-form-presets';

interface ProductFormModalProps {
  product: VendorProduct | null;
  categories: CategoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateProductPayload) => void;
  isSubmitting: boolean;
}

export function ProductFormModal({
  product,
  categories,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: ProductFormModalProps) {
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [cutType, setCutType] = useState<CutType>('CURRY_CUT');
  const [priceInRupees, setPriceInRupees] = useState<number>(0);
  const [mrpInRupees, setMrpInRupees] = useState<number>(0);
  const [minGrams, setMinGrams] = useState<number>(500);
  const [allowedWeights, setAllowedWeights] = useState<number[]>([250, 500, 1000]);
  const [allowedPreps, setAllowedPreps] = useState<PreparationOption[]>(['CLEANED', 'MEDIUM_PIECES']);
  const [isFreshDaily, setIsFreshDaily] = useState(true);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (product) {
      setCategoryId(product.categoryId);
      setName(product.name);
      setCutType(product.cutType || 'CURRY_CUT');
      setPriceInRupees(Math.round(product.pricePerKgPaise / 100));
      setMrpInRupees(product.mrpPerKgPaise ? Math.round(product.mrpPerKgPaise / 100) : 0);
      setMinGrams(product.minGrams || 500);
      setAllowedWeights(product.allowedWeightsGrams || [500, 1000]);
      setAllowedPreps(product.allowedPreparation || ['CLEANED']);
      setIsFreshDaily(product.isFreshDaily ?? true);
      setIsActive(product.status === 'ACTIVE');
    } else {
      setCategoryId(categories[0]?.id || '');
      setName('');
      setCutType('CURRY_CUT');
      setPriceInRupees(400);
      setMrpInRupees(440);
      setMinGrams(500);
      setAllowedWeights([250, 500, 1000]);
      setAllowedPreps(['CLEANED', 'MEDIUM_PIECES']);
      setIsFreshDaily(true);
      setIsActive(true);
    }
  }, [product, categories, isOpen]);

  if (!isOpen) return null;

  const toggleWeight = (grams: number) => {
    setAllowedWeights((prev) =>
      prev.includes(grams) ? prev.filter((w) => w !== grams) : [...prev, grams].sort((a, b) => a - b)
    );
  };

  const togglePrep = (prep: PreparationOption) => {
    setAllowedPreps((prev) =>
      prev.includes(prep) ? prev.filter((p) => p !== prep) : [...prev, prep]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      categoryId: categoryId || categories[0]?.id || '',
      name: name.trim(),
      cutType,
      pricePerKgPaise: Math.round(priceInRupees * 100),
      mrpPerKgPaise: mrpInRupees > 0 ? Math.round(mrpInRupees * 100) : undefined,
      minGrams,
      allowedWeightsGrams: allowedWeights.length > 0 ? allowedWeights : [minGrams],
      allowedPreparation: allowedPreps,
      isFreshDaily,
      status: isActive ? 'ACTIVE' : 'INACTIVE',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-md w-full max-w-lg p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h3 className="text-base font-semibold text-text">
              {product ? 'Edit Meat Cut' : 'Add New Meat Cut'}
            </h3>
            <p className="text-xs text-muted">Daily fresh butchery catalogue & pricing</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text p-1 rounded-md">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Category & Cut Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-text block mb-1">Meat Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-medium text-text block mb-1">Butchery Cut Type</label>
              <select
                value={cutType}
                onChange={(e) => setCutType(e.target.value as CutType)}
                className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
              >
                {CUT_TYPES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label} ({c.tamilLabel})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cut Name */}
          <div>
            <label className="font-medium text-text block mb-1">Cut Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tender Country Chicken Curry Cut"
              className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
              required
            />
          </div>

          {/* Pricing & Min Order */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-medium text-text block mb-1">Price / kg (₹)</label>
              <input
                type="number"
                min="1"
                step="1"
                value={priceInRupees || ''}
                onChange={(e) => setPriceInRupees(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="font-medium text-text block mb-1">MRP / kg (₹)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={mrpInRupees || ''}
                onChange={(e) => setMrpInRupees(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="font-medium text-text block mb-1">Min Order (g)</label>
              <input
                type="number"
                min="100"
                step="50"
                value={minGrams}
                onChange={(e) => setMinGrams(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Presets Component */}
          <ProductFormPresets
            selectedWeights={allowedWeights}
            onToggleWeight={toggleWeight}
            selectedPreps={allowedPreps}
            onTogglePrep={togglePrep}
          />

          {/* Switches: Daily fresh & In-stock */}
          <div className="p-3 rounded-md bg-surface-muted border border-border space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFreshDaily}
                onChange={(e) => setIsFreshDaily(e.target.checked)}
                className="rounded-md border-border text-primary focus:ring-0"
              />
              <span className="text-text font-medium flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                Farm fresh daily morning butchering
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded-md border-border text-primary focus:ring-0"
              />
              <span className="text-text font-medium">In-Stock & available for ordering today</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={isSubmitting}>
              {product ? 'Update Cut' : 'Save Meat Cut'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
