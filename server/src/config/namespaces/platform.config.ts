import { registerAs } from '@nestjs/config';
import { getEnv } from '../env.validation.js';

export const throttleConfig = registerAs('throttle', () => {
  const env = getEnv();
  return { ttlSeconds: env.THROTTLE_TTL_SECONDS, limit: env.THROTTLE_LIMIT };
});

export const swaggerConfig = registerAs('swagger', () => {
  const env = getEnv();
  return {
    enabled: env.SWAGGER_ENABLED,
    path: env.SWAGGER_PATH,
    writeFile: env.SWAGGER_WRITE_FILE,
  };
});

export const loggerConfig = registerAs('logger', () => {
  const env = getEnv();
  return { level: env.LOG_LEVEL, pretty: env.LOG_PRETTY };
});
