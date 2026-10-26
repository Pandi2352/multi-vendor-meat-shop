import { Spinner } from '../spinner';
import { cn } from '@/lib/cn';

export interface LoaderStateProps {
  title?: string;
  description?: string;
  className?: string;
  compact?: boolean;
}

/** Clean, professional spinner with status description for API loading states */
export function LoaderState({
  title = 'Loading...',
  description = 'Connecting to marketplace services',
  className,
  compact = false,
}: LoaderStateProps) {
  return (
    <div
      className={cn(
        'w-full flex flex-col items-center justify-center text-center border border-border rounded-md bg-surface',
        compact ? 'p-6 space-y-2' : 'p-12 space-y-3',
        className,
      )}
    >
      <Spinner size={compact ? 'md' : 'lg'} />
      <div className="space-y-0.5">
        {title && <p className="text-sm font-semibold text-text">{title}</p>}
        {description && <p className="text-xs text-muted max-w-sm">{description}</p>}
      </div>
    </div>
  );
}

/** Backward compatibility for any remaining table/matrix loader references */
export function TableSkeleton({ rows = 5 }: { rows?: number; columns?: number }) {
  return (
    <LoaderState
      title="Loading records..."
      description={`Fetching data (${rows} items expected)`}
      compact
    />
  );
}

export function MatrixSkeleton() {
  return (
    <LoaderState
      title="Loading permissions matrix..."
      description="Syncing system catalog and role overrides"
    />
  );
}
