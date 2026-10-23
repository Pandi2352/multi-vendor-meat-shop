import { useEffect, useId, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui';
import type { NavChildLink, NavGroupItem } from '@/config/nav.config';
import { isPathActive } from '@/config/nav.utils';
import { cn } from '@/lib/cn';
import { SidebarFlyout } from './SidebarFlyout';
import { SidebarIcon } from './SidebarIcon';
import { sidebarChildLinkVariants, sidebarLinkVariants } from './sidebarStyles';

interface SidebarGroupProps {
  item: NavGroupItem;
  collapsed: boolean;
}

function ChildLinks({ items }: { items: NavChildLink[] }) {
  return (
    <>
      {items.map((child) => (
        <NavLink key={child.to} to={child.to} className={({ isActive }) => sidebarChildLinkVariants({ active: isActive })}>
          <span className="truncate">{child.label}</span>
          {child.soon && <Badge size="sm">Soon</Badge>}
        </NavLink>
      ))}
    </>
  );
}

/** Expandable group in the full sidebar; an icon with a flyout of its links when collapsed. */
export function SidebarGroup({ item, collapsed }: SidebarGroupProps) {
  const { pathname } = useLocation();
  const panelId = useId();
  const childActive = item.children.some((child) => isPathActive(child.to, pathname));
  const [open, setOpen] = useState(childActive);

  useEffect(() => {
    if (childActive) setOpen(true);
  }, [childActive]);

  if (collapsed) {
    return (
      <SidebarFlyout
        enabled
        title={item.label}
        content={
          <div className="flex flex-col gap-0.5">
            <ChildLinks items={item.children} />
          </div>
        }
      >
        <button
          type="button"
          aria-label={item.label}
          className={sidebarLinkVariants({ active: childActive, collapsed: true })}
        >
          <SidebarIcon icon={item.icon} active={childActive} />
        </button>
      </SidebarFlyout>
    );
  }

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={cn(sidebarLinkVariants({ active: false }), childActive && 'text-text')}
      >
        <SidebarIcon icon={item.icon} active={childActive} />
        <span className="flex-1 truncate text-left">{item.label}</span>
        <ChevronRight
          aria-hidden="true"
          className={cn('h-4 w-4 shrink-0 text-muted transition-transform duration-200', open && 'rotate-90')}
        />
      </button>
      {open && (
        <div id={panelId} className="ml-[21px] mt-0.5 flex flex-col gap-0.5 border-l border-border py-0.5 pl-3">
          <ChildLinks items={item.children} />
        </div>
      )}
    </div>
  );
}
