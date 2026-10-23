import { Module } from '@nestjs/common';
import { AppConfigModule } from '#config';
import { DatabaseModule } from '#database';
import { LoggerModule } from '#infra/logger';
import { AppThrottlerModule } from '#infra/throttler';
import { HealthModule } from '#modules/health';
import { APP_PROVIDERS } from './app.providers.js';

@Module({
  imports: [AppConfigModule, LoggerModule, DatabaseModule, AppThrottlerModule, HealthModule],
  providers: APP_PROVIDERS,
})
export class AppModule {}
