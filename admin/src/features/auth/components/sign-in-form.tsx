import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, FormField, Input, fieldDescriptionId } from '@/components/ui';
import { useZodForm } from '@/hooks';
import { getErrorMessage } from '@/lib/api-error';
import { applyServerErrors } from '@/lib/form-errors';
import { usePortalLogin } from '../api/use-portal-login';
import { signInSchema, type SignInValues } from '../schemas/sign-in.schema';

/** Password-based portal sign-in form */
export function SignInForm({ defaultEmail = '' }: { defaultEmail?: string }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const portalLogin = usePortalLogin();

  const form = useZodForm(signInSchema, {
    defaultValues: { email: defaultEmail, password: '' },
  });

  const emailError = form.formState.errors.email?.message;
  const passwordError = form.formState.errors.password?.message;

  const onSubmit = form.handleSubmit(async (values: SignInValues) => {
    try {
      await portalLogin.mutateAsync({
        email: values.email,
        password: values.password,
      });
      navigate('/', { replace: true });
    } catch (error) {
      applyServerErrors(error, form.setError, ['email', 'password']);
    }
  });

  const serverError = portalLogin.isError && !emailError && !passwordError
    ? getErrorMessage(portalLogin.error)
    : null;

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
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
          placeholder="admin@virudhunagar-meats.in"
          inputSize="lg"
          invalid={Boolean(emailError)}
          aria-describedby={fieldDescriptionId('email')}
          leftIcon={<Mail className="h-4 w-4" />}
          {...form.register('email')}
        />
      </FormField>

      <FormField htmlFor="password" label="Password" error={passwordError}>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
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

      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={portalLogin.isPending}
        rightIcon={!portalLogin.isPending && <ArrowRight className="h-4 w-4" />}
        className="mt-1"
      >
        {portalLogin.isPending ? 'Authenticating…' : 'Sign in to Portal'}
      </Button>
    </form>
  );
}
