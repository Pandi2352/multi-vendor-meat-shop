export interface CurrentUser {
  name: string;
  email: string;
  roleLabel: string;
}

/**
 * The signed-in admin. PLACEHOLDER until admin authentication is wired to `/auth/me`;
 * every consumer (user menu, greetings, audit labels) reads from here so only this hook changes.
 */
const PLACEHOLDER_USER: CurrentUser = {
  name: 'Operations Admin',
  email: 'ops@tnmeat.local',
  roleLabel: 'Administrator',
};

export const useCurrentUser = (): CurrentUser => PLACEHOLDER_USER;
