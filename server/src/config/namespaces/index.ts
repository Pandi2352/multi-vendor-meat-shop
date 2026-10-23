import { appConfig } from './app.config.js';
import { authConfig } from './auth.config.js';
import { businessConfig } from './business.config.js';
import { databaseConfig } from './database.config.js';
import { mailConfig } from './mail.config.js';
import { loggerConfig, swaggerConfig, throttleConfig } from './platform.config.js';

export {
  appConfig,
  authConfig,
  businessConfig,
  databaseConfig,
  mailConfig,
  loggerConfig,
  swaggerConfig,
  throttleConfig,
};

export const CONFIG_NAMESPACES = [
  appConfig,
  authConfig,
  businessConfig,
  databaseConfig,
  mailConfig,
  loggerConfig,
  swaggerConfig,
  throttleConfig,
];
