export const favouriteKeys = {
  all: ['favourites'] as const,
  list: () => [...favouriteKeys.all, 'list'] as const,
  ids: () => [...favouriteKeys.all, 'ids'] as const,
};
