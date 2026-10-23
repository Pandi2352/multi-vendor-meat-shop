import { useSearchParams } from 'react-router-dom';
import { Alert } from '@/components/ui';
import { APP_CONFIG } from '@/config/app.config';
import { SignInForm } from '../components/sign-in-form';
import { SIGN_IN_REASON_MESSAGES, isSignInReason } from '../constants/sign-in-reasons';
import { pendingSignIn } from '../lib/pending-sign-in';

export function SignInPage() {
  const [params] = useSearchParams();
  const reason = params.get('reason');
  const notice = isSignInReason(reason) ? SIGN_IN_REASON_MESSAGES[reason] : null;

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-text">Sign in to your portal</h1>
        <p className="text-sm text-muted">For shop owners, staff, delivery partners and the operations team.</p>
      </header>

      {notice && (
        <Alert tone={notice.tone} title={notice.title}>
          {notice.body}
        </Alert>
      )}

      <SignInForm defaultEmail={pendingSignIn.read()?.email} />

      <p className="border-t border-border pt-5 text-xs leading-5 text-muted">
        Access is by invitation only. If you don’t have an account, ask your shop owner or the {APP_CONFIG.brandName}{' '}
        team to invite you.
      </p>
    </div>
  );
}
