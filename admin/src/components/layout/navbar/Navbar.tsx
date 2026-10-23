import { ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { findNavEntry } from '@/config/nav.utils';
import { NotificationsMenu } from './NotificationsMenu';
import { QuickCreateMenu } from './QuickCreateMenu';
import { SearchTrigger } from './SearchTrigger';
import { SidebarToggle } from './SidebarToggle';
import { UserMenu } from './UserMenu';

interface NavbarProps {
  collapsed: boolean;
  isDesktop: boolean;
  onToggleSidebar: () => void;
}

export function Navbar({ collapsed, isDesktop, onToggleSidebar }: NavbarProps) {
  const { pathname } = useLocation();
  const current = findNavEntry(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-surface/90 px-3 backdrop-blur sm:px-4 lg:px-6">
      <SidebarToggle collapsed={collapsed} isDesktop={isDesktop} onToggle={onToggleSidebar} />

      {current && (
        <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-sm md:flex">
          <span className="truncate text-muted">{current.group ?? current.section}</span>
          <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-muted/60" />
          <span aria-current="page" className="truncate font-medium text-text">
            {current.label}
          </span>
        </nav>
      )}

      <div className="ml-auto flex flex-1 items-center justify-end gap-1.5 sm:gap-2">
        <SearchTrigger />
        <QuickCreateMenu />
        <NotificationsMenu />
        <span aria-hidden="true" className="mx-1 hidden h-6 w-px bg-border sm:block" />
        <UserMenu />
      </div>
    </header>
  );
}
