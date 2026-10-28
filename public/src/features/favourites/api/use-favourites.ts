import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { favouritesApi, type FavouriteItem } from './favourites.api';
import { favouriteKeys } from './keys';

export const useFavourites = () => {
  return useQuery<FavouriteItem[]>({
    queryKey: favouriteKeys.list(),
    queryFn: favouritesApi.getFavourites,
  });
};

export const useFavouriteIds = () => {
  return useQuery<string[]>({
    queryKey: favouriteKeys.ids(),
    queryFn: favouritesApi.getFavouriteIds,
  });
};

export const useIsFavourited = (productId: string) => {
  const { data: ids = [] } = useFavouriteIds();
  return ids.includes(productId);
};

export const useToggleFavourite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => favouritesApi.toggleFavourite(productId),
    onMutate: async (productId: string) => {
      await queryClient.cancelQueries({ queryKey: favouriteKeys.ids() });
      const prevIds = queryClient.getQueryData<string[]>(favouriteKeys.ids()) || [];

      const nextIds = prevIds.includes(productId)
        ? prevIds.filter((id) => id !== productId)
        : [...prevIds, productId];

      queryClient.setQueryData(favouriteKeys.ids(), nextIds);
      return { prevIds };
    },
    onError: (_err, _productId, context) => {
      if (context?.prevIds) {
        queryClient.setQueryData(favouriteKeys.ids(), context.prevIds);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: favouriteKeys.all });
    },
  });
};
