export const vendorKeys = {
  all: ['admin-vendors'] as const,
  lists: () => [...vendorKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown> = {}) => [...vendorKeys.lists(), filters] as const,
  detail: (id: string) => [...vendorKeys.all, 'detail', id] as const,
};
