import { cn } from '@/lib/cn';
import { useVisibleNav } from '../use-visible-nav';
import { SidebarSection } from './SidebarSection';

export function SidebarNav({ collapsed }: { collapsed: boolean }) {
  const sections = useVisibleNav();
  return (
    <nav
      aria-label="Main"
      className={cn('scrollbar-subtle flex-1 overflow-y-auto overscroll-contain py-2', collapsed ? 'px-2.5' : 'px-3')}
    >
      {sections.map((section, index) => (
        <SidebarSection key={section.id} section={section} collapsed={collapsed} isFirst={index === 0} />
      ))}
    </nav>
  );
}
