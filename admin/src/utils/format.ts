/**
 * Pure display formatting utilities for admin/vendor portal.
 * Golden rule: Never inline toFixed / toLocaleString in React components.
 */

/**
 * Format integer paise into Indian Rupee string (₹).
 * E.g., 24000 -> "₹240", 24050 -> "₹240.50".
 */
export const formatINR = (paise: number): string => {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: rupees % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rupees);
};

/**
 * Format integer grams into clean weight string.
 * E.g., 500 -> "500 g", 1000 -> "1 kg", 1250 -> "1.25 kg".
 */
export const formatWeight = (grams: number): string => {
  if (grams < 1000) {
    return `${grams} g`;
  }
  const kg = grams / 1000;
  return `${kg % 1 === 0 ? kg : kg.toFixed(2).replace(/\.?0+$/, '')} kg`;
};

/**
 * Calculate weight variance percentage between ordered grams and actual grams.
 * Returns signed percentage (e.g. +3.5 or -2.0).
 */
export const calculateWeightVariance = (orderedGrams: number, actualGrams: number): number => {
  if (orderedGrams <= 0) return 0;
  const diff = actualGrams - orderedGrams;
  return Number(((diff / orderedGrams) * 100).toFixed(1));
};

/**
 * Format ISO date string into Indian Standard Time display string.
 */
export const formatDateIST = (isoString: string): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

/**
 * Format short time string (e.g. "10:30 AM").
 */
export const formatTimeIST = (isoString: string): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

/** Whole numbers with Indian digit grouping: 125000 → "1,25,000". */
export const formatNumber = (value: number): string => new Intl.NumberFormat('en-IN').format(value);

/** "27 Oct" style day label for an IST `YYYY-MM-DD` date. */
export const formatDayIST = (isoDate: string): string =>
  new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short' }).format(
    new Date(`${isoDate}T12:00:00+05:30`),
  );
