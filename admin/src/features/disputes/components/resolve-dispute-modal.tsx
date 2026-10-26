import { useState } from 'react';
import { X, Gavel } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatINR } from '@/utils/format';
import type { Dispute, DisputeStatus, ResolveDisputePayload } from '../api';

interface ResolveDisputeModalProps {
  dispute: Dispute | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, payload: ResolveDisputePayload) => void;
  isSubmitting: boolean;
}

export function ResolveDisputeModal({
  dispute,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: ResolveDisputeModalProps) {
  const [status, setStatus] = useState<DisputeStatus>('RESOLVED_REFUND_FULL');
  const [customRefundRupees, setCustomRefundRupees] = useState('');
  const [debitStall, setDebitStall] = useState(true);
  const [notes, setNotes] = useState('');

  if (!isOpen || !dispute) return null;

  const claimedRupees = Math.round(dispute.claimedAmountPaise / 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let refundAmountPaise: number | undefined;

    if (status === 'RESOLVED_REFUND_FULL') {
      refundAmountPaise = dispute.claimedAmountPaise;
    } else if (status === 'RESOLVED_REFUND_PARTIAL') {
      refundAmountPaise = Math.round(Number(customRefundRupees || 0) * 100);
    } else {
      refundAmountPaise = 0;
    }

    onSubmit(dispute.id, {
      status,
      resolutionNotes: notes.trim(),
      refundAmountPaise,
      debitStall,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-md border border-border bg-surface p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold text-text">Arbitrate Dispute Ticket</h2>
          </div>
          <button type="button" onClick={onClose} className="text-muted hover:text-text">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3 rounded-md bg-surface-muted text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-muted">Ticket #:</span>
            <span className="font-mono font-medium text-text">{dispute.ticketNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Order #:</span>
            <span className="font-mono text-text">{dispute.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Customer Claim:</span>
            <strong className="text-rose-500">{formatINR(dispute.claimedAmountPaise)}</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-text mb-1">Resolution Decision *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as DisputeStatus)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
            >
              <option value="RESOLVED_REFUND_FULL">Approve Full Refund ({formatINR(dispute.claimedAmountPaise)})</option>
              <option value="RESOLVED_REFUND_PARTIAL">Approve Partial Refund (Specific Amount)</option>
              <option value="RESOLVED_REJECTED">Reject Dispute (No Refund)</option>
              <option value="UNDER_REVIEW">Keep Under Investigation</option>
            </select>
          </div>

          {status === 'RESOLVED_REFUND_PARTIAL' && (
            <div>
              <label className="block font-medium text-text mb-1">Partial Refund Amount (₹) *</label>
              <input
                type="number"
                min="1"
                max={claimedRupees}
                required
                value={customRefundRupees}
                onChange={(e) => setCustomRefundRupees(e.target.value)}
                placeholder={`Max ₹${claimedRupees}`}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
              />
            </div>
          )}

          {(status === 'RESOLVED_REFUND_FULL' || status === 'RESOLVED_REFUND_PARTIAL') && (
            <label className="flex items-center gap-2 cursor-pointer text-xs text-text">
              <input
                type="checkbox"
                checked={debitStall}
                onChange={(e) => setDebitStall(e.target.checked)}
                className="rounded-md border-border text-primary focus:ring-0"
              />
              <span>Debit Butcher Stall ledger balance for this refund</span>
            </label>
          )}

          <div>
            <label className="block font-medium text-text mb-1">Resolution Notes & Findings *</label>
            <textarea
              required
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="State reason, scale verification, or customer communication..."
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-text focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
              Confirm Resolution
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
