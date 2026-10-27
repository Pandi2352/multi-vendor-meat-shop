export const HEADER = {
  REQUEST_ID: 'x-request-id',
  IDEMPOTENCY_KEY: 'idempotency-key',
} as const;

export const METADATA_KEY = {
  IS_PUBLIC: 'app:isPublic',
  ROLES: 'app:roles',
  PERMISSIONS: 'app:permissions',
  SKIP_ENVELOPE: 'app:skipEnvelope',
  REQUIRE_APPROVED_VENDOR: 'app:requireApprovedVendor',
} as const;

/** Admin portal pages that the server links to from emails. Keep in sync with admin `config/routes.ts`. */
export const ADMIN_APP_PATH = {
  ACCEPT_INVITE: '/accept-invite',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  LOGIN: '/login',
} as const;
