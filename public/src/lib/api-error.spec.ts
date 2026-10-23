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

describe('ApiError and error helpers', () => {
  it('constructs ApiError correctly with defaults', () => {
    const error = new ApiError(404, {
      code: 'SHOP_NOT_FOUND',
      message: 'Shop not found',
      requestId: 'req-123',
    });

    expect(isApiError(error)).toBe(true);
    expect(error.status).toBe(404);
    expect(error.code).toBe('SHOP_NOT_FOUND');
    expect(error.message).toBe('Shop not found');
    expect(error.requestId).toBe('req-123');
  });

  it('determines status code categories correctly', () => {
    const authErr = new ApiError(401);
    const forbiddenErr = new ApiError(403);
    const notFoundErr = new ApiError(404);
    const serverErr = new ApiError(500);

    expect(isAuthError(authErr)).toBe(true);
    expect(isForbiddenError(forbiddenErr)).toBe(true);
    expect(isNotFoundError(notFoundErr)).toBe(true);
    expect(isServerError(serverErr)).toBe(true);
    expect(getStatusCode(authErr)).toBe(401);
  });

  it('extracts field errors from validation details', () => {
    const error = new ApiError(400, {
      code: 'VALIDATION_FAILED',
      message: 'Validation failed',
      details: [
        { field: 'phone', messages: ['phone must be 10 digits', 'must start with 6-9'] },
        { field: 'pincode', messages: ['pincode must be 6 digits'] },
      ],
    });

    const fieldErrors = getFieldErrors(error);
    expect(fieldErrors.phone).toBe('phone must be 10 digits');
    expect(fieldErrors.pincode).toBe('pincode must be 6 digits');
  });

  it('extracts readable error message with fallback', () => {
    expect(getErrorMessage(new ApiError(400, { message: 'Invalid OTP' }))).toBe('Invalid OTP');
    expect(getErrorMessage(new Error('Network disconnected'))).toBe('Network disconnected');
    expect(getErrorMessage('Raw string error')).toBe('Raw string error');
    expect(getErrorMessage(null, 'Fallback msg')).toBe('Fallback msg');
  });
});
