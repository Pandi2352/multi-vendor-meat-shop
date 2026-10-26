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
export function SignInForm({
  defaultEmail = 'admin@virudhunagar-meats.in',
  defaultPassword = 'Admin@12345',
}: {
  defaultEmail?: string;
  defaultPassword?: string;
}) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const portalLogin = usePortalLogin();

  const form = useZodForm(signInSchema, {
    defaultValues: { email: defaultEmail, password: defaultPassword },
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
      {/* Test Super Admin Banner (Temporary for Testing) */}
      <div className="rounded-md border border-border bg-surface-muted/80 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              Test Super Admin
            </span>
            <span className="text-xs font-semibold text-text">Developer Testing</span>
          </div>
          <button
            type="button"
            onClick={() => {
              form.setValue('email', 'admin@virudhunagar-meats.in', { shouldValidate: true });
              form.setValue('password', 'Admin@12345', { shouldValidate: true });
            }}
            className="text-xs text-primary font-medium hover:underline cursor-pointer"
          >
            Auto-fill
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs bg-surface p-2 rounded-md border border-border">
          <div>
            <span className="block text-[10px] uppercase font-semibold text-muted">Email</span>
            <span className="font-mono text-xs font-medium text-text select-all">admin@virudhunagar-meats.in</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-semibold text-muted">Password</span>
            <span className="font-mono text-xs font-medium text-text select-all">Admin@12345</span>
          </div>
        </div>
      </div>

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
