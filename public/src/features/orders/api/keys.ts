export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    [...orderKeys.lists(), params] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const,
  deliveryTask: (orderId: string) => [...orderKeys.all, 'delivery', orderId] as const,
};
