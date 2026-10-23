import { BASIS_POINTS_PER_UNIT, CURRENCY, PAISE_PER_RUPEE } from '#common/constants';

/** All money is stored and calculated as integer paise. */
export type Paise = number;

const inrFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: CURRENCY });
const inrWholeFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 0,
});

export const isPaise = (value: unknown): value is Paise => Number.isSafeInteger(value);

export const toPaise = (rupees: number): Paise => Math.round(rupees * PAISE_PER_RUPEE);

export const fromPaise = (paise: Paise): number => paise / PAISE_PER_RUPEE;

export const sumPaise = (...amounts: Paise[]): Paise =>
  amounts.reduce((total, amount) => total + amount, 0);

/** 1 basis point = 0.01 %. `applyBasisPoints(10000, 1250)` → 1250 (12.5 % of ₹100). */
export const applyBasisPoints = (amount: Paise, basisPoints: number): Paise =>
  Math.round((amount * basisPoints) / BASIS_POINTS_PER_UNIT);

export const percentToBasisPoints = (percent: number): number => Math.round(percent * 100);

/**
 * Splits `total` across `weights` without losing or inventing paise (largest remainder method).
 * Used for distributing order-level discounts or fees across line items.
 */
export const splitProportionally = (total: Paise, weights: readonly number[]): Paise[] => {
  const weightSum = weights.reduce((sum, w) => sum + w, 0);
  if (weightSum <= 0) return weights.map(() => 0);

  const raw = weights.map((w) => (total * w) / weightSum);
  const result = raw.map(Math.floor);
  let remainder = total - result.reduce((sum, v) => sum + v, 0);

  const byFraction = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);

  for (const { index } of byFraction) {
    if (remainder <= 0) break;
    result[index] += 1;
    remainder -= 1;
  }
  return result;
};

/** `formatINR(12550)` → `₹125.50`; `formatINR(12500, { whole: true })` → `₹125`. */
export const formatINR = (paise: Paise, options: { whole?: boolean } = {}): string =>
  (options.whole ? inrWholeFormatter : inrFormatter).format(fromPaise(paise));
