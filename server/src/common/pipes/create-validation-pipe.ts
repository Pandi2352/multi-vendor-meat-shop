import { ValidationPipe } from '@nestjs/common';
import { AppException, ErrorCode } from '#common/exceptions';
import { flattenValidationErrors } from './validation-errors.util.js';

/** Global DTO validation: strips unknown fields, rejects extras, transforms to DTO instances. */
export const createValidationPipe = (): ValidationPipe =>
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: false, exposeDefaultValues: true },
    validationError: { target: false, value: false },
    exceptionFactory: (errors) =>
      new AppException(ErrorCode.VALIDATION_FAILED, { details: flattenValidationErrors(errors) }),
  });
