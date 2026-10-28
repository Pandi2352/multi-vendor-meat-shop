import { X, Store } from 'lucide-react';
import type { VendorProfile } from '../api';
import { EditVendorForm } from './edit-vendor-form';

interface EditVendorModalProps {
  vendor: VendorProfile | null;
  onClose: () => void;
  onSaved?: (vendor: VendorProfile) => void;
}

/** Modal dialog for editing stall details and operational settings. */
export function EditVendorModal({ vendor, onClose, onSaved }: EditVendorModalProps) {
  if (!vendor) return null;

  const handleSaved = (updated: VendorProfile) => {
    onSaved?.(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-md w-full max-w-4xl lg:max-w-5xl min-h-[580px] max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-primary/10 border border-primary/20 text-primary">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text">Edit Butcher Stall / கடையைத் திருத்து</h2>
              <p className="text-xs text-muted">{vendor.businessName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted hover:text-text rounded-md hover:bg-surface-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <EditVendorForm vendor={vendor} onSaved={handleSaved} onCancel={onClose} />
      </div>
    </div>
  );
}
