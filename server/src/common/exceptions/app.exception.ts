import { HttpException, type HttpStatus } from '@nestjs/common';
import { ERROR_CATALOG } from './error-catalog.js';
import type { ErrorCode } from './error-code.enum.js';

export interface AppExceptionOptions {
  message?: string;
  status?: HttpStatus;
  details?: unknown;
  cause?: unknown;
}

/** The only exception type business code should throw. Status and message default from ERROR_CATALOG. */
export class AppException extends HttpException {
  readonly code: ErrorCode;
  readonly details?: unknown;

  constructor(code: ErrorCode, options: AppExceptionOptions = {}) {
    const definition = ERROR_CATALOG[code];
    const message = options.message ?? definition.message;
    super({ code, message, details: options.details }, options.status ?? definition.status, {
      cause: options.cause,
    });
    this.code = code;
    this.details = options.details;
  }
}
