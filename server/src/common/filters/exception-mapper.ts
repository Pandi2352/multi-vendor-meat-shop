import { HttpException, HttpStatus } from '@nestjs/common';
import { AppException, ERROR_CATALOG, ErrorCode } from '#common/exceptions';

export interface MappedError {
  status: number;
  code: ErrorCode;
  message: string;
  details?: unknown;
  /** True for unexpected failures that need a stack trace in the logs. */
  unexpected: boolean;
}

const STATUS_TO_CODE: Partial<Record<number, ErrorCode>> = {
  [HttpStatus.BAD_REQUEST]: ErrorCode.BAD_REQUEST,
  [HttpStatus.UNAUTHORIZED]: ErrorCode.UNAUTHORIZED,
  [HttpStatus.FORBIDDEN]: ErrorCode.FORBIDDEN,
  [HttpStatus.NOT_FOUND]: ErrorCode.NOT_FOUND,
  [HttpStatus.REQUEST_TIMEOUT]: ErrorCode.REQUEST_TIMEOUT,
  [HttpStatus.CONFLICT]: ErrorCode.CONFLICT,
  [HttpStatus.PAYLOAD_TOO_LARGE]: ErrorCode.PAYLOAD_TOO_LARGE,
  [HttpStatus.TOO_MANY_REQUESTS]: ErrorCode.TOO_MANY_REQUESTS,
  [HttpStatus.SERVICE_UNAVAILABLE]: ErrorCode.SERVICE_UNAVAILABLE,
};

const fromCode = (code: ErrorCode, overrides: Partial<MappedError> = {}): MappedError => ({
  status: ERROR_CATALOG[code].status,
  code,
  message: ERROR_CATALOG[code].message,
  unexpected: false,
  ...overrides,
});

const mapHttpException = (exception: HttpException): MappedError => {
  const status: HttpStatus = exception.getStatus();
  const response = exception.getResponse();
  const body =
    typeof response === 'object' && response !== null ? (response as Record<string, unknown>) : {};
  const rawMessage = typeof response === 'string' ? response : body.message;
  const message = Array.isArray(rawMessage)
    ? rawMessage.join(', ')
    : typeof rawMessage === 'string'
      ? rawMessage
      : exception.message;

  const isServerError = status >= HttpStatus.INTERNAL_SERVER_ERROR;
  let code =
    STATUS_TO_CODE[status] ?? (isServerError ? ErrorCode.INTERNAL_ERROR : ErrorCode.BAD_REQUEST);
  if (status === HttpStatus.NOT_FOUND && /^Cannot [A-Z]+ /.test(message))
    code = ErrorCode.ROUTE_NOT_FOUND;

  // Non-standard bodies (e.g. Terminus health results) are passed through as details.
  const details = 'message' in body ? body.details : Object.keys(body).length ? body : undefined;
  return { status, code, message, details, unexpected: isServerError };
};

interface MongoLikeError {
  name?: string;
  message?: string;
  code?: number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { path: string; message: string }>;
  path?: string;
}

const mapMongoError = (error: MongoLikeError): MappedError | null => {
  if (error.code === 11000) {
    const fields = Object.keys(error.keyValue ?? {});
    return fromCode(ErrorCode.DUPLICATE_VALUE, {
      message: fields.length
        ? `${fields.join(', ')} already exists`
        : ERROR_CATALOG.DUPLICATE_VALUE.message,
      details: { fields },
    });
  }
  if (error.name === 'ValidationError' && error.errors) {
    return fromCode(ErrorCode.VALIDATION_FAILED, {
      details: Object.values(error.errors).map((e) => ({ field: e.path, messages: [e.message] })),
    });
  }
  if (error.name === 'CastError') {
    return fromCode(ErrorCode.BAD_REQUEST, {
      message: `Invalid value for ${error.path ?? 'field'}`,
    });
  }
  if (error.code === 20 || /Transaction numbers are only allowed/.test(error.message ?? '')) {
    return fromCode(ErrorCode.TRANSACTION_NOT_SUPPORTED, { unexpected: true });
  }
  return null;
};

/** Converts anything thrown into the API's single error shape. */
export const mapException = (exception: unknown): MappedError => {
  if (exception instanceof AppException) {
    const status = exception.getStatus();
    const { message } = exception.getResponse() as { message: string };
    return {
      status,
      code: exception.code,
      message,
      details: exception.details,
      unexpected: status >= 500,
    };
  }
  if (exception instanceof HttpException) return mapHttpException(exception);
  if (typeof exception === 'object' && exception !== null) {
    const mapped = mapMongoError(exception);
    if (mapped) return mapped;
  }
  return fromCode(ErrorCode.INTERNAL_ERROR, { unexpected: true });
};
