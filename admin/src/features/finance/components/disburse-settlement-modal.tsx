import { useState } from 'react';
import { X, Send, Landmark, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatINR } from '@/utils/format';
import type { FinanceSummary } from '../api';

interface DisburseSettlementModalProps {
  shopName: string;
  shopId: string;
  summary: FinanceSummary | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { shopId: string; utrNumber?: string; notes?: string }) => void;
  isSubmitting: boolean;
}

export function DisburseSettlementModal({
  shopName,
  shopId,
  summary,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: DisburseSettlementModalProps) {
  const [utrNumber, setUtrNumber] = useState('');
  const [notes, setNotes] = useState('Weekly settlement disbursed via IMPS bank transfer');

  if (!isOpen || !summary) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      shopId,
      utrNumber: utrNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-md w-full max-w-md p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-emerald-600" />
            <div>
              <h3 className="text-base font-semibold text-text">Disburse Vendor Payout</h3>
              <p className="text-xs text-muted">{shopName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text p-1 rounded-md">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Payout Breakdown */}
        <div className="p-3 rounded-md bg-surface-muted border border-border space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-muted">
            <span>Delivered Orders Pending:</span>
            <span className="font-semibold text-text">{summary.pendingOrdersCount} orders</span>
          </div>
          <div className="flex items-center justify-between text-muted">
            <span>Gross Delivered Sales:</span>
            <span className="font-semibold text-text">{formatINR(summary.totalGrossSalesPaise)}</span>
          </div>
          <div className="flex items-center justify-between text-muted">
            <span>Platform Commission (10%):</span>
            <span className="font-semibold text-rose-600">-{formatINR(summary.totalCommissionDeductedPaise)}</span>
          </div>
          <div className="flex items-center justify-between pt-1.5 border-t border-border text-sm font-bold text-emerald-600">
            <span>Net Payout to Disburse:</span>
            <span>{formatINR(summary.pendingSettlementPaise)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-medium text-text block mb-1">Bank UTR / Transaction Reference</label>
            <input
              type="text"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              placeholder="e.g. HDFC009827361524 or UPI/6291829"
              className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="font-medium text-text block mb-1">Disbursement Remarks</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface text-text focus:outline-none focus:border-primary"
            />
          </div>

          <div className="p-2.5 rounded-md bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2 text-[11px] text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Posting this will mark all pending delivered orders as SETTLED and record a DEBIT entry on the stall running ledger.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={isSubmitting}>
              <Send className="h-3.5 w-3.5 mr-1" /> Disburse & Confirm Settlement
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
