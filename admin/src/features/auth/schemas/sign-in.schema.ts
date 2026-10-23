import { z } from 'zod';
import { zEmail } from '@/utils/validation';

export const signInSchema = z.object({ email: zEmail() });

export type SignInValues = z.output<typeof signInSchema>;
