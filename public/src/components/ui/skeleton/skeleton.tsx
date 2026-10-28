import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'text';
}

export function Skeleton({ variant = 'rectangular', className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse bg-muted/20',
        variant === 'circular' ? 'rounded-full' : 'rounded-md',
        variant === 'text' && 'h-4 w-full rounded-md',
        className,
      )}
      {...props}
    />
  );
}
