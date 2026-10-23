export const deliveryKeys = {
  all: ['delivery-tasks'] as const,
  lists: () => [...deliveryKeys.all, 'list'] as const,
  list: (params?: { page?: number; limit?: number; status?: string; partnerId?: string; shopId?: string; date?: string }) =>
    [...deliveryKeys.lists(), params] as const,
  detail: (id: string) => [...deliveryKeys.all, 'detail', id] as const,
};
