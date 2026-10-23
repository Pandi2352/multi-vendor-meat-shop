import { registerAs } from '@nestjs/config';
import { getEnv } from '../env.validation.js';

export const databaseConfig = registerAs('database', () => {
  const env = getEnv();
  return {
    uri: env.MONGODB_URI,
    autoIndex: env.MONGODB_AUTO_INDEX,
    maxPoolSize: env.MONGODB_MAX_POOL_SIZE,
    serverSelectionTimeoutMs: env.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
  };
});
