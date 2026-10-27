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

/**
 * First letter of the first two words, skipping punctuation: 'Ravi (counter)' → 'RC'.
 * Keeps combining marks with their letter so Tamil initials stay whole ('முருகேசன் பி' → 'முபி').
 */
export const getInitials = (name: string): string =>
  name
    .split(/\s+/)
    .map((part) => part.match(/\p{L}\p{M}*/u)?.[0])
    .filter((letter): letter is string => Boolean(letter))
    .slice(0, 2)
    .join('')
    .toUpperCase();

/** Initials avatar. One of the few places `rounded-full` is allowed. */
export function Avatar({ name, size, className }: AvatarProps) {
  return (
    <span aria-hidden="true" className={cn(avatarVariants({ size }), className)}>
      {getInitials(name)}
    </span>
  );
}
