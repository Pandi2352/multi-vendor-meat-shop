import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { getFieldErrors } from './api-error';

/**
 * Puts server validation errors (`details: [{ field, messages }]`) on the matching form fields.
 * Returns true when at least one field error was applied, so callers can skip a generic banner.
 */
export const applyServerErrors = <T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): boolean => {
  const fieldErrors = getFieldErrors(error);
  let applied = false;
  for (const field of fields) {
    const message = fieldErrors[field];
    if (message) {
      setError(field, { type: 'server', message });
      applied = true;
    }
  }
  return applied;
};
