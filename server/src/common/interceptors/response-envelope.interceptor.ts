import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, type Observable } from 'rxjs';
import { METADATA_KEY } from '#common/constants';
import { PaginatedResult } from '#common/dto';

export interface SuccessEnvelope<T> {
  success: true;
  data: T;
  meta?: unknown;
}

/** Wraps every successful response as `{ success: true, data, meta? }`. */
@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const skip = this.reflector.getAllAndOverride<boolean>(METADATA_KEY.SKIP_ENVELOPE, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return next.handle();

    return next.handle().pipe(
      map((result: unknown): SuccessEnvelope<unknown> => {
        if (result instanceof PaginatedResult)
          return { success: true, data: result.items, meta: result.meta };
        return { success: true, data: result ?? null };
      }),
    );
  }
}
