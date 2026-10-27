import { Ban } from 'lucide-react';
import { APP_CONFIG } from '@/config/app.config';
import { AccessNotice } from '../components/access-notice';

export function SuspendedPage() {
  return (
    <AccessNotice icon={Ban} tone="danger" title="Your account is suspended">
      <p>You can’t use the portal while your account is suspended. Your data is safe and nothing has been deleted.</p>
      <p>
        To get access back, contact your shop owner or the {APP_CONFIG.brandName} team
        {APP_CONFIG.supportEmail ? (
          <>
            {' '}
            at{' '}
            <a className="font-medium text-text underline underline-offset-2" href={`mailto:${APP_CONFIG.supportEmail}`}>
              {APP_CONFIG.supportEmail}
            </a>
          </>
        ) : null}
        .
      </p>
    </AccessNotice>
  );
}
