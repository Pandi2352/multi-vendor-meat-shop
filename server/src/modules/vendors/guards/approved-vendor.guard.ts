import { Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { METADATA_KEY } from '#common/constants';
import { VENDOR_ROLES, type Role } from '#common/enums';
import type { AppRequest } from '#common/interfaces';
import { VendorAccessService } from '../services/vendor-access.service.js';

const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Approval gate for routes marked `@RequireApprovedVendor()`. Vendor owners and staff may read
 * anything, but may only change things while their shop is APPROVED. Other roles (admins acting
 * on vendor routes) pass; their own role checks still apply.
 */
@Injectable()
export class ApprovedVendorGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly access: VendorAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<boolean | undefined>(
      METADATA_KEY.REQUIRE_APPROVED_VENDOR,
      [context.getHandler(), context.getClass()],
    );
    if (!required) return true;

    const request = context.switchToHttp().getRequest<AppRequest>();
    const { user } = request;
    if (!user || !(VENDOR_ROLES as readonly Role[]).includes(user.role)) return true;
    if (READ_METHODS.has(request.method)) return true;

    await this.access.assertCanSell(user.shopId);
    return true;
  }
}
