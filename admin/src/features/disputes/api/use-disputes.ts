import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { disputesApi, type DisputeQueryParams, type ResolveDisputePayload } from './disputes.api';
import { disputeKeys } from './keys';

export const useDisputes = (params: DisputeQueryParams = {}) =>
  useQuery({
    queryKey: disputeKeys.list(params),
    queryFn: () => disputesApi.list(params),
  });

export const useDispute = (id: string) =>
  useQuery({
    queryKey: disputeKeys.detail(id),
    queryFn: () => disputesApi.getById(id),
    enabled: Boolean(id),
  });

export const useResolveDispute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ResolveDisputePayload }) =>
      disputesApi.resolve(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: disputeKeys.all });
      queryClient.invalidateQueries({ queryKey: disputeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
