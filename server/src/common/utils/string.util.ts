import { randomInt } from 'node:crypto';
import { REGEX } from '#common/constants';

/** Crockford-style alphabet without 0/O/1/I/L so codes are easy to read aloud. */
export const READABLE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export const slugify = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Normalises Indian mobile numbers to E.164 (`+919876543210`).
 * Accepts `98765 43210`, `09876543210`, `+91-98765-43210`, `919876543210`. Returns null when invalid.
 */
export const normalizePhone = (value: string): string | null => {
  const digits = value.replace(/\D/g, '');
  let national: string | null = null;
  if (digits.length === 10) national = digits;
  else if (digits.length === 11 && digits.startsWith('0')) national = digits.slice(1);
  else if (digits.length === 12 && digits.startsWith('91')) national = digits.slice(2);
  if (!national) return null;

  const e164 = `+91${national}`;
  return REGEX.PHONE_E164_IN.test(e164) ? e164 : null;
};

export const isIndianMobile = (value: string): boolean => normalizePhone(value) !== null;

/** `+919876543210` → `+91******3210` */
export const maskPhone = (phone: string): string =>
  phone.length <= 4
    ? phone
    : `${phone.slice(0, 3)}${'*'.repeat(Math.max(phone.length - 7, 0))}${phone.slice(-4)}`;

/** `pandi@example.com` → `pa***@example.com` */
export const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  return `${local.slice(0, 2)}***@${domain}`;
};

export const titleCase = (value: string): string =>
  value.toLowerCase().replace(/(^|[\s-])\p{L}/gu, (match) => match.toUpperCase());

export const truncate = (value: string, maxLength: number, suffix = '…'): string =>
  value.length <= maxLength
    ? value
    : `${value.slice(0, Math.max(maxLength - suffix.length, 0))}${suffix}`;

export const randomCode = (length: number, alphabet: string = READABLE_ALPHABET): string =>
  Array.from({ length }, () => alphabet[randomInt(alphabet.length)]).join('');
