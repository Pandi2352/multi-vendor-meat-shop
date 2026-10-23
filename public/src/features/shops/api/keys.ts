export const shopKeys = {
  all: ['shops'] as const,
  lists: () => [...shopKeys.all, 'list'] as const,
  nearby: (lat: number, lng: number, radiusKm?: number) =>
    [...shopKeys.all, 'nearby', { lat, lng, radiusKm }] as const,
  detail: (id: string) => [...shopKeys.all, 'detail', id] as const,
};
