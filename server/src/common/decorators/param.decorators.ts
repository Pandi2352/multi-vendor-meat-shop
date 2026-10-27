import { Param, ParseUUIDPipe, createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { STAFF_ROLES, type Role } from '#common/enums';
import { AppException, ErrorCode } from '#common/exceptions';
import type { AppRequest, AuthUser } from '#common/interfaces';

/** `@CurrentUser()` → AuthUser, `@CurrentUser('id')` → the user's id. Throws when unauthenticated. */
export const CurrentUser = createParamDecorator(
  (field: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const { user } = ctx.switchToHttp().getRequest<AppRequest>();
    if (!user) throw new AppException(ErrorCode.UNAUTHORIZED);
    return field ? user[field] : user;
  },
);

/**
 * `@CurrentShop()` → the shop a request acts on. Vendor owners and staff always get the shop on
 * their account; anything they send is ignored. Only the admin team may name a shop, via the
 * `x-shop-id` header or `?shopId=`.
 */
export const CurrentShop = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<AppRequest>();
  const requested = (req.headers['x-shop-id'] as string | undefined) || (req.query?.shopId as string | undefined);
  return resolveShopId(req.user, requested);
});

/** The rule behind `@CurrentShop()`, kept separate so it can be unit-tested. */
export const resolveShopId = (user: AuthUser | undefined, requestedShopId?: string): string => {
  if (!user) throw new AppException(ErrorCode.UNAUTHORIZED);
  if (user.shopId) return user.shopId;

  if (!(STAFF_ROLES as readonly Role[]).includes(user.role)) {
    throw new AppException(ErrorCode.FORBIDDEN, { message: 'Your account isn’t linked to a shop.' });
  }
  if (requestedShopId && isUUID(requestedShopId)) return requestedShopId;

  throw new AppException(ErrorCode.FORBIDDEN, { message: 'Choose a shop: send its id in the x-shop-id header.' });
};

/** Route param that must be a UUID v7: `@UuidParam('productId') productId: string`. */
export const UuidParam = (name = 'id') =>
  Param(
    name,
    new ParseUUIDPipe({
      version: '7',
      exceptionFactory: () =>
        new AppException(ErrorCode.VALIDATION_FAILED, {
          message: `${name} must be a valid id`,
          details: [{ field: name, messages: [`${name} must be a UUID v7`] }],
        }),
    }),
  );
