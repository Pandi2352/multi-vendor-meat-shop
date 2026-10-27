import { ROLE_LABELS, type UserRole } from '@/constants/roles';
import { useSession } from './use-session';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
}

/**
 * The signed-in user for display (user menu, greetings). Only rendered inside `RequireSession`,
 * so a session always exists; returns null for the brief moment before it does.
 */
export const useCurrentUser = (): CurrentUser | null => {
  const session = useSession();
  if (session.status !== 'authenticated') return null;

  const { user } = session;
  return {
    id: user.id,
    name: user.name?.trim() || user.email.split('@')[0],
    email: user.email,
    role: user.role,
    roleLabel: ROLE_LABELS[user.role] ?? user.role,
  };
};
