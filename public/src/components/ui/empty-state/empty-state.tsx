import type { ReactNode } from 'react';
import { PackageOpen, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '../button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center bg-surface border border-border rounded-md max-w-md mx-auto my-6',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-surface-muted text-muted mb-3">
        <Icon className="h-6 w-6 text-muted" aria-hidden="true" />
      </div>

      <h3 className="text-base font-semibold text-text mb-1">{title}</h3>
      {description && <p className="text-xs text-muted mb-4 max-w-xs">{description}</p>}

      {children && <div className="mb-4 w-full">{children}</div>}

      <div className="flex flex-wrap items-center justify-center gap-2">
        {actionLabel && onAction && (
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button variant="outline" onClick={onSecondaryAction}>
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
