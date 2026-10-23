import { describe, expect, it } from 'vitest';
import { formatDateIST, formatINR, formatWeight, priceForGrams } from './format';

describe('format utils', () => {
  it('formats paise to INR currency strings correctly', () => {
    expect(formatINR(0)).toBe('₹0');
    expect(formatINR(24000)).toBe('₹240');
    expect(formatINR(24050)).toBe('₹240.50');
    expect(formatINR(129900)).toBe('₹1,299');
  });

  it('formats weight in grams and kilograms correctly', () => {
    expect(formatWeight(250)).toBe('250 g');
    expect(formatWeight(500)).toBe('500 g');
    expect(formatWeight(1000)).toBe('1 kg');
    expect(formatWeight(1500)).toBe('1.5 kg');
    expect(formatWeight(1250)).toBe('1.25 kg');
  });

  it('calculates priceForGrams cleanly', () => {
    expect(priceForGrams(24000, 500)).toBe(12000);
    expect(priceForGrams(38000, 250)).toBe(9500);
    expect(priceForGrams(80000, 1000)).toBe(80000);
  });

  it('formats IST date strings without crashing', () => {
    const formatted = formatDateIST('2026-10-23T10:30:00.000Z');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('Oct');
  });
});
