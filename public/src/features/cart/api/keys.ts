export const cartKeys = {
  all: ['cart'] as const,
  detail: () => [...cartKeys.all, 'detail'] as const,
  quote: (lat?: number, lng?: number, couponCode?: string) =>
    [...cartKeys.all, 'quote', { lat, lng, couponCode }] as const,
};
