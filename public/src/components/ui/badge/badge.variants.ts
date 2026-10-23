import { cva } from 'class-variance-authority';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-medium border border-border transition-colors',
  {
    variants: {
      tone: {
        neutral: 'bg-surface-muted text-muted',
        primary: 'bg-primary/10 text-primary border-primary/20',
        success: 'bg-success-soft text-success border-success/20',
        warning: 'bg-warning-soft text-warning border-warning/20',
        danger: 'bg-danger-soft text-danger border-danger/20',
        info: 'bg-info-soft text-info border-info/20',
      },
      size: {
        sm: 'px-2 py-0.5 text-[11px]',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      tone: 'neutral',
      size: 'md',
    },
  },
);
