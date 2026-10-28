import { Role, UserStatus } from '#common/enums';

interface AccountLike {
  role: Role;
  status: UserStatus;
  shopId?: string | null;
}

/**
 * Who can join a shop as staff, checked when the owner invites and again when the invite is accepted
 * (the account may have changed in between): nobody yet, a customer, someone whose invite to this
 * shop is still pending, or this shop's own staff. Never an admin, a delivery partner, an owner,
 * another shop's staff, or a suspended or deleted account.
 */
export const canJoinShopAsStaff = (account: AccountLike | null, shopId: string): boolean => {
  if (!account) return true;
  if (account.status === UserStatus.SUSPENDED || account.status === UserStatus.DELETED) return false;
  if (account.role === Role.CUSTOMER) return true;
  if (account.role !== Role.VENDOR_STAFF) return false;
  return account.shopId === shopId || (!account.shopId && account.status === UserStatus.PENDING_VERIFICATION);
};
