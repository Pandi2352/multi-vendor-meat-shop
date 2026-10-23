---
name: react-ui
description: Use when building or changing a UI primitive, domain display component or layout in public/ or admin/. Enforces rounded-md everywhere, zero shadows, theme tokens only, cva variants, cn() merging and small single-purpose files.
---

# React UI components

## Visual rules
- Radius: `rounded-md` on every surface, input, button, card, menu, modal, badge, image.
  Only `rounded-full` for avatars, status dots, spinners. Nothing else.
- **No shadows at all.** Elevation = `border border-border` + a different surface token (`bg-surface`, `bg-surface-muted`).
  Overlays (modal, dropdown, popover) use `border` + backdrop `bg-black/40`, still no shadow.
- Colors from tokens only: `bg-background`, `bg-surface`, `text-text`, `text-muted`, `border-border`, `bg-primary text-primary-foreground`, `text-danger`, `bg-success-soft`. No `bg-red-500`, no hex.
- Focus: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2`.
- Tap targets ≥ 44px on mobile (`h-11` for primary actions).

## Theme (`src/styles/theme.css`) — enforcement lives here
```css
@import "tailwindcss";

@theme {
  --radius-*: initial;
  --radius-md: 0.375rem;

  --shadow-*: initial;
  --inset-shadow-*: initial;
  --drop-shadow-*: initial;
  --text-shadow-*: initial;

  --color-background: #fafaf9;
  --color-surface: #ffffff;
  --color-surface-muted: #f5f5f4;
  --color-border: #e7e5e4;
  --color-text: #1c1917;
  --color-muted: #57534e;
  --color-primary: #b91c1c;
  --color-primary-foreground: #ffffff;
  --color-success: #15803d;
  --color-success-soft: #dcfce7;
  --color-warning: #b45309;
  --color-warning-soft: #fef3c7;
  --color-danger: #b91c1c;
  --color-danger-soft: #fee2e2;
  --color-info: #1d4ed8;
  --color-info-soft: #dbeafe;

  --font-sans: "Inter", "Noto Sans Tamil", ui-sans-serif, system-ui, sans-serif;
}
```
Dark mode overrides go in the same file under a `.dark` / `prefers-color-scheme` block that redefines the same variables.

## Component pattern
```tsx
// components/ui/button/button.variants.ts
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-surface-muted text-text hover:bg-border',
        outline: 'border border-border bg-surface text-text hover:bg-surface-muted',
        ghost: 'text-text hover:bg-surface-muted',
        danger: 'bg-danger text-white hover:bg-danger/90',
      },
      size: { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4 text-sm', lg: 'h-11 px-5 text-base' },
      fullWidth: { true: 'w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

// components/ui/button/button.tsx
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { loading?: boolean; leftIcon?: ReactNode; rightIcon?: ReactNode };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size, fullWidth }), className)} disabled={disabled || loading} {...props}>
      {loading ? <Spinner size="sm" /> : leftIcon}
      {children}
      {rightIcon}
    </button>
  ),
);

// components/ui/button/index.ts
export * from './button';
export * from './button.variants';
```

## File rules
- One folder per primitive: `<name>.tsx`, `<name>.variants.ts`, `<name>.types.ts` (if props are large), `index.ts`, optional `<name>.test.tsx`.
- Compound components split per part (`card.tsx`, `card-header.tsx`, `card-body.tsx`).
- ≤150 lines per component file.
- `forwardRef` + spread rest props for every primitive; accept `className` and merge with `cn()`.
- Headless behaviour (dialog, menu, popover, tooltip, combobox) from Radix UI or Headless UI, styled by us.
- Icons only via `components/ui/icon`.
- No data fetching, no stores, no i18n keys hard-coded inside `components/ui` — text comes in through props.
- Export from `components/ui/index.ts`.

## States every interactive/data component handles
default · hover · focus-visible · active · disabled · loading · error · empty (for lists).

## Before finishing
Run `bash scripts/check-rules.sh` — it fails on any `shadow-*` or non-md radius class.
