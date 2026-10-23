import { Beef, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { APP_CONFIG } from '@/config/app.config';
import { ROUTES } from '@/config/routes';
import { cn } from '@/lib/cn';

interface SidebarBrandProps {
  collapsed: boolean;
  /** Shown in the mobile drawer. */
  onClose?: () => void;
}

export function SidebarBrand({ collapsed, onClose }: SidebarBrandProps) {
  return (
    <div className={cn('flex h-16 shrink-0 items-center gap-3 border-b border-border', collapsed ? 'justify-center px-2' : 'px-4')}>
      <Link
        to={ROUTES.DASHBOARD}
        aria-label={`${APP_CONFIG.brandName} home`}
        className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Beef aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
        </span>
        {!collapsed && (
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold leading-5 text-text">{APP_CONFIG.brandName}</span>
            <span className="block truncate text-xs leading-4 text-muted">{APP_CONFIG.brandTagline}</span>
          </span>
        )}
      </Link>
      {onClose && (
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close menu" className="ml-auto">
          <X className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
