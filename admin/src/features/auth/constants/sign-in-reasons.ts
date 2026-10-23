import type { AlertProps } from '@/components/ui';

/** `/login?reason=…` — why the user landed on the sign-in page. */
export const SIGN_IN_REASON = {
  SIGNED_OUT: 'signed-out',
  SESSION_EXPIRED: 'expired',
} as const;

export type SignInReason = (typeof SIGN_IN_REASON)[keyof typeof SIGN_IN_REASON];

export const SIGN_IN_REASON_MESSAGES: Record<SignInReason, { tone: AlertProps['tone']; title: string; body: string }> = {
  [SIGN_IN_REASON.SIGNED_OUT]: {
    tone: 'success',
    title: 'You’re signed out',
    body: 'Sign in again whenever you’re ready.',
  },
  [SIGN_IN_REASON.SESSION_EXPIRED]: {
    tone: 'warning',
    title: 'Your session expired',
    body: 'For your security, please sign in again to continue.',
  },
};

export const isSignInReason = (value: string | null): value is SignInReason =>
  value !== null && Object.values(SIGN_IN_REASON).includes(value as SignInReason);
