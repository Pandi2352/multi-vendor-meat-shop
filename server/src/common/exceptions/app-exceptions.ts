import { AppException } from './app.exception.js';
import { ErrorCode } from './error-code.enum.js';

export class NotFoundAppException extends AppException {
  constructor(entity: string, id?: string) {
    super(ErrorCode.NOT_FOUND, {
      message: id ? `${entity} '${id}' not found` : `${entity} not found`,
      details: { entity, id },
    });
  }
}

export class ForbiddenAppException extends AppException {
  constructor(message?: string) {
    super(ErrorCode.FORBIDDEN, { message });
  }
}

export class ConflictAppException extends AppException {
  constructor(message?: string, details?: unknown) {
    super(ErrorCode.CONFLICT, { message, details });
  }
}

export class BusinessRuleException extends AppException {
  constructor(
    code: ErrorCode = ErrorCode.BUSINESS_RULE_VIOLATION,
    message?: string,
    details?: unknown,
  ) {
    super(code, { message, details });
  }
}
