import { GRAMS_PER_KG } from '#common/constants';
import type { Paise } from './money.util.js';

/** All weights are stored as integer grams. */
export type Grams = number;

export const isGrams = (value: unknown): value is Grams =>
  Number.isSafeInteger(value) && (value as number) > 0;

export const kgToGrams = (kg: number): Grams => Math.round(kg * GRAMS_PER_KG);

export const gramsToKg = (grams: Grams): number => grams / GRAMS_PER_KG;

/** Line price for a weight, given the price per kg. Rounded to the nearest paisa. */
export const priceForGrams = (pricePerKgPaise: Paise, grams: Grams): Paise =>
  Math.round((pricePerKgPaise * grams) / GRAMS_PER_KG);

/** `formatWeight(750)` → `750 g`, `formatWeight(1500)` → `1.5 kg`. */
export const formatWeight = (grams: Grams): string => {
  if (grams < GRAMS_PER_KG) return `${grams} g`;
  const kg = Math.round((grams / GRAMS_PER_KG) * 100) / 100;
  return `${kg} kg`;
};

/** True when the packed weight is within ±variancePercent of the ordered weight. */
export const isWithinVariance = (target: Grams, actual: Grams, variancePercent: number): boolean =>
  Math.abs(actual - target) <= (target * variancePercent) / 100;

/** True when `grams` is at least `min` and a multiple of `step` (e.g. 250 g steps). */
export const isValidStep = (grams: Grams, step: Grams, min: Grams = step): boolean =>
  grams >= min && grams % step === 0;
