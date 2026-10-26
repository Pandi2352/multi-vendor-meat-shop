import {
  BadgeIndianRupee,
  ClipboardList,
  Gavel,
  LayoutDashboard,
  Package,
  ReceiptIndianRupee,
  Store,
  Truck,
  Users,
  Wallet,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';
import type { BadgeProps } from '@/components/ui';
import { ROUTES } from './routes';

export interface NavBadge {
  label: string;
  tone?: BadgeProps['tone'];
}

export interface NavLinkItem {
  type: 'link';
  label: string;
  to: string;
  icon: LucideIcon;
  /** Short helper text shown in search results. */
  description?: string;
  badge?: NavBadge;
  /** Page not built yet — routed to the "coming soon" screen. */
  soon?: boolean;
  /** Match the path exactly (needed for `/`). */
  end?: boolean;
}

export interface NavChildLink {
  label: string;
  to: string;
  description?: string;
  soon?: boolean;
}

export interface NavGroupItem {
  type: 'group';
  id: string;
  label: string;
  icon: LucideIcon;
  children: NavChildLink[];
}

export type NavItem = NavLinkItem | NavGroupItem;

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

/** Single source for the sidebar, breadcrumb and search. Add a page here and it appears everywhere. */
export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      {
        type: 'link',
        label: 'Dashboard',
        to: ROUTES.DASHBOARD,
        icon: LayoutDashboard,
        end: true,
        description: 'Marketplace health at a glance',
      },
    ],
  },
  {
    id: 'vendor',
    label: 'Shop operations',
    items: [
      {
        type: 'link',
        label: 'Orders',
        to: ROUTES.VENDOR_ORDERS,
        icon: ClipboardList,
        badge: { label: 'Live', tone: 'primary' },
        description: 'Accept, prepare and hand over orders',
      },
      {
        type: 'link',
        label: 'Inventory',
        to: ROUTES.VENDOR_INVENTORY,
        icon: Warehouse,
        description: 'Opening stock, wastage and movements',
      },
      {
        type: 'group',
        id: 'catalogue',
        label: 'Catalogue',
        icon: Package,
        children: [
          { label: 'Products', to: ROUTES.VENDOR_PRODUCTS, description: 'Cuts, prices and variants' },
          { label: 'Shop profile', to: ROUTES.VENDOR_SHOPS, description: 'Hours, slots and service area' },
          { label: 'Stall team', to: ROUTES.VENDOR_STAFF, description: 'Cutters, billing and staff' },
        ],
      },
      {
        type: 'link',
        label: 'Settlements',
        to: ROUTES.VENDOR_SETTLEMENTS,
        icon: ReceiptIndianRupee,
        description: 'Payouts and ledger entries',
      },
    ],
  },
  {
    id: 'delivery',
    label: 'Delivery',
    items: [
      {
        type: 'link',
        label: 'Delivery tasks',
        to: ROUTES.DELIVERY_TASKS,
        icon: Truck,
        description: 'Assign partners and verify OTP drop-offs',
      },
      { type: 'link', label: 'Earnings', to: ROUTES.DELIVERY_EARNINGS, icon: Wallet, soon: true },
    ],
  },
  {
    id: 'admin',
    label: 'Administration',
    items: [
      {
        type: 'link',
        label: 'Vendors',
        to: ROUTES.ADMIN_VENDORS,
        icon: Store,
        description: 'Verify shops and FSSAI documents',
      },
      {
        type: 'link',
        label: 'Users',
        to: ROUTES.ADMIN_USERS,
        icon: Users,
        description: 'Manage users, roles & permissions',
      },
      {
        type: 'link',
        label: 'Disputes',
        to: ROUTES.ADMIN_DISPUTES,
        icon: Gavel,
        description: 'Customer claims & refund arbitration',
      },
      {
        type: 'link',
        label: 'Finance',
        to: ROUTES.ADMIN_FINANCE,
        icon: BadgeIndianRupee,
        description: 'Platform commission & payouts',
      },
    ],
  },
];
