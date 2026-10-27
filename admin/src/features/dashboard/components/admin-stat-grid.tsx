import { BadgeIndianRupee, ClipboardList, Gavel, HandCoins, ShieldCheck, Store, Truck } from 'lucide-react';
import { StatCard, type StatCardProps } from '@/components/ui';
import { canAccessPath } from '@/config/route-access';
import { ROUTES } from '@/config/routes';
import type { UserRole } from '@/constants/roles';
import { formatINR, formatNumber } from '@/utils/format';
import type { AdminDashboard } from '../api/dashboard.api';

type Card = StatCardProps & { key: string };

/** Headline numbers for the admin team. Cards link only to pages the viewer's role can open. */
export function AdminStatGrid({ data, role }: { data: AdminDashboard; role: UserRole }) {
  const linkIfAllowed = (path: string) => (canAccessPath(role, path) ? path : undefined);
  const { vendors, shops, orders, delivery, money } = data;

  const cards: Card[] = [
    {
      key: 'review',
      label: 'Shops to review',
      value: formatNumber(vendors.awaitingReview),
      hint:
        vendors.resubmissionRequired > 0
          ? `${formatNumber(vendors.resubmissionRequired)} waiting on the vendor`
          : 'New applications',
      icon: ShieldCheck,
      tone: 'warning',
      attention: vendors.awaitingReview > 0,
      to: linkIfAllowed(ROUTES.ADMIN_VENDORS),
    },
    {
      key: 'shops',
      label: 'Shops open now',
      value: `${formatNumber(shops.open)} / ${formatNumber(shops.total)}`,
      hint: vendors.suspended > 0 ? `${formatNumber(vendors.suspended)} suspended` : 'Taking orders',
      icon: Store,
      tone: 'primary',
      to: linkIfAllowed(ROUTES.ADMIN_VENDORS),
    },
    {
      key: 'orders',
      label: 'Orders today',
      value: formatNumber(orders.today),
      hint: `${formatNumber(orders.inProgress)} in progress · ${formatNumber(orders.awaitingAcceptance)} not yet accepted`,
      icon: ClipboardList,
      tone: 'info',
    },
    {
      key: 'delivery',
      label: 'Deliveries without a rider',
      value: formatNumber(delivery.unassigned),
      hint: `${formatNumber(delivery.inTransit)} on the way`,
      icon: Truck,
      tone: 'warning',
      attention: delivery.unassigned > 0,
      to: linkIfAllowed(ROUTES.DELIVERY_TASKS),
    },
    {
      key: 'disputes',
      label: 'Open disputes',
      value: formatNumber(data.openDisputes),
      hint: 'Open or under review',
      icon: Gavel,
      tone: 'danger',
      attention: data.openDisputes > 0,
      to: linkIfAllowed(ROUTES.ADMIN_DISPUTES),
    },
  ];

  if (money) {
    cards.push(
      {
        key: 'sales',
        label: 'Order value today',
        value: formatINR(money.salesTodayPaise),
        hint: 'Excludes cancelled and rejected',
        icon: BadgeIndianRupee,
        tone: 'success',
        to: linkIfAllowed(ROUTES.ADMIN_FINANCE),
      },
      {
        key: 'payouts',
        label: 'Owed to shops',
        value: formatINR(money.pendingPayoutsPaise),
        hint: 'Delivered, not yet settled',
        icon: HandCoins,
        tone: 'neutral',
        to: linkIfAllowed(ROUTES.ADMIN_FINANCE),
      },
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, ...card }) => (
        <StatCard key={key} {...card} />
      ))}
    </div>
  );
}
