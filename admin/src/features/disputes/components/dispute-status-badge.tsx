import type { DisputeStatus } from '../api';

const STATUS_CONFIG: Record<DisputeStatus, { label: string; className: string }> = {
  OPEN: {
    label: 'Open Ticket',
    className: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    className: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
  },
  RESOLVED_REFUND_FULL: {
    label: 'Full Refund Approved',
    className: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
  },
  RESOLVED_REFUND_PARTIAL: {
    label: 'Partial Refund Approved',
    className: 'bg-blue-500/10 text-blue-600 border border-blue-500/20',
  },
  RESOLVED_REJECTED: {
    label: 'Claim Rejected',
    className: 'bg-surface-muted text-muted border border-border',
  },
};

export function DisputeStatusBadge({ status }: { status: DisputeStatus }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    className: 'bg-surface-muted text-muted border border-border',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
