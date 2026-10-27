import { z } from 'zod';
import { zNewPassword } from '@/utils/validation';

/** Password + confirmation fields shared by accept-invite and reset-password. */
export const newPasswordShape = {
  password: zNewPassword(),
  confirmPassword: z.string().min(1, 'Type the password again'),
};

export const passwordsMatch = (data: { password: string; confirmPassword: string }) =>
  data.password === data.confirmPassword;

export const PASSWORDS_MISMATCH = { message: 'Passwords don’t match', path: ['confirmPassword'] };

export const newPasswordSchema = z.object(newPasswordShape).refine(passwordsMatch, PASSWORDS_MISMATCH);

export type NewPasswordValues = z.output<typeof newPasswordSchema>;
