import { describe, expect, it } from 'vitest';
import { generateOtp, hmacSha256, randomToken, safeCompare, sha256 } from './crypto.util.js';

describe('crypto.util', () => {
  it('hashes deterministically', () => {
    expect(sha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(hmacSha256('payload', 'secret')).toHaveLength(64);
  });

  it('compares safely', () => {
    expect(safeCompare('token', 'token')).toBe(true);
    expect(safeCompare('token', 'tokem')).toBe(false);
    expect(safeCompare('token', 'token-longer')).toBe(false);
  });

  it('generates numeric OTPs', () => {
    expect(generateOtp()).toMatch(/^\d{6}$/);
    expect(generateOtp(4)).toMatch(/^\d{4}$/);
  });

  it('generates url-safe tokens', () => {
    expect(randomToken()).toMatch(/^[\w-]{43}$/);
  });
});
