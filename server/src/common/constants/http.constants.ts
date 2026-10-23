export const HEADER = {
  REQUEST_ID: 'x-request-id',
  IDEMPOTENCY_KEY: 'idempotency-key',
} as const;

export const METADATA_KEY = {
  IS_PUBLIC: 'app:isPublic',
  ROLES: 'app:roles',
  PERMISSIONS: 'app:permissions',
  SKIP_ENVELOPE: 'app:skipEnvelope',
} as const;
