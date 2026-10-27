import { BadgeIndianRupee, ChevronRight, Gavel, Store, Truck, UserPlus, Zap, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Panel } from '@/components/ui';
import { canAccessPath } from '@/config/route-access';
import { ROUTES } from '@/config/routes';
import type { UserRole } from '@/constants/roles';

interface Shortcut {
  label: string;
  description: string;
  to: string;
  icon: LucideIcon;
}

const SHORTCUTS: Shortcut[] = [
  { label: 'Review shop applications', description: 'Check FSSAI and licence documents', to: ROUTES.ADMIN_VENDORS, icon: Store },
  { label: 'Assign deliveries', description: 'Give ready orders to a rider', to: ROUTES.DELIVERY_TASKS, icon: Truck },
  { label: 'Resolve disputes', description: 'Weight and quality claims', to: ROUTES.ADMIN_DISPUTES, icon: Gavel },
  { label: 'Settlements', description: 'Commission and shop payouts', to: ROUTES.ADMIN_FINANCE, icon: BadgeIndianRupee },
  { label: 'Invite a team member', description: 'Admins, operations, support, finance', to: ROUTES.ADMIN_USERS, icon: UserPlus },
];

/** The admin pages this role can open, as one-click shortcuts. */
export function AdminShortcuts({ role }: { role: UserRole }) {
  const shortcuts = SHORTCUTS.filter((shortcut) => canAccessPath(role, shortcut.to));
  if (shortcuts.length === 0) return null;

  return (
    <Panel title="Shortcuts" icon={Zap} flush>
      <ul className="divide-y divide-border">
        {shortcuts.map(({ label, description, to, icon: Icon }) => (
          <li key={to}>
            <Link to={to} className="group flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-muted/60">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface-muted text-muted">
                <Icon aria-hidden="true" className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-text">{label}</span>
                <span className="block truncate text-xs text-muted">{description}</span>
              </span>
              <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
