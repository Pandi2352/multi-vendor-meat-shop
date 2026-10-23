/* eslint-disable no-console */
import { env } from '@/config/env';

export const logger = {
  log: (...args: unknown[]): void => {
    if (env.DEV) console.log(...args);
  },
  warn: (...args: unknown[]): void => {
    if (env.DEV) console.warn(...args);
  },
  error: (...args: unknown[]): void => {
    console.error(...args);
  },
  info: (...args: unknown[]): void => {
    if (env.DEV) console.info(...args);
  },
};
