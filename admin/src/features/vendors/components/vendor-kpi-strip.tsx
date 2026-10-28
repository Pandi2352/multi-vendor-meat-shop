import { Store, CheckCircle2, Clock, MapPin, Sparkles, ShieldAlert } from 'lucide-react';

interface VendorKpiStripProps {
  totalCount: number;
  approvedCount: number;
  pendingCount: number;
  hubCount: number;
}

/** Executive KPI metric cards for stalls overview with icons. */
export function VendorKpiStrip({
  totalCount,
  approvedCount,
  pendingCount,
  hubCount,
}: VendorKpiStripProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Total Stalls Card */}
      <div className="p-4 rounded-md bg-surface border border-border hover:border-primary/40 transition-colors flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
            Total Stalls
          </span>
          <div className="h-9 w-9 rounded-md bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <Store className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold tracking-tight text-text">{totalCount}</p>
          <p className="text-[11px] text-muted mt-0.5 flex items-center gap-1 font-medium">
            <Sparkles className="h-3 w-3 text-primary shrink-0" />
            Sivakasi & Surrounding
          </p>
        </div>
      </div>

      {/* Active & Delivering Card */}
      <div className="p-4 rounded-md bg-surface border border-border hover:border-emerald-500/40 transition-colors flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
            Active Stalls
          </span>
          <div className="h-9 w-9 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold tracking-tight text-emerald-600">{approvedCount}</p>
          <p className="text-[11px] text-muted mt-0.5 flex items-center gap-1 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
            100% Live & Delivering
          </p>
        </div>
      </div>

      {/* Pending Review Card */}
      <div className="p-4 rounded-md bg-surface border border-border hover:border-amber-500/40 transition-colors flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
            Pending Review
          </span>
          <div className="h-9 w-9 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold tracking-tight text-amber-600">{pendingCount}</p>
          <p className="text-[11px] text-muted mt-0.5 flex items-center gap-1 font-medium">
            {pendingCount > 0 ? (
              <>
                <ShieldAlert className="h-3 w-3 text-amber-600 shrink-0" />
                Requires Verification
              </>
            ) : (
              'All Stalls Cleared'
            )}
          </p>
        </div>
      </div>

      {/* Town Hubs Card */}
      <div className="p-4 rounded-md bg-surface border border-border hover:border-sky-500/40 transition-colors flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">
            Coverage Hubs
          </span>
          <div className="h-9 w-9 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-600 flex items-center justify-center shrink-0">
            <MapPin className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold tracking-tight text-text">
            {hubCount} <span className="text-xs font-normal text-muted">Hubs</span>
          </p>
          <p className="text-[11px] text-muted mt-0.5 truncate font-medium">
            Sivakasi, Thiruthangal & more
          </p>
        </div>
      </div>
    </div>
  );
}
