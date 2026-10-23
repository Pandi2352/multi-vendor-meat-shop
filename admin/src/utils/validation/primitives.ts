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
