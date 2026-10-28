import { Wallet, CheckCircle2, TrendingUp, HandCoins, AlertCircle } from 'lucide-react';
import { formatINR, formatDateIST } from '@/utils/format';
import { useDeliveryEarnings } from '../api/use-delivery';

export function DeliveryEarningsPage() {
  const { data: earnings, isLoading, error } = useDeliveryEarnings({ refetchInterval: 10000 });

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-text flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" /> Delivery Earnings & COD
        </h1>
        <p className="text-xs text-muted mt-0.5">
          Trip pay (₹40 per delivered parcel) and cash collected to deposit
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-xs text-muted">Loading rider earnings summary...</div>
      ) : error || !earnings ? (
        <div className="text-center py-16 text-xs text-danger flex items-center justify-center gap-1.5">
          <AlertCircle className="h-4 w-4" /> Could not load rider earnings.
        </div>
      ) : (
        <>
          {/* KPI Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-md border border-border bg-surface p-5 space-y-1">
              <div className="flex items-center justify-between text-muted text-xs">
                <span className="font-semibold uppercase tracking-wider">Today's Trip Pay</span>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-bold font-mono text-primary">
                {formatINR(earnings.todayEarningsPaise)}
              </div>
              <p className="text-xs text-muted">
                {earnings.todayTripsCount} deliveries completed today
              </p>
            </div>

            <div className="rounded-md border border-warning/40 bg-warning-soft p-5 space-y-1">
              <div className="flex items-center justify-between text-warning text-xs">
                <span className="font-semibold uppercase tracking-wider">COD Cash in Hand</span>
                <HandCoins className="h-4 w-4 text-warning" />
              </div>
              <div className="text-2xl font-bold font-mono text-warning">
                {formatINR(earnings.cashInHandPaise)}
              </div>
              <p className="text-xs text-warning/90">
                Deposit cash collected with stall manager or operations hub
              </p>
            </div>

            <div className="rounded-md border border-border bg-surface p-5 space-y-1">
              <div className="flex items-center justify-between text-muted text-xs">
                <span className="font-semibold uppercase tracking-wider">All-Time Deliveries</span>
                <CheckCircle2 className="h-4 w-4 text-success" />
              </div>
              <div className="text-2xl font-bold font-mono text-text">
                {earnings.completedTripsCount} Trips
              </div>
              <p className="text-xs text-muted">Lifetime orders verified and completed</p>
            </div>

            <div className="rounded-md border border-border bg-surface p-5 space-y-1">
              <div className="flex items-center justify-between text-muted text-xs">
                <span className="font-semibold uppercase tracking-wider">All-Time Net Trip Pay</span>
                <Wallet className="h-4 w-4 text-text" />
              </div>
              <div className="text-2xl font-bold font-mono text-text">
                {formatINR(earnings.totalEarningsPaise)}
              </div>
              <p className="text-xs text-muted">₹40 fixed commission per delivered trip</p>
            </div>
          </div>

          {/* Recent Trips List */}
          <div className="rounded-md border border-border bg-surface p-5 space-y-4">
            <h2 className="text-sm font-bold text-text">Recent Completed Trips</h2>

            {earnings.recentTrips.length === 0 ? (
              <p className="text-xs text-muted py-6 text-center">No completed delivery trips recorded yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {earnings.recentTrips.map((trip) => (
                  <div key={trip.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-text">{trip.orderNumber}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-medium">
                          {trip.shopName}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        {trip.deliveredAt ? formatDateIST(trip.deliveredAt) : formatDateIST(trip.createdAt)}
                        {trip.codCollected && trip.codAmountPaise > 0
                          ? ` • COD: ${formatINR(trip.codAmountPaise)} collected`
                          : ''}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-success font-mono">+₹40.00</span>
                      <span className="text-[11px] text-muted block">Trip pay</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
