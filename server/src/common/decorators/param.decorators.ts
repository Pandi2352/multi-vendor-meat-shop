import { Param, ParseUUIDPipe, createParamDecorator, type ExecutionContext } from '@nestjs/common';
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

/** `@CurrentShop()` → the authenticated vendor user's shopId. */
export const CurrentShop = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const { user } = ctx.switchToHttp().getRequest<AppRequest>();
  if (!user) throw new AppException(ErrorCode.UNAUTHORIZED);
  if (!user.shopId) {
    throw new AppException(ErrorCode.FORBIDDEN, {
      message: 'Authenticated user is not linked to a shop',
    });
  }
  return user.shopId;
});

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
