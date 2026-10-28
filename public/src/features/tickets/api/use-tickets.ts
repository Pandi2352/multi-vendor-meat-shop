import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ticketsApi, type CreateTicketBody } from './tickets.api';
import { ticketKeys } from './keys';
import { orderKeys } from '@/features/orders/api/keys';

export const useCustomerTickets = () => {
  return useQuery({
    queryKey: ticketKeys.list(),
    queryFn: ticketsApi.list,
  });
};

export const useCustomerTicket = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn: () => ticketsApi.detail(id),
    enabled: Boolean(id) && enabled,
  });
};

export const useOrderTicket = (orderId: string, enabled = true) => {
  return useQuery({
    queryKey: ticketKeys.forOrder(orderId),
    queryFn: () => ticketsApi.getForOrder(orderId),
    enabled: Boolean(orderId) && enabled,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTicketBody) => ticketsApi.create(body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(data.orderId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
};
