import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { setupApp } from '#bootstrap';
import { AppModule } from './app.module.js';

const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
const { config, logger } = setupApp(app);

await app.listen(config.app.port);

const baseUrl = `http://localhost:${config.app.port}`;
logger.log(
  `API ready at ${baseUrl}/${config.app.apiPrefix}/v${config.app.apiVersion}`,
  'Bootstrap',
);
if (config.swagger.enabled) logger.log(`Swagger at ${baseUrl}/${config.swagger.path}`, 'Bootstrap');
