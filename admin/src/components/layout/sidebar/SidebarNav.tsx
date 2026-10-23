import { NAV_SECTIONS } from '@/config/nav.config';
import { cn } from '@/lib/cn';
import { SidebarSection } from './SidebarSection';

export function SidebarNav({ collapsed }: { collapsed: boolean }) {
  return (
    <nav
      aria-label="Main"
      className={cn('flex-1 overflow-y-auto overscroll-contain py-2', collapsed ? 'px-2.5' : 'px-3')}
    >
      {NAV_SECTIONS.map((section, index) => (
        <SidebarSection key={section.id} section={section} collapsed={collapsed} isFirst={index === 0} />
      ))}
    </nav>
  );
}
