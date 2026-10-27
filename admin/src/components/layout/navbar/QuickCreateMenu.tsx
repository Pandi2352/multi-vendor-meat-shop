import { Package, Plus, Store, Truck, Warehouse, type LucideIcon } from 'lucide-react';
import { Badge, Button, Dropdown, DropdownItem, DropdownLabel } from '@/components/ui';
import { canAccessPath } from '@/config/route-access';
import { ROUTES } from '@/config/routes';
import type { Permission } from '@/constants/permissions';
import { useCurrentUser, usePermissionCheck } from '@/features/auth';

interface QuickAction {
  label: string;
  description: string;
  to: string;
  icon: LucideIcon;
  soon?: boolean;
  /** Also needed to do the action (the page itself may be open to more people). */
  permission?: Permission;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'Record opening stock',
    description: "Start today's stock count",
    to: ROUTES.VENDOR_INVENTORY,
    icon: Warehouse,
    permission: 'inventory.manage',
  },
  {
    label: 'Assign a delivery',
    description: 'Hand a ready order to a partner',
    to: ROUTES.DELIVERY_TASKS,
    icon: Truck,
  },
  {
    label: 'Add product',
    description: 'New cut with price per kg',
    to: ROUTES.VENDOR_PRODUCTS,
    icon: Package,
    permission: 'product.manage',
  },
  { label: 'Onboard vendor', description: 'Register a new meat shop', to: ROUTES.ADMIN_VENDORS, icon: Store },
];

export function QuickCreateMenu() {
  const role = useCurrentUser()?.role;
  const can = usePermissionCheck();
  const actions = role
    ? QUICK_ACTIONS.filter((action) => canAccessPath(role, action.to) && (!action.permission || can(action.permission)))
    : [];
  if (actions.length === 0) return null;

  return (
    <Dropdown
      trigger={({ triggerProps }) => (
        <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} className="max-sm:w-9 max-sm:px-0" {...triggerProps}>
          <span className="max-sm:sr-only">Create</span>
        </Button>
      )}
    >
      <DropdownLabel>Quick actions</DropdownLabel>
      {actions.map((action) => (
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
