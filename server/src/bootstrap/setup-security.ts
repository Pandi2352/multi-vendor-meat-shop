import type { NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';
import helmet from 'helmet';
import { HEADER } from '#common/constants';
import type { AppConfigService } from '#config';

export const setupSecurity = (app: NestExpressApplication, config: AppConfigService): void => {
  if (config.app.trustProxy) app.set('trust proxy', 1);

  // Swagger UI needs inline scripts; the strict CSP only applies where Swagger is not served.
  app.use(helmet({ contentSecurityPolicy: config.swagger.enabled ? false : undefined }));
  app.use(compression());
  app.useBodyParser('json', { limit: config.app.bodyLimit });
  app.useBodyParser('urlencoded', { limit: config.app.bodyLimit, extended: true });

  // `CORS_ORIGINS=*` allows any origin. It reflects the request origin (`true`) instead of sending a
  // literal "*", which browsers reject when credentials are allowed.
  const allowAnyOrigin = config.app.corsOrigins.includes('*');
  app.enableCors({
    origin: allowAnyOrigin ? true : config.app.corsOrigins,
    credentials: true,
    exposedHeaders: [HEADER.REQUEST_ID],
  });
};
