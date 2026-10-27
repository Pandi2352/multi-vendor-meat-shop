import { cva } from 'class-variance-authority';

export const statCardIconVariants = cva('flex h-8 w-8 shrink-0 items-center justify-center rounded-md', {
  variants: {
    tone: {
      neutral: 'bg-surface-muted text-muted',
      primary: 'bg-primary/10 text-primary',
      success: 'bg-success-soft text-success',
      warning: 'bg-warning-soft text-warning',
      danger: 'bg-danger-soft text-danger',
      info: 'bg-info-soft text-info',
    },
  },
  defaultVariants: { tone: 'neutral' },
});
