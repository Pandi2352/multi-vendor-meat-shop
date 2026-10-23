import {
  ShieldCheck,
  Store,
  Truck,
  DollarSign,
  TrendingUp,
  AlertCircle,
  PackageCheck,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui';

interface DashboardPageProps {
  onOpenVendorOrders: () => void;
}

export function DashboardPage({ onOpenVendorOrders }: DashboardPageProps) {
  return (
    <div className="space-y-8">
      {/* Welcome & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-text mb-1">
            Marketplace Control Center
          </h2>
          <p className="text-sm text-muted">
            Real-time oversight for vendor onboarding, daily cut inventory, variable weight fulfilment and delivery.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={onOpenVendorOrders} leftIcon={<Flame className="h-4 w-4" />}>
          Live Prep Queue
        </Button>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Pending Verifications',
            val: '6 shops',
            sub: 'FSSAI & licence check',
            icon: ShieldCheck,
            color: 'text-warning',
          },
          {
            title: 'Active Butcher Shops',
            val: '42 live',
            sub: 'Across 5 districts',
            icon: Store,
            color: 'text-primary',
          },
          {
            title: 'Active Deliveries',
            val: '18 in transit',
            sub: 'Avg ETA: 24 mins',
            icon: Truck,
            color: 'text-info',
          },
          {
            title: 'Today GMV',
            val: '₹1,42,850',
            sub: 'Ledger reconcilable',
            icon: DollarSign,
            color: 'text-success',
          },
        ].map((stat) => (
          <div key={stat.title} className="rounded-md border border-border bg-surface p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted">{stat.title}</span>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-text mb-1">{stat.val}</div>
            <div className="text-xs text-muted">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Role Portals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendor Management */}
        <div className="rounded-md border border-border bg-surface p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-md border border-border bg-surface-muted flex items-center justify-center">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-text text-sm">Vendor Operations</h3>
              <p className="text-xs text-muted">Catalogue, stock & cut preparation</p>
            </div>
          </div>
          <p className="text-xs text-muted mb-5 leading-relaxed">
            Manage daily opening stock in grams, track preparation queue, and record actual packed weights with ±10% threshold.
          </p>
          <div className="space-y-2">
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={onOpenVendorOrders}
              leftIcon={<Flame className="h-4 w-4" />}
            >
              Live Preparation Queue
            </Button>
            <Button variant="outline" size="sm" fullWidth leftIcon={<PackageCheck className="h-4 w-4" />}>
              Daily Stock Ledger
            </Button>
            <Button variant="secondary" size="sm" fullWidth leftIcon={<TrendingUp className="h-4 w-4" />}>
              Settlements & Payouts
            </Button>
          </div>
        </div>

        {/* Delivery Fleet */}
        <div className="rounded-md border border-border bg-surface p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-md border border-border bg-surface-muted flex items-center justify-center">
              <Truck className="h-5 w-5 text-info" />
            </div>
            <div>
              <h3 className="font-semibold text-text text-sm">Delivery Orchestration</h3>
              <p className="text-xs text-muted">Task dispatch & OTP verification</p>
            </div>
          </div>
          <p className="text-xs text-muted mb-5 leading-relaxed">
            Dispatch tasks within hyper-local service zones, verify pickups at shops, and enforce OTP proof of delivery.
          </p>
          <div className="space-y-2">
            <Button variant="outline" size="sm" fullWidth leftIcon={<Truck className="h-4 w-4" />}>
              Active Task Queue
            </Button>
            <Button variant="secondary" size="sm" fullWidth>
              Delivery Partner Roster
            </Button>
          </div>
        </div>

        {/* Admin Governance */}
        <div className="rounded-md border border-border bg-surface p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-md border border-border bg-surface-muted flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-text text-sm">Governance & Compliance</h3>
              <p className="text-xs text-muted">Licences, commission & disputes</p>
            </div>
          </div>
          <p className="text-xs text-muted mb-5 leading-relaxed">
            Audit shop documents, configure platform commission bps, resolve customer weight variance disputes, and review audit logs.
          </p>
          <div className="space-y-2">
            <Button variant="outline" size="sm" fullWidth leftIcon={<AlertCircle className="h-4 w-4" />}>
              Vendor Approvals
            </Button>
            <Button variant="secondary" size="sm" fullWidth>
              Audit Trail & Reports
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
