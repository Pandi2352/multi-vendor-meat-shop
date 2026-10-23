import { Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { METADATA_KEY } from '#common/constants';
import type { Permission } from '#common/enums';
import { AppException, ErrorCode } from '#common/exceptions';
import type { AppRequest } from '#common/interfaces';

/** Allows the request when no `@Permissions()` is set, or the user holds every listed permission. */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(METADATA_KEY.IS_PUBLIC, targets)) return true;

    const required = this.reflector.getAllAndOverride<Permission[] | undefined>(
      METADATA_KEY.PERMISSIONS,
      targets,
    );
    if (!required?.length) return true;

    const { user } = context.switchToHttp().getRequest<AppRequest>();
    if (!user) throw new AppException(ErrorCode.UNAUTHORIZED);

    const missing = required.filter((permission) => !user.permissions.includes(permission));
    if (missing.length) throw new AppException(ErrorCode.FORBIDDEN, { details: { missing } });
    return true;
  }
}
