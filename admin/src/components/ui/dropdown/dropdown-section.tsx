import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function DropdownLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('px-2.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted', className)}>
      {children}
    </div>
  );
}

export function DropdownSeparator() {
  return <div role="separator" className="-mx-1 my-1 h-px bg-border" />;
}
