import { Store, CheckCircle2, Clock, MapPin } from 'lucide-react';

interface VendorKpiStripProps {
  totalCount: number;
  approvedCount: number;
  pendingCount: number;
  hubCount: number;
}

/** Executive KPI metric cards matching modern SaaS light watermark aesthetic. */
export function VendorKpiStrip({
  totalCount,
  approvedCount,
  pendingCount,
  hubCount,
}: VendorKpiStripProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Total Stalls Card */}
      <div className="relative overflow-hidden p-4 rounded-md bg-surface border border-border hover:border-primary/40 transition-colors flex flex-col justify-between">
        {/* Large Faint Watermark Icon */}
        <Store
          aria-hidden="true"
          className="absolute -bottom-3 -right-3 h-28 w-28 text-primary/10 stroke-[1.2] pointer-events-none select-none"
        />

        <div className="flex items-start justify-between relative z-10">
          <span className="text-xs font-medium text-muted">Total Stalls</span>
          <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <Store className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="mt-2.5 relative z-10">
          <p className="text-3xl font-extrabold tracking-tight text-text">{totalCount}</p>
          <p className="text-xs font-semibold text-primary mt-1 truncate">
            Sivakasi & Surrounding
          </p>
        </div>
      </div>

      {/* 2. Active Stalls Card */}
      <div className="relative overflow-hidden p-4 rounded-md bg-surface border border-border hover:border-emerald-500/40 transition-colors flex flex-col justify-between">
        {/* Large Faint Watermark Icon */}
        <CheckCircle2
          aria-hidden="true"
          className="absolute -bottom-3 -right-3 h-28 w-28 text-emerald-500/10 stroke-[1.2] pointer-events-none select-none"
        />

        <div className="flex items-start justify-between relative z-10">
          <span className="text-xs font-medium text-muted">Active & Delivering</span>
          <div className="h-7 w-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="mt-2.5 relative z-10">
          <p className="text-3xl font-extrabold tracking-tight text-text">{approvedCount}</p>
          <p className="text-xs font-semibold text-emerald-600 mt-1 truncate">
            100% Live & Ordering
          </p>
        </div>
      </div>

      {/* 3. Pending Review Card */}
      <div className="relative overflow-hidden p-4 rounded-md bg-surface border border-border hover:border-amber-500/40 transition-colors flex flex-col justify-between">
        {/* Large Faint Watermark Icon */}
        <Clock
          aria-hidden="true"
          className="absolute -bottom-3 -right-3 h-28 w-28 text-amber-500/10 stroke-[1.2] pointer-events-none select-none"
        />

        <div className="flex items-start justify-between relative z-10">
          <span className="text-xs font-medium text-muted">Pending Review</span>
          <div className="h-7 w-7 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="mt-2.5 relative z-10">
          <p className="text-3xl font-extrabold tracking-tight text-text">{pendingCount}</p>
          <p className="text-xs font-semibold text-amber-600 mt-1 truncate">
            {pendingCount > 0 ? 'Requires Verification' : 'All Stalls Cleared'}
          </p>
        </div>
      </div>

      {/* 4. Town Hubs Card */}
      <div className="relative overflow-hidden p-4 rounded-md bg-surface border border-border hover:border-sky-500/40 transition-colors flex flex-col justify-between">
        {/* Large Faint Watermark Icon */}
        <MapPin
          aria-hidden="true"
          className="absolute -bottom-3 -right-3 h-28 w-28 text-sky-500/10 stroke-[1.2] pointer-events-none select-none"
        />

        <div className="flex items-start justify-between relative z-10">
          <span className="text-xs font-medium text-muted">Coverage Hubs</span>
          <div className="h-7 w-7 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 flex items-center justify-center shrink-0">
            <MapPin className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className="mt-2.5 relative z-10">
          <p className="text-3xl font-extrabold tracking-tight text-text">{hubCount}</p>
          <p className="text-xs font-semibold text-sky-600 mt-1 truncate">
            Sivakasi, Thiruthangal & Environs
          </p>
        </div>
      </div>
    </div>
  );
}
