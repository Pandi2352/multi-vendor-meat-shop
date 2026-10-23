import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import type { VariantProps } from 'class-variance-authority';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/cn';
import { buttonVariants } from './button.variants';

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : leftIcon}
      {children}
      {rightIcon}
    </button>
  ),
);

Button.displayName = 'Button';
