import { z } from 'zod';

// Reusable Zod building blocks. Form schemas compose these instead of repeating rules.

export const zRequiredString = (label: string, min = 1, max = 200) =>
  z
    .string()
    .trim()
    .min(min, min <= 1 ? `${label} is required` : `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`);

export const zEmail = () =>
  z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email is required')
    .email('Enter a valid email address, like name@shop.in');

export const zOtp = (length = 6) =>
  z
    .string()
    .trim()
    .regex(new RegExp(`^\\d{${length}}$`), `Enter the ${length}-digit code`);

/** Same limits as the server's `IsAccountPassword` (invite acceptance and reset). */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const zNewPassword = () =>
  z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`)
    .max(PASSWORD_MAX_LENGTH, `Use at most ${PASSWORD_MAX_LENGTH} characters`);

/** Indian mobile, typed with or without +91, spaces or dashes. Same rule as the server's `IsIndianPhone`. */
const INDIAN_MOBILE = /^(?:\+?91|0)?[6-9]\d{9}$/;

/** Optional phone field: empty stays empty (sent as undefined), otherwise must be an Indian mobile. */
export const zOptionalIndianPhone = () =>
  z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s-]/g, ''))
    .refine((value) => value === '' || INDIAN_MOBILE.test(value), 'Enter a 10-digit mobile number, like 98765 43210')
    .transform((value) => value || undefined);
