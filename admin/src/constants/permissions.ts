import type { components } from '@/types/api.generated';

/** What an account may do. The API enforces these; the app uses them to hide actions. */
export type Permission = components['schemas']['Permission'];
