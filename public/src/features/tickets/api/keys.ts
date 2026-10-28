export const ticketKeys = {
  all: ['tickets'] as const,
  list: () => [...ticketKeys.all, 'list'] as const,
  detail: (id: string) => [...ticketKeys.all, 'detail', id] as const,
  forOrder: (orderId: string) => [...ticketKeys.all, 'order', orderId] as const,
};
