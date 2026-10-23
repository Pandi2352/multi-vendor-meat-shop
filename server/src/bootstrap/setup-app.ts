import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppConfigService } from '#config';
import { AppLogger, createHttpLogger } from '#infra/logger';
import { setupSecurity } from './setup-security.js';
import { setupSwagger } from './setup-swagger.js';
import { setupVersioning } from './setup-versioning.js';

/** Everything main.ts and e2e tests need before `listen()` / `init()`. */
export const setupApp = (
  app: NestExpressApplication,
): { config: AppConfigService; logger: AppLogger } => {
  const config = app.get(AppConfigService);
  const logger = app.get(AppLogger);

  app.useLogger(logger);
  app.use(createHttpLogger(logger.pino));
  setupSecurity(app, config);
  setupVersioning(app, config);
  setupSwagger(app, config, logger);
  app.enableShutdownHooks();

  return { config, logger };
};
