import { registerAs } from '@nestjs/config';
import { NodeEnv, getEnv } from '../env.validation.js';

export const appConfig = registerAs('app', () => {
  const env = getEnv();
  return {
    env: env.NODE_ENV,
    isProduction: env.NODE_ENV === NodeEnv.PRODUCTION,
    isTest: env.NODE_ENV === NodeEnv.TEST,
    name: env.APP_NAME,
    displayName: env.APP_DISPLAY_NAME,
    port: env.PORT,
    apiPrefix: env.API_PREFIX,
    apiVersion: env.API_VERSION,
    requestTimeoutMs: env.REQUEST_TIMEOUT_MS,
    bodyLimit: env.BODY_LIMIT,
    trustProxy: env.TRUST_PROXY,
    /** No trailing slash, so links can be built as `${adminAppUrl}/path`. */
    adminAppUrl: env.ADMIN_APP_URL.replace(/\/+$/, ''),
    corsOrigins: env.CORS_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  };
});
