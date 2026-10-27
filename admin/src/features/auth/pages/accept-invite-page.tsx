import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, UserCheck } from 'lucide-react';
import { Alert, Button, FormField, Input, LoaderState, fieldDescriptionId } from '@/components/ui';
import { APP_CONFIG } from '@/config/app.config';
import { ROUTES } from '@/config/routes';
import { ROLE_LABELS } from '@/constants/roles';
import { useZodForm } from '@/hooks';
import { getErrorMessage } from '@/lib/api-error';
import { useAcceptInvitation, useInvitationDetails } from '../api/use-invitation';
import { usePostLoginRedirect } from '../api/use-post-login-redirect';
import { InvitationUnavailable } from '../components/invitation-unavailable';
import { acceptInviteSchema, type AcceptInviteValues } from '../schemas/accept-invite.schema';

export function AcceptInvitePage() {
  const [params] = useSearchParams();
  const redirectAfterLogin = usePostLoginRedirect();
  const token = params.get('token') || '';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: invite, isLoading, isError } = useInvitationDetails(token);
  const acceptMutation = useAcceptInvitation();

  const form = useZodForm(acceptInviteSchema, {
    defaultValues: {
      name: invite?.name || '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordError = form.formState.errors.password?.message;
  const confirmPasswordError = form.formState.errors.confirmPassword?.message;

  const onSubmit = form.handleSubmit(async (values: AcceptInviteValues) => {
    try {
      const auth = await acceptMutation.mutateAsync({
        token,
        password: values.password,
        name: values.name || invite?.name,
      });
      redirectAfterLogin(auth.user);
    } catch {
      // Handled by error state below
    }
  });

  if (!token) {
    return (
      <div className="flex flex-col gap-5">
        <Alert tone="danger" title="Missing Invitation Token">
          No invitation token was found in the link. Please check your invitation email and click the onboarding link again.
        </Alert>
        <Link to={ROUTES.LOGIN}>
          <Button variant="outline" size="md" fullWidth>
            Go to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <LoaderState
        title="Verifying your invitation..."
        description="Connecting to Tamil Nadu marketplace security service"
      />
    );
  }

  if (isError || !invite) return <InvitationUnavailable problem="invalid" />;
  if (invite.status === 'ACCEPTED') return <InvitationUnavailable problem="accepted" />;
  if (invite.status === 'REVOKED') return <InvitationUnavailable problem="revoked" />;
  if (invite.isExpired || invite.status === 'EXPIRED') return <InvitationUnavailable problem="expired" />;

  const roleLabel = ROLE_LABELS[invite.role] ?? invite.role;

  const serverError = acceptMutation.isError ? getErrorMessage(acceptMutation.error) : null;

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-text flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-primary" />
          Activate Your Portal Account
        </h1>
        <p className="text-sm text-muted">
          You’ve been invited to {APP_CONFIG.brandName} as <strong className="text-text font-semibold">{roleLabel}</strong>. Set a password to activate your account.
        </p>
      </header>

      {/* Account Info Pill */}
      <div className="p-3.5 rounded-md border border-border bg-surface-muted/60 space-y-1 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted">Account Email:</span>
          <span className="font-semibold text-text">{invite.email}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted">Assigned Role:</span>
          <span className="font-semibold text-text">{roleLabel}</span>
        </div>
      </div>

      {serverError && (
        <Alert tone="danger" title="Couldn't set password">
          {serverError}
        </Alert>
      )}

      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        <FormField htmlFor="name" label="Your Name (Optional)">
          <Input
            id="name"
            placeholder={invite.name || 'e.g. S. Murugesan'}
            inputSize="lg"
            {...form.register('name')}
          />
        </FormField>

        <FormField htmlFor="password" label="Create Password *" error={passwordError} hint="Must be at least 6 characters.">
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              inputSize="lg"
              invalid={Boolean(passwordError)}
              aria-describedby={fieldDescriptionId('password')}
              leftIcon={<Lock className="h-4 w-4" />}
              {...form.register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors p-1"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </FormField>

        <FormField htmlFor="confirmPassword" label="Confirm Password *" error={confirmPasswordError}>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              inputSize="lg"
              invalid={Boolean(confirmPasswordError)}
              aria-describedby={fieldDescriptionId('confirmPassword')}
              leftIcon={<Lock className="h-4 w-4" />}
              {...form.register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors p-1"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </FormField>

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={acceptMutation.isPending}
          rightIcon={!acceptMutation.isPending && <ArrowRight className="h-4 w-4" />}
          className="mt-1"
        >
          {acceptMutation.isPending ? 'Activating account…' : 'Set Password & Enter Portal'}
        </Button>
      </form>

      <p className="border-t border-border pt-4 text-xs text-muted text-center">
        Already set your password?{' '}
        <Link to={ROUTES.LOGIN} className="font-semibold text-primary hover:underline">
          Sign in here
        </Link>
      </p>
    </div>
  );
}
