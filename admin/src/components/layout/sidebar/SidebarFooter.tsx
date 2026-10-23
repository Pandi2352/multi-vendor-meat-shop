import { CircleHelp, MapPin } from 'lucide-react';
import { APP_CONFIG } from '@/config/app.config';
import { ROUTES } from '@/config/routes';
import { SidebarLink } from './SidebarLink';

export function SidebarFooter({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={collapsed ? 'border-t border-border p-2.5' : 'border-t border-border p-3'}>
      <SidebarLink item={{ label: 'Help & support', to: ROUTES.SUPPORT, icon: CircleHelp }} collapsed={collapsed} />
      {!collapsed && (
        <div className="mt-2 flex items-center justify-between gap-2 rounded-md bg-surface-muted px-3 py-2 text-xs text-muted">
          <span className="flex min-w-0 items-center gap-1.5">
            <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{APP_CONFIG.regionLabel}</span>
          </span>
          <span className="shrink-0 tabular-nums">v{APP_CONFIG.version}</span>
        </div>
      )}
    </div>
  );
}
