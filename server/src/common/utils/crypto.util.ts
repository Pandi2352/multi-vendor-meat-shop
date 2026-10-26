import { createHash, createHmac, randomBytes, randomInt, scryptSync, timingSafeEqual } from 'node:crypto';

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

/** Cryptographically secure scrypt password hasher */
export const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

/** Verify a plaintext password against a stored scrypt salt:hash string */
export const verifyPassword = (password: string, storedHash?: string | null): boolean => {
  if (!storedHash || typeof storedHash !== 'string') return false;
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  try {
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = scryptSync(password, salt, 64);
    return keyBuffer.length === derivedKey.length && timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
};
