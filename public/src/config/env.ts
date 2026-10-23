import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url().default('http://localhost:4000/api/v1'),
  VITE_APP_NAME: z.string().default('Tamil Nadu Meat Marketplace'),
  DEV: z.boolean().default(false),
  PROD: z.boolean().default(false),
});

const parsed = envSchema.safeParse({
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
});

if (!parsed.success) {
  throw new Error(`Invalid frontend environment configuration: ${JSON.stringify(parsed.error.format())}`);
}

export const env = parsed.data;
