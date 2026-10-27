import { SetMetadata, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { METADATA_KEY } from '#common/constants';
import type { Permission, Role } from '#common/enums';

/** Skips authentication for a route or controller. */
export const Public = () => SetMetadata(METADATA_KEY.IS_PUBLIC, true);

/** Caller must have one of these roles. */
export const Roles = (...roles: Role[]) => SetMetadata(METADATA_KEY.ROLES, roles);

/** Caller must have every one of these permissions. */
export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(METADATA_KEY.PERMISSIONS, permissions);

/** Composite decorator: bearer auth + optional role restrictions. */
export const Auth = (...roles: Role[]) =>
  applyDecorators(
    ...(roles.length ? [Roles(...roles)] : []),
    ApiBearerAuth(),
  );

/** Returns the handler result as-is (file downloads, webhooks, health checks). */
export const SkipEnvelope = () => SetMetadata(METADATA_KEY.SKIP_ENVELOPE, true);

/**
 * Vendor owners/staff may only CHANGE things on this route while their shop is approved.
 * Reads stay open so a suspended shop can still see its data. Pass `false` on a handler to opt out.
 * Enforced by ApprovedVendorGuard (vendors module); admins acting on vendor routes are not affected.
 */
export const RequireApprovedVendor = (required = true) =>
  SetMetadata(METADATA_KEY.REQUIRE_APPROVED_VENDOR, required);
