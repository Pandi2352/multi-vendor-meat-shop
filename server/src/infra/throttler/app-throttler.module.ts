import { Module } from '@nestjs/common';
import { ThrottlerModule, seconds } from '@nestjs/throttler';
import { AppConfigService } from '#config';

/** Default rate limit. Tighten per route with `@Throttle({ default: { limit, ttl } })` (login, OTP). */
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: seconds(config.throttle.ttlSeconds),
            limit: config.throttle.limit,
          },
        ],
      }),
    }),
  ],
})
export class AppThrottlerModule {}
