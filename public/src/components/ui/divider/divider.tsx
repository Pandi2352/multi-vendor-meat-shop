import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface DividerProps {
  label?: ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Divider({ label, orientation = 'horizontal', className }: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn('inline-block h-full min-h-[1em] w-[1px] bg-border self-stretch', className)}
      />
    );
  }

  if (label) {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={cn('relative flex items-center my-4', className)}
      >
        <div className="flex-grow border-t border-border" />
        <span className="mx-3 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-muted">
          {label}
        </span>
        <div className="flex-grow border-t border-border" />
      </div>
    );
  }

  return (
    <hr
      role="separator"
      aria-orientation="horizontal"
      className={cn('my-4 border-t border-border w-full', className)}
    />
  );
}
