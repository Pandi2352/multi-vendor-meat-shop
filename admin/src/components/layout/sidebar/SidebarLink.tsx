import { NavLink } from 'react-router-dom';
import { Badge } from '@/components/ui';
import type { NavLinkItem } from '@/config/nav.config';
import { cn } from '@/lib/cn';
import { SidebarFlyout } from './SidebarFlyout';
import { SidebarIcon } from './SidebarIcon';
import { sidebarActiveIndicator, sidebarLinkVariants } from './sidebarStyles';

interface SidebarLinkProps {
  item: Pick<NavLinkItem, 'label' | 'to' | 'icon' | 'badge' | 'soon' | 'end'>;
  collapsed: boolean;
}

export function SidebarLink({ item, collapsed }: SidebarLinkProps) {
  const badge = item.soon ? { label: 'Soon', tone: 'neutral' as const } : item.badge;

  return (
    <SidebarFlyout enabled={collapsed} title={item.label}>
      <NavLink
        to={item.to}
        end={item.end}
        aria-label={collapsed ? item.label : undefined}
        className={({ isActive }) => sidebarLinkVariants({ active: isActive, collapsed })}
      >
        {({ isActive }) => (
          <>
            {isActive && !collapsed && <span aria-hidden="true" className={sidebarActiveIndicator} />}
            <SidebarIcon icon={item.icon} active={isActive} />
            {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
            {!collapsed && badge && (
              <Badge size="sm" tone={badge.tone} dot={badge.tone === 'primary'}>
                {badge.label}
              </Badge>
            )}
            {collapsed && item.badge && !item.soon && (
              <span
                aria-hidden="true"
                className={cn('absolute right-3.5 top-2 h-1.5 w-1.5 rounded-full bg-primary')}
              />
            )}
          </>
        )}
      </NavLink>
    </SidebarFlyout>
  );
}
