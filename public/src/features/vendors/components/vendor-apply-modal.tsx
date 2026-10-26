import { useState } from 'react';
import { X, Store } from 'lucide-react';
import type { VendorApplicationResponse } from '../api/vendor-apply.api';
import { VendorApplySuccess } from './vendor-apply-success';
import { VendorApplyForm } from './vendor-apply-form';

interface VendorApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VendorApplyModal({ isOpen, onClose }: VendorApplyModalProps) {
  const [result, setResult] = useState<VendorApplicationResponse | null>(null);
  const [fssai, setFssai] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-md w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-text">Partner With Us / கடை பதிவு</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-muted hover:text-text rounded-md hover:bg-surface-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {result ? (
          <VendorApplySuccess result={result} fssaiNumber={fssai} onClose={handleClose} />
        ) : (
          <VendorApplyForm
            onSuccess={(data, submittedFssai) => {
              setFssai(submittedFssai);
              setResult(data);
            }}
            onCancel={handleClose}
          />
        )}
      </div>
    </div>
  );
}
