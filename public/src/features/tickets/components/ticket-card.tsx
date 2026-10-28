import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ChevronRight, FileText } from 'lucide-react';
import { formatDateIST, formatINR } from '@/utils';
import type { DisputeReason, SupportTicketResponse } from '../api/tickets.api';
import { TicketStatusBadge } from './ticket-status-badge';

interface TicketCardProps {
  ticket: SupportTicketResponse;
}

const REASON_LABELS: Record<DisputeReason, string> = {
  QUALITY_FRESHNESS: 'Freshness / Quality Issue',
  UNDERWEIGHT: 'Weight Deficit / Underweight',
  WRONG_CUT: 'Wrong Cut Type',
  WRONG_ITEM: 'Wrong Meat Item Delivered',
  CONTAMINATION: 'Foreign Object or Contamination',
  DELIVERY_DELAY: 'Severe Delivery Delay',
  MISSING_ITEMS: 'Missing Cut / Item',
  OTHER: 'Other Issue',
};

export function TicketCard({ ticket }: TicketCardProps) {
  const isResolvedRefund =
    ticket.status === 'RESOLVED_REFUND_FULL' || ticket.status === 'RESOLVED_REFUND_PARTIAL';

  return (
    <div className="rounded-md border border-border bg-surface p-4 sm:p-5 space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="font-mono font-bold text-sm text-text">{ticket.ticketNumber}</span>
          <span className="text-xs text-muted">•</span>
          <span className="text-xs text-muted">{formatDateIST(ticket.createdAt)}</span>
        </div>
        <TicketStatusBadge status={ticket.status} />
      </div>

      {/* Main info */}
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted">Issue Category:</span>
          <span className="font-semibold text-text">
            {REASON_LABELS[ticket.reason] || ticket.reason}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted">Order Reference:</span>
          <Link
            to={`/orders/${ticket.orderId}`}
            className="text-primary hover:underline font-mono font-medium flex items-center gap-0.5"
          >
            <span>{ticket.orderNumber}</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted">Claimed Amount:</span>
          <span className="font-semibold text-text">{formatINR(ticket.claimedAmountPaise)}</span>
        </div>
      </div>

      {/* Customer Complaint */}
      <div className="rounded-md border border-border bg-surface-muted p-3 text-xs">
        <p className="text-muted font-medium mb-1">Your Reported Complaint:</p>
        <p className="text-text italic">"{ticket.customerComments}"</p>
      </div>

      {/* Resolution block if resolved or under review */}
      {isResolvedRefund && ticket.refundAmountPaise !== undefined && ticket.refundAmountPaise > 0 && (
        <div className="rounded-md border border-success/30 bg-success/10 p-3 text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-success font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            <span>Refund of {formatINR(ticket.refundAmountPaise)} Approved</span>
          </div>
          {ticket.resolutionNotes && (
            <p className="text-text-muted mt-1">{ticket.resolutionNotes}</p>
          )}
        </div>
      )}

      {ticket.status === 'RESOLVED_REJECTED' && (
        <div className="rounded-md border border-danger/30 bg-danger/10 p-3 text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-danger font-semibold">
            <AlertCircle className="h-4 w-4" />
            <span>Claim Not Approved</span>
          </div>
          {ticket.resolutionNotes && (
            <p className="text-text-muted mt-1">{ticket.resolutionNotes}</p>
          )}
        </div>
      )}
    </div>
  );
}
