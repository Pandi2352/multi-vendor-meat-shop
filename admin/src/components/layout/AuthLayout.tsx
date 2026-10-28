import { Beef, ClipboardList, ReceiptIndianRupee, ShieldCheck, Warehouse, type LucideIcon } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { APP_CONFIG } from '@/config/app.config';

import { OfflineBanner } from './offline-banner';
import { ScrollToTop } from './scroll-to-top';

const HIGHLIGHTS: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: ClipboardList, title: 'Live preparation queue', body: 'Accept, cut and hand over orders on time.' },
  { icon: Warehouse, title: 'Fresh stock in grams', body: 'Opening stock, wastage and every movement logged.' },
  { icon: ReceiptIndianRupee, title: 'Payouts you can trust', body: 'Commission and settlements, entry by entry.' },
];

function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Beef aria-hidden="true" className="h-5 w-5" />
      </span>
      <span>
        <span className={inverse ? 'block font-semibold text-inverse-foreground' : 'block font-semibold text-text'}>
          {APP_CONFIG.brandName}
        </span>
        <span className={inverse ? 'block text-xs text-inverse-muted' : 'block text-xs text-muted'}>
          {APP_CONFIG.brandTagline}
        </span>
      </span>
    </div>
  );
}

/** Split screen for sign-in pages: brand panel (desktop) + centered form column. */
export function AuthLayout() {
  return (
    <div className="relative min-h-dvh">
      <OfflineBanner />
      <ScrollToTop />
      <div className="grid min-h-dvh bg-surface lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="hidden flex-col justify-between bg-inverse p-10 lg:flex xl:p-14">
        <Brand inverse />
        <div className="max-w-md space-y-10">
          <div className="space-y-3">
            <p className="text-sm font-medium text-inverse-muted">For Tamil Nadu’s meat shops</p>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-inverse-foreground">
              Run your meat shop from cut to doorstep.
            </h2>
          </div>
          <ul className="space-y-5">
            {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-inverse-border text-inverse-foreground">
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-inverse-foreground">{title}</span>
                  <span className="block text-sm text-inverse-muted">{body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="flex items-center gap-2 text-xs text-inverse-muted">
          <ShieldCheck aria-hidden="true" className="h-4 w-4" />
          Invite-only access · {APP_CONFIG.regionLabel}
        </p>
      </aside>

      <main className="flex flex-col px-5 py-8 sm:px-10">
        <div className="lg:hidden">
          <Brand />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </div>
        <p className="text-center text-xs text-muted">
          © {new Date().getFullYear()} {APP_CONFIG.brandName} · v{APP_CONFIG.version}
        </p>
      </main>
    </div>
    </div>
  );
}
