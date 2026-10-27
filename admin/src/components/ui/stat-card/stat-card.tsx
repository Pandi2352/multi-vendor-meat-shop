import type { ReactNode } from 'react';
import type { VariantProps } from 'class-variance-authority';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { statCardIconVariants } from './stat-card.variants';

export interface StatCardProps extends VariantProps<typeof statCardIconVariants> {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: LucideIcon;
  /** Makes the whole card a link (e.g. "3 new orders" → the orders tab). */
  to?: string;
  /** Draws attention when the number needs someone to act. */
  attention?: boolean;
  className?: string;
}

/** One number with a label, for dashboards. Tone colours the icon; `attention` tints the card. */
export function StatCard({ label, value, hint, icon: Icon, tone, to, attention, className }: StatCardProps) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium text-muted">{label}</span>
        {Icon && (
          <span className={statCardIconVariants({ tone })}>
            <Icon aria-hidden="true" className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tight text-text tabular-nums">{value}</div>
      {(hint || to) && (
        <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted">
          <span>{hint}</span>
          {to && <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />}
        </div>
      )}
    </>
  );

  const classes = cn(
    'group flex flex-col rounded-md border p-4 transition-colors',
    attention ? 'border-warning/40 bg-warning-soft/40' : 'border-border bg-surface',
    to && 'cursor-pointer hover:border-primary/40 hover:bg-surface-muted/50 focus-visible:outline-2 focus-visible:outline-primary',
    className,
  );

  return to ? (
    <Link to={to} className={classes}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}
