import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
  invalid?: boolean;
  inputSize?: 'md' | 'lg';
}

/** Text input with optional leading icon and trailing slot. Pair with `FormField` for label + error. */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, rightSlot, invalid, inputSize = 'md', disabled, ...props }, ref) => (
    <div
      className={cn(
        'flex w-full items-center gap-2 rounded-md border bg-surface px-3 text-sm text-text transition-colors',
        inputSize === 'lg' ? 'h-11' : 'h-10',
        invalid
          ? 'border-danger focus-within:border-danger'
          : 'border-border hover:border-muted/50 focus-within:border-primary',
        disabled && 'cursor-not-allowed bg-surface-muted opacity-70',
        className,
      )}
    >
      {leftIcon && <span className={cn('shrink-0', invalid ? 'text-danger' : 'text-muted')}>{leftIcon}</span>}
      <input
        ref={ref}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted/70 disabled:cursor-not-allowed"
        {...props}
      />
      {rightSlot && <span className="shrink-0">{rightSlot}</span>}
    </div>
  ),
);

Input.displayName = 'Input';
