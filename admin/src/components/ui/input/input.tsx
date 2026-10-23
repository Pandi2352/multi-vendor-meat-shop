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
        // Focus is neutral so it never reads as an error; red is reserved for `invalid`.
        'focus-within:ring-2',
        inputSize === 'lg' ? 'h-11' : 'h-10',
        invalid
          ? 'border-danger focus-within:ring-danger/20'
          : 'border-border hover:border-muted/40 focus-within:border-text/50 focus-within:ring-text/10',
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
