import type { UseFormRegisterReturn } from 'react-hook-form';
import { FormField, PasswordInput, fieldDescriptionId } from '@/components/ui';
import { PASSWORD_MIN_LENGTH } from '@/utils/validation';

interface NewPasswordFieldsProps {
  password: UseFormRegisterReturn<'password'>;
  confirmPassword: UseFormRegisterReturn<'confirmPassword'>;
  passwordError?: string;
  confirmPasswordError?: string;
  label?: string;
}

/** New password + confirmation, for accept-invite and reset-password forms. */
export function NewPasswordFields({
  password,
  confirmPassword,
  passwordError,
  confirmPasswordError,
  label = 'New password',
}: NewPasswordFieldsProps) {
  return (
    <>
      <FormField
        htmlFor="password"
        label={label}
        error={passwordError}
        hint={`At least ${PASSWORD_MIN_LENGTH} characters. A short sentence is easy to remember and hard to guess.`}
      >
        <PasswordInput
          id="password"
          autoComplete="new-password"
          inputSize="lg"
          invalid={Boolean(passwordError)}
          aria-describedby={fieldDescriptionId('password')}
          {...password}
        />
      </FormField>

      <FormField htmlFor="confirmPassword" label="Confirm password" error={confirmPasswordError}>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          inputSize="lg"
          invalid={Boolean(confirmPasswordError)}
          aria-describedby={fieldDescriptionId('confirmPassword')}
          {...confirmPassword}
        />
      </FormField>
    </>
  );
}
