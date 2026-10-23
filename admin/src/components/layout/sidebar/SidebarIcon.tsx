import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface SidebarIconProps {
  icon: LucideIcon;
  active?: boolean;
  className?: string;
}

export function SidebarIcon({ icon: Icon, active, className }: SidebarIconProps) {
  return (
    <Icon
      aria-hidden="true"
      strokeWidth={1.9}
      className={cn(
        'h-[1.125rem] w-[1.125rem] shrink-0 transition-colors',
        active ? 'text-primary' : 'text-muted group-hover:text-text',
        className,
      )}
    />
  );
}
