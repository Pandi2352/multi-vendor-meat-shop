import { VersioningType } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { AppConfigService } from '#config';

/** Routes become `/api/v1/...`. */
export const setupVersioning = (app: NestExpressApplication, config: AppConfigService): void => {
  app.setGlobalPrefix(config.app.apiPrefix);
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: config.app.apiVersion });
};
