import { describe, expect, it } from 'vitest';
import { generateId, isUuid } from './id.util.js';
import { ReferencePrefix, createReferenceNumber } from './reference-number.util.js';

describe('id.util', () => {
  it('generates UUID v7 ids that sort by creation time', () => {
    const first = generateId();
    const second = generateId();
    expect(isUuid(first)).toBe(true);
    expect(first[14]).toBe('7');
    expect(first < second).toBe(true);
  });

  it('rejects non-v7 values', () => {
    expect(isUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(false);
    expect(isUuid('507f1f77bcf86cd799439011')).toBe(false);
    expect(isUuid(42)).toBe(false);
  });
});

describe('reference-number.util', () => {
  it('formats prefix, IST date and suffix', () => {
    const ref = createReferenceNumber(ReferencePrefix.ORDER, new Date('2026-10-22T20:00:00Z'));
    expect(ref).toMatch(/^ORD-261023-[2-9A-HJKMNP-Z]{5}$/);
  });
});
