import { Transform } from 'class-transformer';
import { normalizePhone } from '#common/utils';

// Property transformers for DTOs. They only reshape input; validators decide whether it is valid.

export const Trim = (): PropertyDecorator =>
  Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value));

export const ToLowerCase = (): PropertyDecorator =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );

/** Query strings arrive as text: `'20'` → 20. Non-numeric input is left for the validator to reject. */
export const ToInt = (): PropertyDecorator =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && /^-?\d+$/.test(value.trim()) ? Number.parseInt(value, 10) : value,
  );

export const ToNumber = (): PropertyDecorator =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))
      ? Number(value)
      : value,
  );

export const ToBoolean = (): PropertyDecorator =>
  Transform(({ value }: { value: unknown }) => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  });

/** `'a,b'` or `['a','b']` → `['a','b']` */
export const ToArray = (): PropertyDecorator =>
  Transform(({ value }: { value: unknown }) => {
    if (Array.isArray(value)) return value as unknown[];
    if (typeof value === 'string')
      return value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
    return value;
  });

/** Normalises Indian mobile numbers to E.164. Invalid input is kept so `@IsIndianPhone()` reports it. */
export const NormalizePhone = (): PropertyDecorator =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? (normalizePhone(value) ?? value) : value,
  );
