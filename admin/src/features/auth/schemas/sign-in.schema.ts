import { z } from 'zod';
import { zEmail } from '@/utils/validation';

export const signInSchema = z.object({
  email: zEmail(),
  password: z.string().min(1, 'Password is required'),
});

export type SignInValues = z.output<typeof signInSchema>;
