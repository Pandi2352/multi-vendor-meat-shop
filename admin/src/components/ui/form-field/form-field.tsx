import type { ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface FormFieldProps {
  /** id of the control; wires label, hint and error together. */
  htmlFor: string;
  label: ReactNode;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Extra element on the label row, e.g. a "Forgot?" link. */
  labelAction?: ReactNode;
  className?: string;
  children: ReactNode;
}

export const fieldDescriptionId = (id: string) => `${id}-description`;

function formatLabel(label: ReactNode, required?: boolean) {
  if (typeof label !== 'string') {
    return (
      <>
        {label}
        {required && (
          <span className="text-danger ml-0.5 font-semibold" aria-hidden="true">
            *
          </span>
        )}
      </>
    );
  }

  const trimmed = label.trim();
  if (trimmed.endsWith('*')) {
    const textWithoutStar = trimmed.slice(0, -1).trimEnd();
    return (
      <>
        {textWithoutStar}{' '}
        <span className="text-danger font-semibold" aria-hidden="true">
          *
        </span>
      </>
    );
  }

  return (
    <>
      {label}
      {required && (
        <span className="text-danger ml-0.5 font-semibold" aria-hidden="true">
          *
        </span>
      )}
    </>
  );
}

/** Label + control + hint/error, with ids for `aria-describedby` and red asterisk for required fields. */
export function FormField({
  htmlFor,
  label,
  hint,
  error,
  required,
  labelAction,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={htmlFor} className="text-sm font-medium text-text">
          {formatLabel(label, required)}
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
