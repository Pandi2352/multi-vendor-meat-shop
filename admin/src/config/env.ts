import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url().default('http://localhost:4000/api/v1'),
  VITE_APP_NAME: z.string().default('TN Meat Marketplace — Operations Dashboard'),
  /** Optional, dev only (admin/.env.development, gitignored): pre-fills the sign-in form. */
  VITE_DEV_LOGIN_EMAIL: z.string().email().optional(),
  VITE_DEV_LOGIN_PASSWORD: z.string().min(1).optional(),
  DEV: z.boolean().default(false),
  PROD: z.boolean().default(false),
});

const parsed = envSchema.safeParse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
  VITE_DEV_LOGIN_EMAIL: import.meta.env.VITE_DEV_LOGIN_EMAIL || undefined,
  VITE_DEV_LOGIN_PASSWORD: import.meta.env.VITE_DEV_LOGIN_PASSWORD || undefined,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
});

if (!parsed.success) {
  throw new Error(`Invalid admin environment configuration: ${JSON.stringify(parsed.error.format())}`);
}

export const env = parsed.data;

/**
 * Test login for local development. Credentials live only in a gitignored .env file, so they are
 * never in the source or in a production bundle.
 */
export const devLogin =
  env.DEV && env.VITE_DEV_LOGIN_EMAIL && env.VITE_DEV_LOGIN_PASSWORD
    ? { email: env.VITE_DEV_LOGIN_EMAIL, password: env.VITE_DEV_LOGIN_PASSWORD }
    : null;
