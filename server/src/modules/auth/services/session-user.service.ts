import { Injectable } from '@nestjs/common';
import { ROLE_PERMISSIONS } from '#common/enums';
import { AppException, ErrorCode } from '#common/exceptions';
import type { AuthUser } from '#common/interfaces';
import { UsersService } from '#modules/users';
import { assertCanSignIn } from '../utils/account-status.util.js';

/**
 * Checks the access token's user against the database on every authenticated request, so a
 * suspension, removal from a shop or role change applies at once instead of when the token expires.
 * Permissions always come from the user's current role.
 */
@Injectable()
export class SessionUserService {
  constructor(private readonly users: UsersService) {}

  async resolve(tokenUser: AuthUser): Promise<AuthUser> {
    const user = await this.users.findById(tokenUser.id);
    if (!user) throw new AppException(ErrorCode.AUTH_SESSION_REVOKED);
    assertCanSignIn(user);

    // Role or shop changed since sign-in: the app refreshes and gets a token for the new access.
    if (user.role !== tokenUser.role || (user.shopId ?? undefined) !== (tokenUser.shopId ?? undefined)) {
      throw new AppException(ErrorCode.AUTH_SESSION_REVOKED, {
        message: 'Your access has changed. Please sign in again.',
      });
    }

    return { ...tokenUser, permissions: ROLE_PERMISSIONS[user.role] ?? [] };
  }
}
