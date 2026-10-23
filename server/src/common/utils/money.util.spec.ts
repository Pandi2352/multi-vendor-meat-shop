import { describe, expect, it } from 'vitest';
import {
  applyBasisPoints,
  formatINR,
  fromPaise,
  isPaise,
  percentToBasisPoints,
  splitProportionally,
  sumPaise,
  toPaise,
} from './money.util.js';

describe('money.util', () => {
  it('converts rupees and paise without float drift', () => {
    expect(toPaise(19.99)).toBe(1999);
    expect(toPaise(0.1 + 0.2)).toBe(30);
    expect(fromPaise(1999)).toBe(19.99);
  });

  it('validates integer paise', () => {
    expect(isPaise(100)).toBe(true);
    expect(isPaise(10.5)).toBe(false);
    expect(isPaise('100')).toBe(false);
  });

  it('sums amounts', () => {
    expect(sumPaise(100, 250, 50)).toBe(400);
    expect(sumPaise()).toBe(0);
  });

  it('applies basis points with rounding', () => {
    expect(applyBasisPoints(10_000, 1250)).toBe(1250);
    expect(applyBasisPoints(999, 1000)).toBe(100);
    expect(percentToBasisPoints(12.5)).toBe(1250);
  });

  it('splits proportionally without losing paise', () => {
    const parts = splitProportionally(1000, [1, 1, 1]);
    expect(parts).toEqual([334, 333, 333]);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(1000);
    expect(splitProportionally(500, [0, 0])).toEqual([0, 0]);
    expect(splitProportionally(1001, [3, 1])).toEqual([751, 250]);
  });

  it('formats INR', () => {
    expect(formatINR(12_550)).toBe('₹125.50');
    expect(formatINR(1_25_00_000, { whole: true })).toBe('₹1,25,000');
  });
});
