import { applyDecorators } from '@nestjs/common';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { LIMITS } from '#common/constants';

/** Password rule for every portal account password (invite acceptance, reset). */
export const IsAccountPassword = (): PropertyDecorator =>
  applyDecorators(
    IsString(),
    MinLength(LIMITS.PASSWORD_MIN_LENGTH, {
      message: `Password must be at least ${LIMITS.PASSWORD_MIN_LENGTH} characters`,
    }),
    MaxLength(LIMITS.PASSWORD_MAX_LENGTH, {
      message: `Password must be at most ${LIMITS.PASSWORD_MAX_LENGTH} characters`,
    }),
  );
