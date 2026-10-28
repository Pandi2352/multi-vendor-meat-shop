import { describe, expect, it } from 'vitest';
import { zEmail, zNewPassword, zOptionalIndianPhone, zOtp, zRequiredString } from './primitives';

describe('validation primitives', () => {
  it('normalises and validates email', () => {
    expect(zEmail().parse('  Ops@TNMeat.IN ')).toBe('ops@tnmeat.in');
    expect(zEmail().safeParse('').error?.issues[0].message).toBe('Email is required');
    expect(zEmail().safeParse('not-an-email').success).toBe(false);
  });

  it('validates OTP digits', () => {
    expect(zOtp().parse('123456')).toBe('123456');
    expect(zOtp().safeParse('12345').success).toBe(false);
    expect(zOtp().safeParse('12a456').success).toBe(false);
  });

  it('builds required-string messages', () => {
    expect(zRequiredString('Name').safeParse('  ').error?.issues[0].message).toBe('Name is required');
    expect(zRequiredString('Name', 3).safeParse('ab').error?.issues[0].message).toBe(
      'Name must be at least 3 characters',
    );
  });

  it('enforces new password length like the server', () => {
    expect(zNewPassword().safeParse('Short@1').error?.issues[0].message).toBe('Use at least 8 characters');
    expect(zNewPassword().safeParse('Mutton@2026').success).toBe(true);
    expect(zNewPassword().safeParse('x'.repeat(129)).success).toBe(false);
  });

  it('accepts Indian mobiles in the usual ways and leaves an empty phone out', () => {
    expect(zOptionalIndianPhone().parse('98765 43210')).toBe('9876543210');
    expect(zOptionalIndianPhone().parse('+91-98765-43210')).toBe('+919876543210');
    expect(zOptionalIndianPhone().parse('09876543210')).toBe('09876543210');
    expect(zOptionalIndianPhone().parse('  ')).toBeUndefined();
    expect(zOptionalIndianPhone().safeParse('12345').success).toBe(false);
    expect(zOptionalIndianPhone().safeParse('5876543210').success).toBe(false);
  });
});
