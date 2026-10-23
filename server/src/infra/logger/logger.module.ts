import { Global, Module } from '@nestjs/common';
import { AppConfigService } from '#config';
import { AppLogger, PINO_LOGGER } from './app-logger.service.js';
import { createPinoLogger } from './create-pino-logger.js';

@Global()
@Module({
  providers: [
    {
      provide: PINO_LOGGER,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) =>
        createPinoLogger({
          name: config.app.name,
          level: config.logger.level,
          pretty: config.logger.pretty,
        }),
    },
    AppLogger,
  ],
  exports: [PINO_LOGGER, AppLogger],
})
export class LoggerModule {}
