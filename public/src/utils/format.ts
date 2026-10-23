/**
 * Pure display formatting utilities.
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
 * Calculate line item price in paise from per-kg price and weight in grams.
 */
export const priceForGrams = (pricePerKgPaise: number, grams: number): number => {
  return Math.round((pricePerKgPaise * grams) / 1000);
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
