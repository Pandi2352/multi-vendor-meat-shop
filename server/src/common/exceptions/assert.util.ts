import { AppException } from './app.exception.js';
import { ForbiddenAppException, NotFoundAppException } from './app-exceptions.js';
import type { ErrorCode } from './error-code.enum.js';

export function assertFound<T>(
  value: T | null | undefined,
  entity: string,
  id?: string,
): asserts value is T {
  if (value === null || value === undefined) throw new NotFoundAppException(entity, id);
}

export function assertOwner(
  ownerId: string | null | undefined,
  actorId: string,
  message?: string,
): void {
  if (!ownerId || ownerId !== actorId) throw new ForbiddenAppException(message);
}

export function assertCondition(
  condition: unknown,
  code: ErrorCode,
  message?: string,
  details?: unknown,
): asserts condition {
  if (!condition) throw new AppException(code, { message, details });
}
