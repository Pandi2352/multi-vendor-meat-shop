import { Alert, type AlertProps } from '@/components/ui';
import { APP_CONFIG } from '@/config/app.config';
import { useVendorStatus } from '../api/use-vendor-status';
import type { VendorAccessStatus } from '../api/vendor-status.api';

interface BannerCopy {
  tone: NonNullable<AlertProps['tone']>;
  title: string;
  body: string;
}

const PAUSED = 'Products, stock, shop details and staff are locked.';
const STILL_WORKS = 'You can still finish orders already placed, see your history and request payouts.';

const COPY: Partial<Record<VendorAccessStatus['status'], BannerCopy>> = {
  SUSPENDED: {
    tone: 'danger',
    title: 'Your shop is suspended',
    body: `Customers can’t order from you right now. ${PAUSED} ${STILL_WORKS}`,
  },
  REJECTED: {
    tone: 'danger',
    title: 'Your shop application was rejected',
    body: `The shop isn’t live. ${PAUSED}`,
  },
  RESUBMISSION_REQUIRED: {
    tone: 'warning',
    title: 'Changes needed before your shop can sell',
    body: `Fix the items the ${APP_CONFIG.brandName} team asked for, then resubmit. ${PAUSED}`,
  },
};

const UNDER_REVIEW: BannerCopy = {
  tone: 'info',
  title: 'Your shop is being reviewed',
  body: `You’ll be able to sell and make changes once the ${APP_CONFIG.brandName} team approves it.`,
};

/** Top-of-page notice for shop owners and staff while their shop isn't approved. Hidden otherwise. */
export function VendorStatusBanner() {
  const { data: status } = useVendorStatus();
  if (!status || status.canSell) return null;

  const copy = COPY[status.status] ?? UNDER_REVIEW;
  const adminNote = status.reason ?? status.notes;

  return (
    <Alert tone={copy.tone} title={copy.title} className="mb-5">
      <p>{copy.body}</p>
      {adminNote && (
        <p className="mt-1.5">
          <span className="font-medium text-text">Note from the admin team:</span> {adminNote}
        </p>
      )}
      <p className="mt-1.5 text-xs">Questions? Contact the {APP_CONFIG.brandName} operations team.</p>
    </Alert>
  );
}
