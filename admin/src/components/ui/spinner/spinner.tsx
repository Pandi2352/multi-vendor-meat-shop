import { cn } from '@/lib/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-2',
};

export const Spinner = ({ size = 'md', className }: SpinnerProps) => (
  <div
    role="status"
    aria-label="Loading"
    className={cn(
      'animate-spin rounded-full border-primary border-t-transparent',
      sizeClasses[size],
      className,
    )}
  />
);
