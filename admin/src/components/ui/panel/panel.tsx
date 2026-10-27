import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface PanelProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  /** Right side of the header, e.g. a "View all" link. */
  action?: ReactNode;
  className?: string;
  /** Removes body padding for edge-to-edge lists. */
  flush?: boolean;
  children: ReactNode;
}

/** Titled surface for a dashboard or detail-page section. */
export function Panel({ title, description, icon: Icon, action, className, flush, children }: PanelProps) {
  return (
    <section className={cn('flex flex-col rounded-md border border-border bg-surface', className)}>
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {Icon && <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-muted" />}
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-text">{title}</h2>
            {description && <p className="truncate text-xs text-muted">{description}</p>}
          </div>
        </div>
        {action}
      </header>
      <div className={cn('flex-1', !flush && 'p-4')}>{children}</div>
    </section>
  );
}
