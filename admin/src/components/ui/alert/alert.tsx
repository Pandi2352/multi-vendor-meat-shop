import type { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

const alertVariants = cva('flex items-start gap-3 rounded-md border px-3.5 py-3 text-sm', {
  variants: {
    tone: {
      info: 'border-info/20 bg-info-soft text-info',
      success: 'border-success/20 bg-success-soft text-success',
      warning: 'border-warning/25 bg-warning-soft text-warning',
      danger: 'border-danger/20 bg-danger-soft text-danger',
    },
  },
  defaultVariants: { tone: 'info' },
});

const ICONS: Record<NonNullable<VariantProps<typeof alertVariants>['tone']>, LucideIcon> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
};

export interface AlertProps extends VariantProps<typeof alertVariants> {
  title?: string;
  children?: ReactNode;
  className?: string;
}

/** Inline message banner. `danger` alerts are announced to screen readers. */
export function Alert({ tone = 'info', title, children, className }: AlertProps) {
  const Icon = ICONS[tone ?? 'info'];
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={cn(alertVariants({ tone }), className)}>
      <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0 space-y-0.5">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className="text-text/80">{children}</div>}
      </div>
    </div>
  );
}
