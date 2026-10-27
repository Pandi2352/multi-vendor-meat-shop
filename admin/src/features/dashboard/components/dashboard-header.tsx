import type { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';
import { formatDayIST, formatTimeIST } from '@/utils/format';

interface DashboardHeaderProps {
  title: string;
  subtitle: ReactNode;
  /** IST day the numbers cover (`YYYY-MM-DD`). */
  date?: string;
  updatedAt: number;
  refreshing: boolean;
  onRefresh: () => void;
  badge?: ReactNode;
}

/** Title row shared by the vendor and admin dashboards: what day, when it was last updated, refresh. */
export function DashboardHeader({ title, subtitle, date, updatedAt, refreshing, onRefresh, badge }: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight text-text">{title}</h1>
          {badge}
        </div>
        <p className="text-sm text-muted">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted">
        <span>
          {date && <>{formatDayIST(date)} · </>}
          Updated {formatTimeIST(new Date(updatedAt).toISOString())}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          loading={refreshing}
          leftIcon={!refreshing && <RefreshCw className="h-3.5 w-3.5" />}
        >
          Refresh
        </Button>
      </div>
    </header>
  );
}
