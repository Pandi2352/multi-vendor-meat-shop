import { Calendar, ExternalLink, Gavel, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatDateIST, formatINR } from '@/utils/format';
import type { Dispute } from '../api';
import { DisputeStatusBadge } from './dispute-status-badge';
import { DisputeReasonBadge } from './dispute-reason-badge';

interface DisputeCardProps {
  dispute: Dispute;
  onResolve: (dispute: Dispute) => void;
}

export function DisputeCard({ dispute, onResolve }: DisputeCardProps) {
  const isResolved =
    dispute.status === 'RESOLVED_REFUND_FULL' ||
    dispute.status === 'RESOLVED_REFUND_PARTIAL' ||
    dispute.status === 'RESOLVED_REJECTED';

  return (
    <div className="rounded-md border border-border bg-surface p-4 space-y-3 text-xs">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-border">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono font-bold text-text text-sm">{dispute.ticketNumber}</span>
          <DisputeStatusBadge status={dispute.status} />
          <DisputeReasonBadge reason={dispute.reason} />
        </div>
        <div className="flex items-center gap-1.5 text-muted text-[11px]">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDateIST(dispute.createdAt)}</span>
        </div>
      </div>

      {/* Order & Customer Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted text-[11px] bg-surface-muted p-2.5 rounded-md">
        <div className="flex items-center gap-1.5">
          <ShoppingBag className="h-3.5 w-3.5 text-text" />
          <span>Order: <strong className="font-mono text-text">{dispute.orderNumber}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>Customer: <strong className="text-text">{dispute.customerName || 'Customer'}</strong></span>
          {dispute.customerPhone && <span>({dispute.customerPhone})</span>}
        </div>
      </div>

      {/* Customer Comments */}
      <div className="space-y-1">
        <span className="text-muted block text-[11px] font-medium">Customer Complaint:</span>
        <p className="text-text bg-surface-muted/60 p-2.5 rounded-md border border-border/50 text-xs italic">
          "{dispute.customerComments}"
        </p>
      </div>

      {/* Photo Proof Thumbnails */}
      {dispute.evidencePhotoUrls.length > 0 && (
        <div className="space-y-1">
          <span className="text-muted block text-[11px] font-medium">Customer Photo Proof:</span>
          <div className="flex items-center gap-2 flex-wrap">
            {dispute.evidencePhotoUrls.map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] text-primary hover:underline bg-surface-muted px-2 py-1 rounded-md border border-border"
              >
                <span>Proof Photo #{idx + 1}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Resolution & Financial Details */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-muted block text-[10px]">Claimed</span>
            <span className="font-semibold text-rose-500">{formatINR(dispute.claimedAmountPaise)}</span>
          </div>
          {dispute.refundAmountPaise !== undefined && dispute.refundAmountPaise > 0 && (
            <div>
              <span className="text-muted block text-[10px]">Refund Disbursed</span>
              <span className="font-semibold text-emerald-600">{formatINR(dispute.refundAmountPaise)}</span>
            </div>
          )}
          {dispute.debitStallPaise !== undefined && dispute.debitStallPaise > 0 && (
            <div>
              <span className="text-muted block text-[10px]">Stall Debited</span>
              <span className="font-semibold text-amber-500">{formatINR(dispute.debitStallPaise)}</span>
            </div>
          )}
        </div>

        <Button
          variant={isResolved ? 'outline' : 'primary'}
          size="sm"
          onClick={() => onResolve(dispute)}
          className="gap-1.5 self-end sm:self-auto"
        >
          <Gavel className="h-3.5 w-3.5" />
          <span>{isResolved ? 'Update Arbitrate' : 'Arbitrate & Resolve'}</span>
        </Button>
      </div>

      {/* Resolution Notes If Any */}
      {dispute.resolutionNotes && (
        <div className="text-[11px] text-muted bg-surface-muted p-2 rounded-md border border-border">
          <strong className="text-text">Findings:</strong> {dispute.resolutionNotes}
        </div>
      )}
    </div>
  );
}
