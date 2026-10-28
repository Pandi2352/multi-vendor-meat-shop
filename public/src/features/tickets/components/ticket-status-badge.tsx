import type { DisputeStatus } from '../api/tickets.api';

interface TicketStatusBadgeProps {
  status: DisputeStatus;
}

const STATUS_CONFIG: Record<DisputeStatus, { label: string; toneClass: string; dotClass: string }> = {
  OPEN: {
    label: 'Open',
    toneClass: 'border-warning/30 bg-warning/10 text-warning',
    dotClass: 'bg-warning',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    toneClass: 'border-info/30 bg-info/10 text-info',
    dotClass: 'bg-info',
  },
  RESOLVED_REFUND_FULL: {
    label: 'Full Refund Approved',
    toneClass: 'border-success/30 bg-success/10 text-success',
    dotClass: 'bg-success',
  },
  RESOLVED_REFUND_PARTIAL: {
    label: 'Partial Refund Approved',
    toneClass: 'border-success/30 bg-success/10 text-success',
    dotClass: 'bg-success',
  },
  RESOLVED_REJECTED: {
    label: 'Claim Rejected',
    toneClass: 'border-danger/30 bg-danger/10 text-danger',
    dotClass: 'bg-danger',
  },
};

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    toneClass: 'border-border bg-surface-muted text-muted',
    dotClass: 'bg-muted',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-semibold ${config.toneClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
      <span>{config.label}</span>
    </span>
  );
}
