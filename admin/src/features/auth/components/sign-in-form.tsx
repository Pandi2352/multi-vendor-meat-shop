import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Alert, Button, FormField, Input, fieldDescriptionId } from '@/components/ui';
import { devLogin } from '@/config/env';
import { useZodForm } from '@/hooks';
import { getErrorMessage } from '@/lib/api-error';
import { applyServerErrors } from '@/lib/form-errors';
import { usePortalLogin } from '../api/use-portal-login';
import { usePostLoginRedirect } from '../api/use-post-login-redirect';
import { signInSchema, type SignInValues } from '../schemas/sign-in.schema';
import { DevCredentialsHint } from './dev-credentials-hint';

/** Email + password portal sign-in. On success goes to `?next=` or the role's home. */
export function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const portalLogin = usePortalLogin();
  const redirectAfterLogin = usePostLoginRedirect();

  const form = useZodForm(signInSchema, {
    defaultValues: devLogin ?? { email: '', password: '' },
  });

  const emailError = form.formState.errors.email?.message;
  const passwordError = form.formState.errors.password?.message;

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

      <FormField htmlFor="password" label="Password" error={passwordError}>
        <Input
          id="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="••••••••"
          inputSize="lg"
          invalid={Boolean(passwordError)}
          aria-describedby={fieldDescriptionId('password')}
          leftIcon={<Lock className="h-4 w-4" />}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="rounded-md p-1 text-muted transition-colors hover:text-text"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
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
