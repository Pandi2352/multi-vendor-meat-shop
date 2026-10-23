import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type FieldValues, type UseFormProps, type UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';

/**
 * React Hook Form wired to a Zod schema. Validates on blur first, then on every change,
 * so users aren't shown errors while they're still typing for the first time.
 * Submit handlers receive the schema's parsed output (trimmed, lower-cased, etc.).
 */
export const useZodForm = <TInput extends FieldValues, TOutput extends FieldValues>(
  schema: z.ZodType<TOutput, TInput>,
  options: Omit<UseFormProps<TInput, unknown, TOutput>, 'resolver'> = {},
): UseFormReturn<TInput, unknown, TOutput> =>
  useForm<TInput, unknown, TOutput>({
    mode: 'onTouched',
    ...options,
    resolver: zodResolver<TInput, unknown, TOutput>(schema),
  });
