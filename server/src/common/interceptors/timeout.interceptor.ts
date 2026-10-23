import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { TimeoutError, catchError, throwError, timeout, type Observable } from 'rxjs';
import { AppException, ErrorCode } from '#common/exceptions';
import { AppConfigService } from '#config';

/** Fails requests that run longer than REQUEST_TIMEOUT_MS. */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly config: AppConfigService) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      timeout(this.config.app.requestTimeoutMs),
      catchError((error: unknown) =>
        throwError(() =>
          error instanceof TimeoutError ? new AppException(ErrorCode.REQUEST_TIMEOUT) : error,
        ),
      ),
    );
  }
}
