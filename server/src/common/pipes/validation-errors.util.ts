import type { ValidationError } from 'class-validator';

export interface FieldError {
  field: string;
  messages: string[];
}

/** Flattens nested class-validator errors into `[{ field: 'address.pincode', messages: [...] }]`. */
export const flattenValidationErrors = (errors: ValidationError[], parent = ''): FieldError[] =>
  errors.flatMap((error) => {
    const field = parent ? `${parent}.${error.property}` : error.property;
    const own = error.constraints ? [{ field, messages: Object.values(error.constraints) }] : [];
    return [...own, ...flattenValidationErrors(error.children ?? [], field)];
  });
