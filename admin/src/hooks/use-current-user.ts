import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { tokenStorage } from '@/lib/token-storage';

export interface CurrentUser {
  id?: string;
  name: string;
  email: string;
  roleLabel: string;
  role?: string;
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Administrator',
  ADMIN: 'Administrator',
  OPS_MANAGER: 'Operations Manager',
  VENDOR: 'Vendor / Butcher',
  DELIVERY_PARTNER: 'Delivery Partner',
  CUSTOMER: 'Customer',
};

const formatRoleLabel = (role?: string): string => {
  if (!role) return 'Administrator';
  return ROLE_LABELS[role] || role.replace(/_/g, ' ');
};

const PLACEHOLDER_USER: CurrentUser = {
  name: 'Operations Admin',
  email: 'ops@tnmeat.local',
  roleLabel: 'Administrator',
};

/**
 * Returns the currently authenticated user.
 * Reads instantly from cached localStorage and syncs with /auth/me when token is present.
 */
export const useCurrentUser = (): CurrentUser => {
  const token = tokenStorage.getAccessToken();
  const cachedUser = tokenStorage.getUser<Partial<CurrentUser>>();

  const { data: serverUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const user = await http.get<{
        id: string;
        name?: string;
        email?: string;
        role: string;
      }>('/auth/me');
      tokenStorage.setUser(user);
      return user;
    },
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
  });

  const active = serverUser || cachedUser;

  if (active && (active.email || active.name)) {
    return {
      id: active.id,
      name: active.name || active.email?.split('@')[0] || 'User',
      email: active.email || '',
      role: active.role,
      roleLabel: formatRoleLabel(active.role),
    };
  }

  return PLACEHOLDER_USER;
};
