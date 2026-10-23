import { ArrowRight, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, FormField, Input, fieldDescriptionId } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { useZodForm } from '@/hooks';
import { getErrorMessage } from '@/lib/api-error';
import { applyServerErrors } from '@/lib/form-errors';
import { useSendPortalOtp } from '../api/use-send-portal-otp';
import { pendingSignIn } from '../lib/pending-sign-in';
import { signInSchema, type SignInValues } from '../schemas/sign-in.schema';

/** Email step of portal sign-in. On success, hands off to the verify-code page. */
export function SignInForm({ defaultEmail = '' }: { defaultEmail?: string }) {
  const navigate = useNavigate();
  const sendOtp = useSendPortalOtp();
  const form = useZodForm(signInSchema, { defaultValues: { email: defaultEmail } });
  const emailError = form.formState.errors.email?.message;

  const onSubmit = form.handleSubmit(async ({ email }: SignInValues) => {
    try {
      const result = await sendOtp.mutateAsync(email);
      pendingSignIn.save(email, result.cooldownSeconds);
      navigate(ROUTES.LOGIN_VERIFY);
    } catch (error) {
      applyServerErrors(error, form.setError, ['email']);
    }
  });

  const serverError = sendOtp.isError && !emailError ? getErrorMessage(sendOtp.error) : null;

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
      {serverError && <Alert tone="danger" title="Couldn’t send the code">{serverError}</Alert>}

      <FormField htmlFor="email" label="Work email" error={emailError} hint="We’ll email you a 6-digit sign-in code.">
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

      <Button type="submit" size="lg" fullWidth loading={sendOtp.isPending} rightIcon={!sendOtp.isPending && <ArrowRight className="h-4 w-4" />}>
        {sendOtp.isPending ? 'Sending code…' : 'Send sign-in code'}
      </Button>
    </form>
  );
}
