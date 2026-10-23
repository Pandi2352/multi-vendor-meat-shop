import { cva } from 'class-variance-authority';

/** Shared sizing so the sidebar, its skeleton and anything aligned to it stay in sync. */
export const SIDEBAR_WIDTH = {
  expanded: 'w-64',
  collapsed: 'w-[72px]',
  mobile: 'w-72',
} as const;

export const sidebarLinkVariants = cva(
  [
    'group relative flex h-9 w-full items-center gap-3 rounded-md text-sm transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
  ],
  {
    variants: {
      active: {
        true: 'bg-primary-soft font-medium text-primary',
        false: 'text-muted hover:bg-surface-muted hover:text-text',
      },
      collapsed: {
        true: 'justify-center px-0',
        false: 'px-3',
      },
    },
    defaultVariants: { active: false, collapsed: false },
  },
);

export const sidebarChildLinkVariants = cva(
  [
    'flex h-8 items-center justify-between gap-2 rounded-md px-3 text-[13px] transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
  ],
  {
    variants: {
      active: {
        true: 'bg-primary-soft font-medium text-primary',
        false: 'text-muted hover:bg-surface-muted hover:text-text',
      },
    },
    defaultVariants: { active: false },
  },
);

/** Thin bar on the left edge of the active link (expanded sidebar only). */
export const sidebarActiveIndicator = 'absolute inset-y-1.5 left-0 w-[3px] rounded-md bg-primary';

export const sidebarSectionLabel =
  'px-3 pb-1.5 pt-5 text-[11px] font-semibold uppercase tracking-wider text-muted/70 first:pt-2';

export const sidebarFlyoutPanel = 'fixed z-50 min-w-48 rounded-md border border-border bg-surface p-1';

export const sidebarFlyoutTitle = 'px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted';
