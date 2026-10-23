import { Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { METADATA_KEY } from '#common/constants';
import type { Role } from '#common/enums';
import { AppException, ErrorCode } from '#common/exceptions';
import type { AppRequest } from '#common/interfaces';

/** Allows the request when no `@Roles()` is set, or the user has one of the listed roles. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(METADATA_KEY.IS_PUBLIC, targets)) return true;

    const roles = this.reflector.getAllAndOverride<Role[] | undefined>(METADATA_KEY.ROLES, targets);
    if (!roles?.length) return true;

    const { user } = context.switchToHttp().getRequest<AppRequest>();
    if (!user) throw new AppException(ErrorCode.UNAUTHORIZED);
    if (!roles.includes(user.role)) throw new AppException(ErrorCode.FORBIDDEN);
    return true;
  }
}
