import { Catch, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import type { AppRequest } from '#common/interfaces';
import { AppConfigService } from '#config';
import { AppLogger } from '#infra/logger';
import { mapException } from './exception-mapper.js';

/** Every error leaves the API as `{ success: false, error: { code, message, details, requestId, path, timestamp } }`. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly config: AppConfigService,
    private readonly logger: AppLogger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<AppRequest>();
    const response = http.getResponse<Response>();
    const error = mapException(exception);

    if (error.unexpected) {
      this.logger.error(
        exception instanceof Error ? exception : String(exception),
        undefined,
        AllExceptionsFilter.name,
      );
    }

    const hideInternals = error.unexpected && this.config.app.isProduction;
    response.status(error.status).json({
      success: false,
      error: {
        code: error.code,
        message: hideInternals ? 'Something went wrong' : error.message,
        details: hideInternals ? undefined : error.details,
        requestId: request.id,
        path: request.originalUrl,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
