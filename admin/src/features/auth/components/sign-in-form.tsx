import { ArrowRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert, Button, FormField, Input, PasswordInput, fieldDescriptionId } from '@/components/ui';
import { devLogin } from '@/config/env';
import { ROUTES } from '@/config/routes';
import { useZodForm } from '@/hooks';
import { getErrorMessage } from '@/lib/api-error';
import { applyServerErrors } from '@/lib/form-errors';
import { usePortalLogin } from '../api/use-portal-login';
import { usePostLoginRedirect } from '../api/use-post-login-redirect';
import { signInSchema, type SignInValues } from '../schemas/sign-in.schema';
import { DevCredentialsHint } from './dev-credentials-hint';

/** Email + password portal sign-in. On success goes to `?next=` or the role's home. */
export function SignInForm() {
  const portalLogin = usePortalLogin();
  const redirectAfterLogin = usePostLoginRedirect();

  const form = useZodForm(signInSchema, {
    defaultValues: devLogin ?? { email: '', password: '' },
  });

  const emailError = form.formState.errors.email?.message;
  const passwordError = form.formState.errors.password?.message;
  const typedEmail = form.watch('email').trim();
  const forgotPath = typedEmail
    ? `${ROUTES.FORGOT_PASSWORD}?email=${encodeURIComponent(typedEmail)}`
    : ROUTES.FORGOT_PASSWORD;

  const onSubmit = form.handleSubmit(async (values: SignInValues) => {
    try {
      const auth = await portalLogin.mutateAsync({ email: values.email, password: values.password });
      redirectAfterLogin(auth.user);
    } catch (error) {
      applyServerErrors(error, form.setError, ['email', 'password']);
    }
  });

  const serverError =
    portalLogin.isError && !emailError && !passwordError ? getErrorMessage(portalLogin.error) : null;

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
      <DevCredentialsHint
        onFill={({ email, password }) => {
          form.setValue('email', email, { shouldValidate: true });
          form.setValue('password', password, { shouldValidate: true });
        }}
      />

      {serverError && (
        <Alert tone="danger" title="Sign in failed">
          {serverError}
        </Alert>
      )}

      <FormField htmlFor="email" label="Work email" error={emailError}>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoFocus
          spellCheck={false}
          placeholder="name@yourshop.in"
          inputSize="lg"
          invalid={Boolean(emailError)}
          aria-describedby={fieldDescriptionId('email')}
          leftIcon={<Mail className="h-4 w-4" />}
          {...form.register('email')}
        />
      </FormField>

      <FormField
        htmlFor="password"
        label="Password"
        error={passwordError}
        labelAction={
          <Link to={forgotPath} className="text-xs font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        }
      >
        <PasswordInput
          id="password"
          autoComplete="current-password"
          inputSize="lg"
          invalid={Boolean(passwordError)}
          aria-describedby={fieldDescriptionId('password')}
          {...form.register('password')}
        />
      </FormField>

      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={portalLogin.isPending}
        rightIcon={!portalLogin.isPending && <ArrowRight className="h-4 w-4" />}
        className="mt-1"
      >
        {portalLogin.isPending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
