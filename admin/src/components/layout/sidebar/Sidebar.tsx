import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useEscapeKey } from '@/hooks';
import { cn } from '@/lib/cn';
import { SidebarBrand } from './SidebarBrand';
import { SidebarFooter } from './SidebarFooter';
import { SidebarNav } from './SidebarNav';
import { SIDEBAR_WIDTH } from './sidebarStyles';

interface SidebarProps {
  /** Desktop preference: icon rail instead of full width. */
  collapsed: boolean;
  isDesktop: boolean;
  /** Mobile drawer state. */
  mobileOpen: boolean;
  onMobileClose: () => void;
}

/** Docked (and collapsible) on desktop, an off-canvas drawer below the `lg` breakpoint. */
export function Sidebar({ collapsed, isDesktop, mobileOpen, onMobileClose }: SidebarProps) {
  const { pathname } = useLocation();
  const isCollapsed = isDesktop && collapsed;
  const drawerOpen = !isDesktop && mobileOpen;

  useEffect(() => {
    onMobileClose();
  }, [pathname, onMobileClose]);
  useEscapeKey(onMobileClose, drawerOpen);

  return (
    <>
      {drawerOpen && (
        <button type="button" aria-label="Close menu" onClick={onMobileClose} className="fixed inset-0 z-40 bg-black/40" />
      )}
      <aside
        aria-label="Sidebar"
        inert={!isDesktop && !mobileOpen}
        className={cn(
          'z-50 flex h-dvh flex-col border-r border-border bg-surface',
          isDesktop
            ? cn('sticky top-0 shrink-0 self-start transition-[width] duration-200', isCollapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded)
            : cn('fixed inset-y-0 left-0 transition-transform duration-200', SIDEBAR_WIDTH.mobile, mobileOpen ? 'translate-x-0' : '-translate-x-full'),
        )}
      >
        <SidebarBrand collapsed={isCollapsed} onClose={isDesktop ? undefined : onMobileClose} />
        <SidebarNav collapsed={isCollapsed} />
        <SidebarFooter collapsed={isCollapsed} />
      </aside>
    </>
  );
}
