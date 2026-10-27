import { z } from 'zod';
import { PASSWORDS_MISMATCH, newPasswordShape, passwordsMatch } from './new-password.schema';

export const acceptInviteSchema = z
  .object({ name: z.string().optional(), ...newPasswordShape })
  .refine(passwordsMatch, PASSWORDS_MISMATCH);

export type AcceptInviteValues = z.output<typeof acceptInviteSchema>;
