import type { Provider } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AllExceptionsFilter } from '#common/filters';
import { PermissionsGuard, RolesGuard } from '#common/guards';
import { ResponseEnvelopeInterceptor, TimeoutInterceptor } from '#common/interceptors';
import { createValidationPipe } from '#common/pipes';
import { JwtAuthGuard } from '#modules/auth';

/**
 * Global pipeline. Guards run in order: rate limit → JWT auth → roles → permissions.
 * Registered as providers (not in main.ts) so e2e tests get exactly the same behaviour.
 */
export const APP_PROVIDERS: Provider[] = [
  { provide: APP_PIPE, useFactory: createValidationPipe },
  { provide: APP_FILTER, useClass: AllExceptionsFilter },
  { provide: APP_GUARD, useClass: ThrottlerGuard },
  { provide: APP_GUARD, useClass: JwtAuthGuard },
  { provide: APP_GUARD, useClass: RolesGuard },
  { provide: APP_GUARD, useClass: PermissionsGuard },
  { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
  { provide: APP_INTERCEPTOR, useClass: ResponseEnvelopeInterceptor },
];
