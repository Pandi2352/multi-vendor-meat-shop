import { Search, X } from 'lucide-react';
import type { DisputeReason, DisputeStatus } from '../api';

interface DisputeFilterBarProps {
  statusFilter?: DisputeStatus;
  onStatusChange: (status?: DisputeStatus) => void;
  reasonFilter?: DisputeReason;
  onReasonChange: (reason?: DisputeReason) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export function DisputeFilterBar({
  statusFilter,
  onStatusChange,
  reasonFilter,
  onReasonChange,
  search,
  onSearchChange,
}: DisputeFilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
      {/* Status Filter Tabs */}
      <div className="flex rounded-md border border-border p-0.5 bg-surface-muted w-fit">
        <button
          type="button"
          onClick={() => onStatusChange(undefined)}
          className={`px-3 py-1 rounded-md font-medium transition-colors ${
            !statusFilter ? 'bg-surface text-text border border-border' : 'text-muted hover:text-text'
          }`}
        >
          All Disputes
        </button>
        <button
          type="button"
          onClick={() => onStatusChange('OPEN')}
          className={`px-3 py-1 rounded-md font-medium transition-colors ${
            statusFilter === 'OPEN' ? 'bg-surface text-rose-500 border border-border' : 'text-muted hover:text-text'
          }`}
        >
          Open
        </button>
        <button
          type="button"
          onClick={() => onStatusChange('UNDER_REVIEW')}
          className={`px-3 py-1 rounded-md font-medium transition-colors ${
            statusFilter === 'UNDER_REVIEW' ? 'bg-surface text-amber-500 border border-border' : 'text-muted hover:text-text'
          }`}
        >
          Under Review
        </button>
        <button
          type="button"
          onClick={() => onStatusChange('RESOLVED_REFUND_FULL')}
          className={`px-3 py-1 rounded-md font-medium transition-colors ${
            statusFilter === 'RESOLVED_REFUND_FULL' ? 'bg-surface text-emerald-600 border border-border' : 'text-muted hover:text-text'
          }`}
        >
          Refunded
        </button>
      </div>

      {/* Search & Reason dropdown */}
      <div className="flex items-center gap-2">
        <select
          value={reasonFilter || ''}
          onChange={(e) => onReasonChange(e.target.value ? (e.target.value as DisputeReason) : undefined)}
          className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-text focus:outline-none focus:border-primary"
        >
          <option value="">All Complaint Reasons</option>
          <option value="QUALITY_FRESHNESS">Freshness & Odor</option>
          <option value="UNDERWEIGHT">Underweight Discrepancy</option>
          <option value="WRONG_CUT">Wrong Cut Type</option>
          <option value="WRONG_ITEM">Wrong Item</option>
          <option value="CONTAMINATION">Hygiene & Cleaning</option>
          <option value="DELIVERY_DELAY">Cold-Chain Delay</option>
          <option value="MISSING_ITEMS">Missing Item</option>
        </select>

        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search ticket # or order #..."
            className="rounded-md border border-border bg-surface pl-8 pr-7 py-1.5 text-xs text-text focus:outline-none focus:border-primary w-48"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-text"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
