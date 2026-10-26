import type { DisputeReason } from '../api';

const REASON_LABELS: Record<DisputeReason, string> = {
  QUALITY_FRESHNESS: 'Meat Freshness / Odor',
  UNDERWEIGHT: 'Underweight / Scale Discrepancy',
  WRONG_CUT: 'Incorrect Cut (e.g. not Curry Cut)',
  WRONG_ITEM: 'Wrong Item Delivered',
  CONTAMINATION: 'Hygiene / Contamination',
  DELIVERY_DELAY: 'Cold-Chain Delivery Delay',
  MISSING_ITEMS: 'Missing Meat Pack',
  OTHER: 'Other Complaint',
};

export function DisputeReasonBadge({ reason }: { reason: DisputeReason }) {
  const label = REASON_LABELS[reason] || reason;

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-muted text-text border border-border">
      {label}
    </span>
  );
}
