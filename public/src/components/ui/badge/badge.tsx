import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import { badgeVariants } from './badge.variants';

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  leftIcon?: ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, tone, size, dot, leftIcon, children, ...props }, ref) => {
    return (
      <span ref={ref} className={cn(badgeVariants({ tone, size }), className)} {...props}>
        {dot && <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />}
        {leftIcon}
        <span>{children}</span>
      </span>
    );
  },
);

Badge.displayName = 'Badge';
