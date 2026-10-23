import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from './categories.api';
import { categoryKeys } from './keys';

export const useCategoriesTree = () => {
  return useQuery({
    queryKey: categoryKeys.tree(),
    queryFn: categoriesApi.listTree,
  });
};
