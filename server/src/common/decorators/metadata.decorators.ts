import { SetMetadata } from '@nestjs/common';
import { METADATA_KEY } from '#common/constants';
import type { Permission, Role } from '#common/enums';

/** Skips authentication for a route or controller. */
export const Public = () => SetMetadata(METADATA_KEY.IS_PUBLIC, true);

/** Caller must have one of these roles. */
export const Roles = (...roles: Role[]) => SetMetadata(METADATA_KEY.ROLES, roles);

/** Caller must have every one of these permissions. */
export const Permissions = (...permissions: Permission[]) =>
  SetMetadata(METADATA_KEY.PERMISSIONS, permissions);

/** Returns the handler result as-is (file downloads, webhooks, health checks). */
export const SkipEnvelope = () => SetMetadata(METADATA_KEY.SKIP_ENVELOPE, true);
