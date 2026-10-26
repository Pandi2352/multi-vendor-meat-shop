import { useState, useEffect } from 'react';
import { X, ShieldCheck, Check } from 'lucide-react';
import { Button } from '@/components/ui';
import { useUpdateVendorPermissions, type VendorProfile } from '../api';
import { VIRUDHUNAGAR_MEAT_CATEGORIES } from '../constants';

interface StallPermissionsModalProps {
  vendor: VendorProfile | null;
  onClose: () => void;
}

export function StallPermissionsModal({ vendor, onClose }: StallPermissionsModalProps) {
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const permissionsMutation = useUpdateVendorPermissions();

  useEffect(() => {
    if (vendor) {
      setSelectedSlugs(vendor.allowedCategories || []);
    }
  }, [vendor]);

  if (!vendor) return null;

  const toggleCategory = (slug: string) => {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const selectAll = () => setSelectedSlugs(VIRUDHUNAGAR_MEAT_CATEGORIES.map((c) => c.slug));
  const clearAll = () => setSelectedSlugs([]);

  const handleSave = () => {
    permissionsMutation.mutate(
      {
        id: vendor.id,
        data: { allowedCategories: selectedSlugs },
      },
      {
        onSuccess: () => onClose(),
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-[1px] animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-md w-full max-w-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <div>
              <h3 className="text-base font-semibold text-text">Meat Category & Cut Permissions</h3>
              <p className="text-xs text-muted">{vendor.businessName} ({vendor.ownerName})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text p-1 rounded-md">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-muted">
          <span>Authorize meat types this butcher stall is legally permitted to sell:</span>
          <div className="flex gap-2">
            <button type="button" onClick={selectAll} className="text-primary hover:underline font-medium">Select All</button>
            <span>•</span>
            <button type="button" onClick={clearAll} className="text-muted hover:text-text">Clear</button>
          </div>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {VIRUDHUNAGAR_MEAT_CATEGORIES.map((cat) => {
            const isChecked = selectedSlugs.includes(cat.slug);
            return (
              <div
                key={cat.slug}
                onClick={() => toggleCategory(cat.slug)}
                className={`p-3 rounded-md border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                  isChecked
                    ? 'border-purple-300 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-950/30'
                    : 'border-border bg-surface hover:bg-surface-muted/60'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-text">{cat.name}</p>
                    <span className="text-[11px] text-muted font-medium">({cat.tamilName})</span>
                  </div>
                  <p className="text-[11px] text-muted leading-tight">{cat.description}</p>
                </div>
                <div
                  className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                    isChecked
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'border-border bg-surface'
                  }`}
                >
                  {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={permissionsMutation.isPending}
            onClick={handleSave}
          >
            Save Permissions ({selectedSlugs.length} permitted)
          </Button>
        </div>
      </div>
    </div>
  );
}
