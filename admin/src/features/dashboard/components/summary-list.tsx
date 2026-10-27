import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface SummaryRow {
  label: string;
  value: ReactNode;
  /** Emphasise the headline row. */
  strong?: boolean;
}

/** Label / value rows inside a dashboard panel. */
export function SummaryList({ rows }: { rows: SummaryRow[] }) {
  return (
    <dl className="divide-y divide-border">
      {rows.map((row) => (
        <div key={row.label} className="flex items-baseline justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
          <dt className="text-sm text-muted">{row.label}</dt>
          <dd className={cn('text-sm tabular-nums text-text', row.strong ? 'text-base font-semibold' : 'font-medium')}>
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
