export const cartKeys = {
  all: ['cart'] as const,
  detail: () => [...cartKeys.all, 'detail'] as const,
  quote: (lat?: number, lng?: number) => [...cartKeys.all, 'quote', { lat, lng }] as const,
};
