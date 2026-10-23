export const vendorOrderKeys = {
  all: ['vendor-orders'] as const,
  lists: () => [...vendorOrderKeys.all, 'list'] as const,
  list: (params?: { page?: number; limit?: number; status?: string; date?: string }) =>
    [...vendorOrderKeys.lists(), params] as const,
  detail: (id: string) => [...vendorOrderKeys.all, 'detail', id] as const,
};
