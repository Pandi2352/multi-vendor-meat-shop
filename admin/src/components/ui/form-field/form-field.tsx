import type { ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface FormFieldProps {
  /** id of the control; wires label, hint and error together. */
  htmlFor: string;
  label: string;
  hint?: string;
  error?: string;
  /** Extra element on the label row, e.g. a "Forgot?" link. */
  labelAction?: ReactNode;
  className?: string;
  children: ReactNode;
}

export const fieldDescriptionId = (id: string) => `${id}-description`;

/** Label + control + hint/error, with ids for `aria-describedby`. */
export function FormField({ htmlFor, label, hint, error, labelAction, className, children }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={htmlFor} className="text-sm font-medium text-text">
          {label}
        </label>
        {labelAction}
      </div>
      {children}
      {(error || hint) && (
        <p
          id={fieldDescriptionId(htmlFor)}
          role={error ? 'alert' : undefined}
          className={cn('flex items-start gap-1.5 text-xs', error ? 'text-danger' : 'text-muted')}
        >
          {error && <CircleAlert aria-hidden="true" className="mt-px h-3.5 w-3.5 shrink-0" />}
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
