import {
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { AppException, ErrorCode, NotFoundAppException } from '#common/exceptions';
import { mapException } from './exception-mapper.js';

describe('mapException', () => {
  it('keeps AppException code, status and details', () => {
    expect(
      mapException(new AppException(ErrorCode.OUT_OF_STOCK, { details: { grams: 500 } })),
    ).toEqual({
      status: 409,
      code: ErrorCode.OUT_OF_STOCK,
      message: 'Not enough stock',
      details: { grams: 500 },
      unexpected: false,
    });
    expect(mapException(new NotFoundAppException('Product', 'p1')).message).toBe(
      "Product 'p1' not found",
    );
  });

  it('maps Nest HTTP exceptions', () => {
    expect(mapException(new BadRequestException('nope'))).toMatchObject({
      status: 400,
      code: ErrorCode.BAD_REQUEST,
    });
    expect(mapException(new NotFoundException('Cannot GET /api/v1/x'))).toMatchObject({
      code: ErrorCode.ROUTE_NOT_FOUND,
    });
  });

  it('passes non-standard bodies through as details', () => {
    const health = { status: 'error', info: {}, error: { mongodb: { status: 'down' } } };
    expect(mapException(new ServiceUnavailableException(health))).toMatchObject({
      status: 503,
      code: ErrorCode.SERVICE_UNAVAILABLE,
      details: health,
    });
  });

  it('maps Mongo duplicate keys and Mongoose validation errors', () => {
    expect(
      mapException({ name: 'MongoServerError', code: 11000, keyValue: { phone: '+91…' } }),
    ).toMatchObject({
      status: 409,
      code: ErrorCode.DUPLICATE_VALUE,
      message: 'phone already exists',
    });
    expect(
      mapException({
        name: 'ValidationError',
        errors: { name: { path: 'name', message: 'required' } },
      }),
    ).toMatchObject({
      code: ErrorCode.VALIDATION_FAILED,
      details: [{ field: 'name', messages: ['required'] }],
    });
  });

  it('treats anything else as an unexpected internal error', () => {
    expect(mapException(new Error('boom'))).toMatchObject({
      status: 500,
      code: ErrorCode.INTERNAL_ERROR,
      unexpected: true,
    });
  });
});
