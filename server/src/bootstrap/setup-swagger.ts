import { writeFileSync } from 'node:fs';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { AppConfigService } from '#config';
import type { AppLogger } from '#infra/logger';

export const SWAGGER_FILE = 'swagger.json';

/** Serves Swagger UI at `/<SWAGGER_PATH>` and optionally writes swagger.json for frontend type generation. */
export const setupSwagger = (
  app: NestExpressApplication,
  config: AppConfigService,
  logger: AppLogger,
): void => {
  if (!config.swagger.enabled) return;

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle(config.app.name)
      .setDescription(
        'Tamil Nadu multi-vendor meat marketplace API. Money is in paise, weight in grams, ids are UUID v7.',
      )
      .setVersion(`v${config.app.apiVersion}`)
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
      .build(),
  );

  SwaggerModule.setup(config.swagger.path, app, document, {
    jsonDocumentUrl: `${config.swagger.path}/json`,
    swaggerOptions: { persistAuthorization: true, displayRequestDuration: true },
  });

  if (config.swagger.writeFile) {
    writeFileSync(SWAGGER_FILE, JSON.stringify(document, null, 2));
    logger.log(`Wrote ${SWAGGER_FILE}`, 'Swagger');
  }
};
