import { Button, MenuLinesIcon, Tooltip } from '@/components/ui';

interface SidebarToggleProps {
  collapsed: boolean;
  isDesktop: boolean;
  onToggle: () => void;
}

/** Collapses the docked sidebar on desktop; opens the drawer on smaller screens. */
export function SidebarToggle({ collapsed, isDesktop, onToggle }: SidebarToggleProps) {
  const label = isDesktop ? (collapsed ? 'Expand sidebar' : 'Collapse sidebar') : 'Open menu';

  return (
    <Tooltip content={label} side="bottom">
      <Button variant="ghost" size="icon" onClick={onToggle} aria-label={label} className="text-text">
        <MenuLinesIcon className="h-5 w-5" />
      </Button>
    </Tooltip>
  );
}
