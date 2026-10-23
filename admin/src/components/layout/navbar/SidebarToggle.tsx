import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui';

interface SidebarToggleProps {
  collapsed: boolean;
  isDesktop: boolean;
  onToggle: () => void;
}

/** Collapses the docked sidebar on desktop; opens the drawer on smaller screens. */
export function SidebarToggle({ collapsed, isDesktop, onToggle }: SidebarToggleProps) {
  const label = isDesktop ? (collapsed ? 'Expand sidebar' : 'Collapse sidebar') : 'Open menu';
  const Icon = isDesktop ? (collapsed ? PanelLeftOpen : PanelLeftClose) : Menu;

  return (
    <Button variant="ghost" size="icon" onClick={onToggle} aria-label={label} title={label} className="text-muted">
      <Icon className="h-5 w-5" strokeWidth={1.9} />
    </Button>
  );
}
