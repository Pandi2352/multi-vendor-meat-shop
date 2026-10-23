import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';

export const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');

export const hmacSha256 = (payload: string, secret: string): string =>
  createHmac('sha256', secret).update(payload).digest('hex');

/** Constant-time string comparison for tokens, signatures and OTP hashes. */
export const safeCompare = (a: string, b: string): boolean => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

export const generateOtp = (length = 6): string =>
  Array.from({ length }, () => randomInt(10).toString()).join('');

/** URL-safe random token, e.g. for refresh tokens or idempotency keys. */
export const randomToken = (bytes = 32): string => randomBytes(bytes).toString('base64url');
