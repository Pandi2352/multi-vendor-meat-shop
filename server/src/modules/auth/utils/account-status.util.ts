import { UserStatus } from '#common/enums';
import { AppException, ErrorCode } from '#common/exceptions';

/**
 * The one status gate for every way of getting or using a session (password, code, invite, refresh,
 * and each authenticated request): suspended → ACCOUNT_SUSPENDED; pending (invited / applied, not
 * activated) → ACCOUNT_PENDING; deleted → treated as unknown credentials.
 */
export const assertCanSignIn = (user: { status: UserStatus }): void => {
  if (user.status === UserStatus.ACTIVE) return;
  if (user.status === UserStatus.SUSPENDED) throw new AppException(ErrorCode.ACCOUNT_SUSPENDED);
  if (user.status === UserStatus.PENDING_VERIFICATION) throw new AppException(ErrorCode.ACCOUNT_PENDING);
  throw new AppException(ErrorCode.AUTH_INVALID_CREDENTIALS, { message: 'Invalid email or password' });
};
