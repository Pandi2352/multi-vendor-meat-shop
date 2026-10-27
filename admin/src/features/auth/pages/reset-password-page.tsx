import { ArrowRight, KeyRound } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, Button, LoaderState } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { useZodForm } from '@/hooks';
import { getErrorMessage, isApiError } from '@/lib/api-error';
import { applyServerErrors } from '@/lib/form-errors';
import { getResetLinkProblem, usePasswordResetDetails, useResetPassword } from '../api/use-password-reset';
import { usePostLoginRedirect } from '../api/use-post-login-redirect';
import { NewPasswordFields } from '../components/new-password-fields';
import { ResetLinkUnavailable } from '../components/reset-link-unavailable';
import { newPasswordSchema, type NewPasswordValues } from '../schemas/new-password.schema';

/** Step 2 of forgot-password: opened from the email link; sets the new password and signs in. */
export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const details = usePasswordResetDetails(token);
  const reset = useResetPassword();
  const redirectAfterLogin = usePostLoginRedirect();

  const form = useZodForm(newPasswordSchema, { defaultValues: { password: '', confirmPassword: '' } });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit(async ({ password }: NewPasswordValues) => {
    try {
      const auth = await reset.mutateAsync({ token, password });
      redirectAfterLogin(auth.user);
    } catch (error) {
      applyServerErrors(error, form.setError, ['password']);
    }
  });

  if (!token) return <ResetLinkUnavailable problem="invalid" />;
  if (details.isLoading) return <LoaderState title="Checking your reset link…" />;
  if (details.isError || !details.data) return <ResetLinkUnavailable problem={getResetLinkProblem(details.error)} />;

  // The link can stop working while the page is open (used in another tab, or expired).
  const linkFailed = isApiError(reset.error) && reset.error.code === 'RESET_LINK_INVALID';
  if (linkFailed) return <ResetLinkUnavailable problem={getResetLinkProblem(reset.error)} />;

  const serverError = reset.isError && !errors.password ? getErrorMessage(reset.error) : null;

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-1.5">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-text">
          <KeyRound aria-hidden="true" className="h-6 w-6 text-primary" />
          Choose a new password
        </h1>
        <p className="text-sm text-muted">
          For <span className="font-medium text-text">{details.data.email}</span>. You’ll be signed in, and signed out
          on every other device.
        </p>
      </header>

      {serverError && (
        <Alert tone="danger" title="Couldn’t change the password">
          {serverError}
        </Alert>
      )}

      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        <NewPasswordFields
          password={form.register('password')}
          confirmPassword={form.register('confirmPassword')}
          passwordError={errors.password?.message}
          confirmPasswordError={errors.confirmPassword?.message}
        />
        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={reset.isPending}
          rightIcon={!reset.isPending && <ArrowRight className="h-4 w-4" />}
          className="mt-1"
        >
          {reset.isPending ? 'Saving…' : 'Save password and sign in'}
        </Button>
      </form>

      <p className="border-t border-border pt-4 text-center text-xs text-muted">
        Remembered it?{' '}
        <Link to={ROUTES.LOGIN} className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
