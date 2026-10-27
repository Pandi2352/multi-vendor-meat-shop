import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, KeyRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, FormField, Input } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { getErrorMessage } from '@/lib/api-error';
import { useSendPortalOtp } from '../api/use-send-portal-otp';
import { useVerifyPortalOtp } from '../api/use-verify-portal-otp';
import { usePostLoginRedirect } from '../api/use-post-login-redirect';
import { pendingSignIn } from '../lib/pending-sign-in';

export function VerifyCodePage() {
  const navigate = useNavigate();
  const pending = pendingSignIn.read();
  const email = pending?.email;

  const [otp, setOtp] = useState('');
  const initialCooldown = pending?.resendAt
    ? Math.max(0, Math.ceil((pending.resendAt - Date.now()) / 1000))
    : 60;
  const [cooldown, setCooldown] = useState(initialCooldown);

  const verifyOtp = useVerifyPortalOtp();
  const redirectAfterLogin = usePostLoginRedirect();
  const sendOtp = useSendPortalOtp();

  useEffect(() => {
    if (!email) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => setCooldown((prev: number) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || otp.length < 6) return;

    try {
      const auth = await verifyOtp.mutateAsync({ email, otp: otp.trim() });
      pendingSignIn.clear();
      redirectAfterLogin(auth.user);
    } catch {
      // Error handled by verifyOtp.error
    }
  };

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    try {
      const result = await sendOtp.mutateAsync(email);
      setCooldown(result.cooldownSeconds);
    } catch {
      // Handled by sendOtp.error
    }
  };

  if (!email) return null;

  const errorMessage = verifyOtp.isError ? getErrorMessage(verifyOtp.error) : null;

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-1.5">
        <Link
          to={ROUTES.LOGIN}
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-text mb-2 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-text">Enter verification code</h1>
        <p className="text-sm text-muted">
          We sent a 6-digit code to <strong className="text-text font-medium">{email}</strong>
        </p>
      </header>

      {errorMessage && (
        <Alert tone="danger" title="Verification failed">
          {errorMessage}
        </Alert>
      )}

      <form onSubmit={handleVerify} className="flex flex-col gap-5">
        <FormField htmlFor="otp" label="6-Digit Code" hint="Check your inbox or spam folder">
          <Input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            inputSize="lg"
            className="tracking-widest font-mono text-center text-lg"
            leftIcon={<KeyRound className="h-4 w-4" />}
          />
        </FormField>

        <Button
          type="submit"
          size="lg"
          fullWidth
          disabled={otp.length !== 6 || verifyOtp.isPending}
          loading={verifyOtp.isPending}
          rightIcon={!verifyOtp.isPending && <ArrowRight className="h-4 w-4" />}
        >
          Verify & Sign In
        </Button>
      </form>

      <div className="border-t border-border pt-4 flex items-center justify-between text-xs text-muted">
        <span>Didn’t receive the code?</span>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || sendOtp.isPending}
          className="font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : sendOtp.isPending ? 'Sending…' : 'Resend code'}
        </button>
      </div>
    </div>
  );
}
