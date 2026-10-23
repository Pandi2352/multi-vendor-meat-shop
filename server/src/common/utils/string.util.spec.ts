import { describe, expect, it } from 'vitest';
import {
  READABLE_ALPHABET,
  maskEmail,
  maskPhone,
  normalizePhone,
  randomCode,
  slugify,
  titleCase,
  truncate,
} from './string.util.js';

describe('string.util', () => {
  it('slugifies', () => {
    expect(slugify('  Chicken Curry Cut (500g) ')).toBe('chicken-curry-cut-500g');
    expect(slugify('Café Mutton')).toBe('cafe-mutton');
  });

  it.each([
    ['9876543210', '+919876543210'],
    ['98765 43210', '+919876543210'],
    ['09876543210', '+919876543210'],
    ['+91-98765-43210', '+919876543210'],
    ['919876543210', '+919876543210'],
  ])('normalises %s', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it.each(['12345', '5876543210', '+14155550100'])('rejects %s', (input) => {
    expect(normalizePhone(input)).toBeNull();
  });

  it('masks phone and email', () => {
    expect(maskPhone('+919876543210')).toBe('+91******3210');
    expect(maskEmail('pandi@example.com')).toBe('pa***@example.com');
  });

  it('title-cases and truncates', () => {
    expect(titleCase('country CHICKEN')).toBe('Country Chicken');
    expect(truncate('Boneless chicken breast', 10)).toBe('Boneless …');
    expect(truncate('Short', 10)).toBe('Short');
  });

  it('creates readable random codes', () => {
    const code = randomCode(8);
    expect(code).toHaveLength(8);
    expect([...code].every((c) => READABLE_ALPHABET.includes(c))).toBe(true);
  });
});
