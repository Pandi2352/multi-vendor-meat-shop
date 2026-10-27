import { useState } from 'react';
import { ArrowLeft, ArrowRight, Mail, MailCheck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, Button, FormField, Input, buttonVariants, fieldDescriptionId } from '@/components/ui';
import { APP_CONFIG } from '@/config/app.config';
import { ROUTES } from '@/config/routes';
import { useCountdown, useZodForm } from '@/hooks';
import { getErrorMessage } from '@/lib/api-error';
import { applyServerErrors } from '@/lib/form-errors';
import { useRequestPasswordReset } from '../api/use-password-reset';
import { forgotPasswordSchema, type ForgotPasswordValues } from '../schemas/forgot-password.schema';

/** Step 1 of forgot-password: ask for the email, then say to check the inbox (same answer for every email). */
export function ForgotPasswordPage() {
  const [params] = useSearchParams();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const cooldown = useCountdown();
  const request = useRequestPasswordReset();

  const form = useZodForm(forgotPasswordSchema, { defaultValues: { email: params.get('email') ?? '' } });
  const emailError = form.formState.errors.email?.message;

  const send = async (email: string) => {
    const result = await request.mutateAsync(email);
    setSentTo(email);
    cooldown.start(result.cooldownSeconds);
  };

  const onSubmit = form.handleSubmit(async ({ email }: ForgotPasswordValues) => {
    try {
      await send(email);
    } catch (error) {
      applyServerErrors(error, form.setError, ['email']);
    }
  });

  const serverError = request.isError && !emailError ? getErrorMessage(request.error) : null;
  const backToSignIn = (
    <Link to={ROUTES.LOGIN} className={buttonVariants({ variant: 'ghost', size: 'md' })}>
      <ArrowLeft className="h-4 w-4" />
      Back to sign in
    </Link>
  );

  if (sentTo) {
    return (
      <div className="flex flex-col gap-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-md bg-success-soft text-success">
          <MailCheck aria-hidden="true" className="h-5 w-5" />
        </span>
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-text">Check your email</h1>
          <p className="text-sm leading-6 text-muted">
            If <span className="font-medium text-text">{sentTo}</span> belongs to an active portal account, we’ve sent
            it a link to choose a new password. The link works once and expires soon.
          </p>
        </header>

        {serverError && (
          <Alert tone="danger" title="Couldn’t send the email">
            {serverError}
          </Alert>
        )}

        <div className="rounded-md border border-border bg-surface-muted px-3.5 py-3 text-xs leading-5 text-muted">
          Nothing after a few minutes? Check spam. Invited but never set a password? Use your invitation email instead,
          or ask your shop owner or the {APP_CONFIG.brandName} team to send a new invite.
        </div>

        <div className="flex flex-col gap-2.5">
          <Button
            variant="outline"
            size="lg"
            fullWidth
            disabled={cooldown.seconds > 0}
            loading={request.isPending}
            onClick={() => void send(sentTo).catch(() => undefined)}
          >
            {cooldown.seconds > 0 ? `Send again in ${cooldown.seconds}s` : 'Send the link again'}
          </Button>
          <Button variant="ghost" size="md" fullWidth onClick={() => setSentTo(null)}>
            Use a different email
          </Button>
        </div>
        <div className="border-t border-border pt-4">{backToSignIn}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-text">Forgot your password?</h1>
        <p className="text-sm text-muted">Enter your work email and we’ll send you a link to choose a new one.</p>
      </header>

      {serverError && (
        <Alert tone="danger" title="Couldn’t send the email">
          {serverError}
        </Alert>
      )}

      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
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

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={request.isPending}
          rightIcon={!request.isPending && <ArrowRight className="h-4 w-4" />}
          className="mt-1"
        >
          {request.isPending ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>

      <div className="border-t border-border pt-4">{backToSignIn}</div>
    </div>
  );
}
