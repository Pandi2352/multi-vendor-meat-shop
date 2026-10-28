import { Store, CheckCircle2, Clock, MapPin } from 'lucide-react';

interface VendorKpiStripProps {
  totalCount: number;
  approvedCount: number;
  pendingCount: number;
  hubCount: number;
}

/** Compact executive KPI metric cards with light watermark icons. */
export function VendorKpiStrip({
  totalCount,
  approvedCount,
  pendingCount,
  hubCount,
}: VendorKpiStripProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
      {/* 1. Total Stalls Card */}
      <div className="relative overflow-hidden p-3 rounded-md bg-surface border border-border hover:border-primary/40 transition-colors flex flex-col justify-between">
        <Store
          aria-hidden="true"
          className="absolute -bottom-1 -right-1 h-16 w-16 text-primary/10 stroke-[1.2] pointer-events-none select-none"
        />
        <div className="flex items-center justify-between relative z-10">
          <span className="text-[11px] font-medium text-muted">Total Stalls</span>
          <div className="h-6 w-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <Store className="h-3 w-3" />
          </div>
        </div>
        <div className="mt-1 relative z-10">
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-text">{totalCount}</p>
          <p className="text-[11px] font-medium text-primary mt-0.5 truncate">
            Registered Meat Stalls
          </p>
        </div>
      </div>

      {/* 2. Active Stalls Card */}
      <div className="relative overflow-hidden p-3 rounded-md bg-surface border border-border hover:border-emerald-500/40 transition-colors flex flex-col justify-between">
        <CheckCircle2
          aria-hidden="true"
          className="absolute -bottom-1 -right-1 h-16 w-16 text-emerald-500/10 stroke-[1.2] pointer-events-none select-none"
        />
        <div className="flex items-center justify-between relative z-10">
          <span className="text-[11px] font-medium text-muted">Active & Delivering</span>
          <div className="h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-3 w-3" />
          </div>
        </div>
        <div className="mt-1 relative z-10">
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-text">{approvedCount}</p>
          <p className="text-[11px] font-medium text-emerald-600 mt-0.5 truncate">
            100% Live & Ordering
          </p>
        </div>
      </div>

      {/* 3. Pending Review Card */}
      <div className="relative overflow-hidden p-3 rounded-md bg-surface border border-border hover:border-amber-500/40 transition-colors flex flex-col justify-between">
        <Clock
          aria-hidden="true"
          className="absolute -bottom-1 -right-1 h-16 w-16 text-amber-500/10 stroke-[1.2] pointer-events-none select-none"
        />
        <div className="flex items-center justify-between relative z-10">
          <span className="text-[11px] font-medium text-muted">Pending Review</span>
          <div className="h-6 w-6 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="h-3 w-3" />
          </div>
        </div>
        <div className="mt-1 relative z-10">
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-text">{pendingCount}</p>
          <p className="text-[11px] font-medium text-amber-600 mt-0.5 truncate">
            {pendingCount > 0 ? 'Requires Verification' : 'All Stalls Cleared'}
          </p>
        </div>
      </div>

      {/* 4. Town Hubs Card */}
      <div className="relative overflow-hidden p-3 rounded-md bg-surface border border-border hover:border-sky-500/40 transition-colors flex flex-col justify-between">
        <MapPin
          aria-hidden="true"
          className="absolute -bottom-1 -right-1 h-16 w-16 text-sky-500/10 stroke-[1.2] pointer-events-none select-none"
        />
        <div className="flex items-center justify-between relative z-10">
          <span className="text-[11px] font-medium text-muted">Coverage Hubs</span>
          <div className="h-6 w-6 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 flex items-center justify-center shrink-0">
            <MapPin className="h-3 w-3" />
          </div>
        </div>
        <div className="mt-1 relative z-10">
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-text">{hubCount}</p>
          <p className="text-[11px] font-medium text-sky-600 mt-0.5 truncate">
            Active Municipal Hubs
          </p>
        </div>
      </div>
    </div>
  );
}
