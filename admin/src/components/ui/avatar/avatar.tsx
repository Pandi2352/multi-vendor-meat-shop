import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const avatarVariants = cva(
  'inline-flex shrink-0 select-none items-center justify-center rounded-full bg-primary-soft font-semibold text-primary',
  {
    variants: {
      size: {
        sm: 'h-7 w-7 text-[11px]',
        md: 'h-9 w-9 text-xs',
        lg: 'h-11 w-11 text-sm',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  name: string;
  className?: string;
}

export const getInitials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

/** Initials avatar. One of the few places `rounded-full` is allowed. */
export function Avatar({ name, size, className }: AvatarProps) {
  return (
    <span aria-hidden="true" className={cn(avatarVariants({ size }), className)}>
      {getInitials(name)}
    </span>
  );
}
