import type { Provider, Type } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { setupApp } from '#bootstrap';
import { AppModule } from '../../src/app.module.js';

export interface TestAppOptions {
  controllers?: Type<unknown>[];
  providers?: Provider[];
  imports?: Type<unknown>[];
}

/** Boots the real AppModule (same global pipes/filters/guards as production) plus optional test-only pieces. */
export const createTestApp = async (
  options: TestAppOptions = {},
): Promise<NestExpressApplication> => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule, ...(options.imports ?? [])],
    controllers: options.controllers ?? [],
    providers: options.providers ?? [],
  }).compile();

  const app = moduleRef.createNestApplication<NestExpressApplication>({ bufferLogs: true });
  setupApp(app);
  await app.init();
  return app;
};
