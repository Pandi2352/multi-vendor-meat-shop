import type { NavSection } from '@/config/nav.config';
import { SidebarGroup } from './SidebarGroup';
import { SidebarLink } from './SidebarLink';
import { sidebarSectionLabel } from './sidebarStyles';

interface SidebarSectionProps {
  section: NavSection;
  collapsed: boolean;
  isFirst: boolean;
}

export function SidebarSection({ section, collapsed, isFirst }: SidebarSectionProps) {
  return (
    <section aria-label={section.label}>
      {collapsed ? (
        !isFirst && <div aria-hidden="true" className="mx-3 my-3 h-px bg-border" />
      ) : (
        <h3 className={sidebarSectionLabel}>{section.label}</h3>
      )}
      <ul className="flex flex-col gap-0.5">
        {section.items.map((item) => (
          <li key={item.type === 'link' ? item.to : item.id}>
            {item.type === 'link' ? (
              <SidebarLink item={item} collapsed={collapsed} />
            ) : (
              <SidebarGroup item={item} collapsed={collapsed} />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
