import { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui';

interface RejectOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  onConfirm: (reason: string) => Promise<void>;
  isSubmitting?: boolean;
}

const COMMON_REASONS = [
  'Selected cut fresh batch out of stock',
  'Daily shop quota exceeded',
  'Preparation counter overload',
  'Shop closing early for sanitisation',
];

export function RejectOrderModal({
  isOpen,
  onClose,
  orderNumber,
  onConfirm,
  isSubmitting,
}: RejectOrderModalProps) {
  const [reason, setReason] = useState(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = reason === 'custom' ? customReason.trim() : reason;
    if (!finalReason) return;
    await onConfirm(finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-md border border-border bg-surface p-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2 text-danger">
            <AlertCircle className="h-5 w-5" />
            <h3 className="text-base font-semibold text-text">Decline Order</h3>
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
          Declining order <span className="font-semibold text-text">{orderNumber}</span> will immediately restock reserved inventory and notify the customer.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-text">Reason for Declining</label>
            {COMMON_REASONS.map((r) => (
              <label
                key={r}
                className="flex items-center gap-2 p-2 rounded-md border border-border bg-surface hover:bg-surface-muted cursor-pointer text-xs text-text transition-colors"
              >
                <input
                  type="radio"
                  name="rejectReason"
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="text-primary focus:ring-primary"
                />
                <span>{r}</span>
              </label>
            ))}
            <label className="flex items-center gap-2 p-2 rounded-md border border-border bg-surface hover:bg-surface-muted cursor-pointer text-xs text-text transition-colors">
              <input
                type="radio"
                name="rejectReason"
                checked={reason === 'custom'}
                onChange={() => setReason('custom')}
                className="text-primary focus:ring-primary"
              />
              <span>Other custom reason</span>
            </label>
          </div>

          {reason === 'custom' && (
            <div>
              <textarea
                required
                rows={3}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Explain why this order cannot be fulfilled..."
                className="w-full p-2.5 text-xs rounded-md border border-border bg-surface text-text focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Keep Order
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              loading={isSubmitting}
              disabled={reason === 'custom' && !customReason.trim()}
            >
              Confirm Decline
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
