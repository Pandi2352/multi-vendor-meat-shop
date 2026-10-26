export const userKeys = {
  all: ['admin-users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown> = {}) => [...userKeys.lists(), filters] as const,
  invitations: (status?: string) => [...userKeys.all, 'invitations', status ?? 'all'] as const,
  roles: () => [...userKeys.all, 'roles'] as const,
  permissions: () => [...userKeys.all, 'permissions'] as const,
};
