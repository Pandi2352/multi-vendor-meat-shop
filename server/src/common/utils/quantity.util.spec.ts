import { describe, expect, it } from 'vitest';
import {
  formatWeight,
  gramsToKg,
  isGrams,
  isValidStep,
  isWithinVariance,
  kgToGrams,
  priceForGrams,
} from './quantity.util.js';

describe('quantity.util', () => {
  it('converts kg and grams', () => {
    expect(kgToGrams(1.25)).toBe(1250);
    expect(gramsToKg(750)).toBe(0.75);
  });

  it('validates positive integer grams', () => {
    expect(isGrams(500)).toBe(true);
    expect(isGrams(0)).toBe(false);
    expect(isGrams(12.5)).toBe(false);
  });

  it('prices a weight from price per kg', () => {
    expect(priceForGrams(28_000, 500)).toBe(14_000);
    expect(priceForGrams(28_000, 333)).toBe(9324);
  });

  it('formats weights', () => {
    expect(formatWeight(750)).toBe('750 g');
    expect(formatWeight(1000)).toBe('1 kg');
    expect(formatWeight(1500)).toBe('1.5 kg');
    expect(formatWeight(1234)).toBe('1.23 kg');
  });

  it('checks packed weight variance', () => {
    expect(isWithinVariance(500, 530, 10)).toBe(true);
    expect(isWithinVariance(500, 560, 10)).toBe(false);
    expect(isWithinVariance(500, 450, 10)).toBe(true);
  });

  it('checks weight steps', () => {
    expect(isValidStep(750, 250)).toBe(true);
    expect(isValidStep(600, 250)).toBe(false);
    expect(isValidStep(250, 250, 500)).toBe(false);
  });
});
