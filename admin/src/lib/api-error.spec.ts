import { describe, expect, it } from 'vitest';
import {
  ApiError,
  getErrorMessage,
  getFieldErrors,
  getStatusCode,
  isApiError,
  isAuthError,
  isForbiddenError,
  isNotFoundError,
  isServerError,
} from './api-error';

describe('Admin ApiError and error helpers', () => {
  it('constructs ApiError correctly with defaults', () => {
    const error = new ApiError(403, {
      code: 'FORBIDDEN_RESOURCE',
      message: 'Access denied',
      requestId: 'req-admin-1',
    });

    expect(isApiError(error)).toBe(true);
    expect(error.status).toBe(403);
    expect(error.code).toBe('FORBIDDEN_RESOURCE');
    expect(error.message).toBe('Access denied');
  });

  it('determines status code categories correctly', () => {
    expect(isAuthError(new ApiError(401))).toBe(true);
    expect(isForbiddenError(new ApiError(403))).toBe(true);
    expect(isNotFoundError(new ApiError(404))).toBe(true);
    expect(isServerError(new ApiError(500))).toBe(true);
    expect(getStatusCode(new ApiError(422))).toBe(422);
  });

  it('extracts field errors from validation details', () => {
    const error = new ApiError(400, {
      code: 'VALIDATION_FAILED',
      message: 'Validation failed',
      details: [{ field: 'fssaiNumber', messages: ['FSSAI must be 14 digits'] }],
    });

    const fieldErrors = getFieldErrors(error);
    expect(fieldErrors.fssaiNumber).toBe('FSSAI must be 14 digits');
  });

  it('extracts error message with fallback', () => {
    expect(getErrorMessage(new ApiError(500, { message: 'Database error' }))).toBe('Database error');
    expect(getErrorMessage(undefined, 'Admin fallback')).toBe('Admin fallback');
  });
});
