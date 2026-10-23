import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartApi, type AddCartItemBody } from './cart.api';
import { cartKeys } from './keys';

export const useCart = () => {
  return useQuery({
    queryKey: cartKeys.detail(),
    queryFn: cartApi.getCart,
  });
};

export const useCheckoutQuote = (lat?: number, lng?: number, enabled = true) => {
  return useQuery({
    queryKey: cartKeys.quote(lat, lng),
    queryFn: () => cartApi.getCheckoutQuote({ lat, lng }),
    enabled,
  });
};

export const useAddCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: AddCartItemBody) => cartApi.addItem(body),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.detail(), data);
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => cartApi.removeItem(productId),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.detail(), data);
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.all });
    },
  });
};
