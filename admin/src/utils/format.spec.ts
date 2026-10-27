import { describe, expect, it } from 'vitest';
import { calculateWeightVariance, formatDateIST, formatDayIST, formatINR, formatNumber, formatWeight } from './format';

describe('format utilities', () => {
  it('formats paise into INR currency strings', () => {
    expect(formatINR(0)).toBe('₹0');
    expect(formatINR(24000)).toBe('₹240');
    expect(formatINR(24050)).toBe('₹240.50');
  });

  it('formats grams into appropriate units', () => {
    expect(formatWeight(500)).toBe('500 g');
    expect(formatWeight(1000)).toBe('1 kg');
    expect(formatWeight(1250)).toBe('1.25 kg');
  });

  it('calculates weight variance percentage', () => {
    expect(calculateWeightVariance(500, 525)).toBe(5);
    expect(calculateWeightVariance(500, 480)).toBe(-4);
    expect(calculateWeightVariance(1000, 1000)).toBe(0);
  });

  it('handles empty date string gracefully', () => {
    expect(formatDateIST('')).toBe('');
  });

  it('groups counts the Indian way', () => {
    expect(formatNumber(125000)).toBe('1,25,000');
    expect(formatNumber(7)).toBe('7');
  });

  it('labels an IST calendar day', () => {
    expect(formatDayIST('2026-10-27')).toBe('Tue, 27 Oct');
  });
});
