import { Link } from 'react-router-dom';
import { Alert, buttonVariants } from '@/components/ui';
import { ROUTES } from '@/config/routes';

export type InvitationProblem = 'accepted' | 'expired' | 'revoked' | 'invalid';

const COPY: Record<InvitationProblem, { tone: 'info' | 'warning' | 'danger'; title: string; body: string; signIn: boolean }> = {
  accepted: {
    tone: 'info',
    title: 'This invitation has already been used',
    body: 'Your account is set up. Sign in with your email and the password you chose.',
    signIn: true,
  },
  expired: {
    tone: 'warning',
    title: 'This invitation has expired',
    body: 'Ask the person who invited you (your shop owner or the admin team) to send a new invitation.',
    signIn: false,
  },
  revoked: {
    tone: 'warning',
    title: 'This invitation was cancelled',
    body: 'A newer invitation may have been sent — check your inbox for the latest email, or ask for a new one.',
    signIn: false,
  },
  invalid: {
    tone: 'danger',
    title: 'This invitation link isn’t valid',
    body: 'Open the most recent invitation email and use its button. Links from older emails stop working when a new one is sent.',
    signIn: false,
  },
};

/** Accept-invite page states where no password can be set. */
export function InvitationUnavailable({ problem }: { problem: InvitationProblem }) {
  const copy = COPY[problem];
  return (
    <div className="flex flex-col gap-5">
      <Alert tone={copy.tone} title={copy.title}>
        {copy.body}
      </Alert>
      <Link
        to={ROUTES.LOGIN}
        className={buttonVariants({ variant: copy.signIn ? 'primary' : 'outline', size: 'lg', fullWidth: true })}
      >
        {copy.signIn ? 'Sign in' : 'Go to sign in'}
      </Link>
    </div>
  );
}
