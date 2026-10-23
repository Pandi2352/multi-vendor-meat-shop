import { describe, expect, it } from 'vitest';
import { zEmail, zOtp, zRequiredString } from './primitives';

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
});
