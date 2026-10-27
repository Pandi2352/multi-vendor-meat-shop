import { Link } from 'react-router-dom';
import { Alert, buttonVariants } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import type { ResetLinkProblem } from '../api/use-password-reset';

const COPY: Record<ResetLinkProblem, { tone: 'info' | 'warning' | 'danger'; title: string; body: string }> = {
  used: {
    tone: 'info',
    title: 'This reset link has already been used',
    body: 'Your password was changed. Sign in with the new one, or request another link if that wasn’t you.',
  },
  expired: {
    tone: 'warning',
    title: 'This reset link has expired',
    body: 'Reset links only work for a short time. Request a new one — it takes a few seconds.',
  },
  invalid: {
    tone: 'danger',
    title: 'This reset link isn’t valid',
    body: 'Open the most recent reset email and use its button. Asking for a new link makes older ones stop working.',
  },
};

/** Reset-password page states where no new password can be set. */
export function ResetLinkUnavailable({ problem }: { problem: ResetLinkProblem }) {
  const copy = COPY[problem];
  const signInFirst = problem === 'used';
  return (
    <div className="flex flex-col gap-5">
      <Alert tone={copy.tone} title={copy.title}>
        {copy.body}
      </Alert>
      <div className="flex flex-col gap-2.5">
        <Link
          to={ROUTES.FORGOT_PASSWORD}
          className={buttonVariants({ variant: signInFirst ? 'outline' : 'primary', size: 'lg', fullWidth: true })}
        >
          Request a new link
        </Link>
        <Link
          to={ROUTES.LOGIN}
          className={buttonVariants({ variant: signInFirst ? 'primary' : 'outline', size: 'lg', fullWidth: true })}
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
