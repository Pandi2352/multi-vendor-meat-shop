import type { Request } from 'express';
import type { Permission, Role } from '#common/enums';

/** Shape of `request.user` once authentication is in place. Never trust ids from the body over these. */
export interface AuthUser {
  id: string;
  role: Role;
  permissions: readonly Permission[];
  /** Set for vendor owners and staff. */
  shopId?: string;
}

export interface AppRequest extends Request {
  id: string;
  user?: AuthUser;
}
