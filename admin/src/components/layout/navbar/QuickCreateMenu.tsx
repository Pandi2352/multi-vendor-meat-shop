import { Package, Plus, Store, Truck, Warehouse, type LucideIcon } from 'lucide-react';
import { Badge, Button, Dropdown, DropdownItem, DropdownLabel } from '@/components/ui';
import { ROUTES } from '@/config/routes';

interface QuickAction {
  label: string;
  description: string;
  to: string;
  icon: LucideIcon;
  soon?: boolean;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'Record opening stock',
    description: "Start today's stock count",
    to: ROUTES.VENDOR_INVENTORY,
    icon: Warehouse,
  },
  {
    label: 'Assign a delivery',
    description: 'Hand a ready order to a partner',
    to: ROUTES.DELIVERY_TASKS,
    icon: Truck,
  },
  { label: 'Add product', description: 'New cut with price per kg', to: ROUTES.VENDOR_PRODUCTS, icon: Package, soon: true },
  { label: 'Onboard vendor', description: 'Register a new meat shop', to: ROUTES.ADMIN_VENDORS, icon: Store, soon: true },
];

export function QuickCreateMenu() {
  return (
    <Dropdown
      trigger={({ triggerProps }) => (
        <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} className="max-sm:w-9 max-sm:px-0" {...triggerProps}>
          <span className="max-sm:sr-only">Create</span>
        </Button>
      )}
    >
      <DropdownLabel>Quick actions</DropdownLabel>
      {QUICK_ACTIONS.map((action) => (
        <DropdownItem
          key={action.label}
          to={action.to}
          label={action.label}
          description={action.description}
          icon={<action.icon className="h-4 w-4" />}
          trailing={action.soon ? <Badge size="sm">Soon</Badge> : undefined}
        />
      ))}
    </Dropdown>
  );
}
