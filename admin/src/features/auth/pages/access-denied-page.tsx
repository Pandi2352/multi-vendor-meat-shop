import { ShieldX } from 'lucide-react';
import { APP_CONFIG } from '@/config/app.config';
import { AccessNotice } from '../components/access-notice';

/** A signed-in account that isn't allowed into the portal (e.g. a storefront customer). */
export function AccessDeniedPage() {
  return (
    <AccessNotice icon={ShieldX} tone="warning" title="This account can’t open the portal">
      <p>
        The {APP_CONFIG.brandName} portal is for shop owners, shop staff, delivery partners and the operations team.
        Customer accounts shop on the storefront instead.
      </p>
      <p>If you work with a shop or our team, ask them to send you an invitation, then sign in with that email.</p>
    </AccessNotice>
  );
}
