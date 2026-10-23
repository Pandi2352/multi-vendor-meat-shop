import { Module } from '@nestjs/common';
import { AppConfigModule } from '#config';
import { DatabaseModule } from '#database';
import { LoggerModule } from '#infra/logger';
import { MailModule } from '#infra/mail';
import { AppThrottlerModule } from '#infra/throttler';
import { AuthModule } from '#modules/auth';
import { HealthModule } from '#modules/health';
import { ShopsModule } from '#modules/shops';
import { UsersModule } from '#modules/users';
import { VendorsModule } from '#modules/vendors';
import { APP_PROVIDERS } from './app.providers.js';

@Module({
  imports: [
    AppConfigModule,
    LoggerModule,
    MailModule,
    DatabaseModule,
    AppThrottlerModule,
    HealthModule,
    UsersModule,
    AuthModule,
    VendorsModule,
    ShopsModule,
  ],
  providers: APP_PROVIDERS,
})
export class AppModule {}
