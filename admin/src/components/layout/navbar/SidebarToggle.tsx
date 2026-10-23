import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button, Tooltip } from '@/components/ui';

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
    <Tooltip content={label} side="bottom">
      <Button variant="ghost" size="icon" onClick={onToggle} aria-label={label} className="text-muted">
        <Icon className="h-5 w-5" strokeWidth={1.9} />
      </Button>
    </Tooltip>
  );
}
