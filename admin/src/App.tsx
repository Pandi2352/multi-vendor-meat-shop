import { QueryClientProvider } from '@tanstack/react-query';
import {
  ShieldCheck,
  Store,
  Truck,
  DollarSign,
  TrendingUp,
  AlertCircle,
  PackageCheck,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { queryClient } from '@/lib/query-client';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Top Header */}
        <header className="border-b border-border bg-surface sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
                TN
              </div>
              <div>
                <h1 className="text-sm font-semibold leading-tight text-text">
                  TN Meat Marketplace — Operations Portal
                </h1>
                <p className="text-xs text-muted">Admin • Vendor Hub • Delivery Fleet</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-success-soft text-success text-xs font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
                Systems Operational
              </span>
              <Button variant="outline" size="sm">
                Documentation
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Workspace */}
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
          {/* Welcome & Overview */}
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-text mb-1">
              Marketplace Control Center
            </h2>
            <p className="text-sm text-muted">
              Real-time oversight for vendor onboarding, daily cut inventory, variable weight fulfilment and delivery.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
              <div
                key={stat.title}
                className="rounded-md border border-border bg-surface p-5"
              >
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
                Manage daily opening stock in grams, update prices in paise, track preparation queue, and record actual packed weights.
              </p>
              <div className="space-y-2">
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
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-surface py-5 mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
            <p>© 2026 Tamil Nadu Meat Marketplace — Operations Hub</p>
            <p>API v1 connected • UUID v7 ids • Integer paise/grams precision</p>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}

export default App;
