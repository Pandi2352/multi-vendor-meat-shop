export const IST_TIMEZONE = 'Asia/Kolkata';
export const CURRENCY = 'INR';
export const PAISE_PER_RUPEE = 100;
export const GRAMS_PER_KG = 1000;
export const BASIS_POINTS_PER_UNIT = 10_000;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const GEO = {
  DEFAULT_RADIUS_KM: 5,
  MAX_RADIUS_KM: 50,
  EARTH_RADIUS_KM: 6371,
} as const;

export const LIMITS = {
  SEARCH_QUERY_MAX_LENGTH: 100,
  MAX_PRODUCT_IMAGES: 8,
  MAX_CART_ITEMS: 30,
  MAX_ADDRESSES: 10,
} as const;
