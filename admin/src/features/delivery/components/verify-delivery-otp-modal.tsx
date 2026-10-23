import { useState } from 'react';
import { KeyRound, Banknote, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatINR } from '@/utils/format';

interface VerifyDeliveryOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  codAmountPaise: number;
  onVerify: (data: { otp: string; collectedCod: boolean }) => Promise<void>;
  isSubmitting?: boolean;
}

export function VerifyDeliveryOtpModal({
  isOpen,
  onClose,
  orderNumber,
  codAmountPaise,
  onVerify,
  isSubmitting,
}: VerifyDeliveryOtpModalProps) {
  const [otp, setOtp] = useState('');
  const [collectedCod, setCollectedCod] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 4 || !collectedCod) return;
    await onVerify({ otp, collectedCod });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-md border border-border bg-surface p-6">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-text">Verify Handover & Collect Cash</h3>
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
          Order <span className="font-semibold text-text">{orderNumber}</span> requires customer 4-digit OTP proof and cash collection.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* COD Collection Prominent Card */}
          <div className="rounded-md border border-warning/30 bg-warning-soft p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Banknote className="h-5 w-5 text-warning shrink-0" />
              <div>
                <p className="text-xs font-semibold text-text">Cash On Delivery to Collect</p>
                <p className="text-[11px] text-muted">Collect exact amount before handoff</p>
              </div>
            </div>
            <span className="text-base font-bold text-text font-mono">{formatINR(codAmountPaise)}</span>
          </div>

          <div>
            <label className="text-xs font-medium text-text block mb-1.5">
              Enter 4-Digit Customer OTP
            </label>
            <input
              type="text"
              required
              maxLength={4}
              pattern="\d{4}"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 4821"
              className="w-full px-3 py-2 text-center text-xl font-mono tracking-widest rounded-md border border-border bg-surface text-text focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <label className="flex items-start gap-2 p-2.5 rounded-md border border-border bg-surface hover:bg-surface-muted cursor-pointer transition-colors text-xs text-text">
            <input
              type="checkbox"
              required
              checked={collectedCod}
              onChange={(e) => setCollectedCod(e.target.checked)}
              className="mt-0.5 text-primary rounded-md focus:ring-primary"
            />
            <span>I confirm that <strong>{formatINR(codAmountPaise)}</strong> has been collected in cash from the customer.</span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={isSubmitting}
              disabled={otp.length !== 4 || !collectedCod}
            >
              Verify OTP & Complete Delivery
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
