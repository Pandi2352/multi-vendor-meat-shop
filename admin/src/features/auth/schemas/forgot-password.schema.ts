import { z } from 'zod';
import { zEmail } from '@/utils/validation';

export const forgotPasswordSchema = z.object({ email: zEmail() });

export type ForgotPasswordValues = z.output<typeof forgotPasswordSchema>;
