import { ValidateBy, buildMessage, type ValidationOptions } from 'class-validator';
import { REGEX } from '#common/constants';

/** Expects the E.164 form produced by `@NormalizePhone()`, e.g. `+919876543210`. */
export const IsIndianPhone = (options?: ValidationOptions): PropertyDecorator =>
  ValidateBy(
    {
      name: 'isIndianPhone',
      validator: {
        validate: (value) => typeof value === 'string' && REGEX.PHONE_E164_IN.test(value),
        defaultMessage: buildMessage(
          (each) => `${each}$property must be a valid Indian mobile number`,
          options,
        ),
      },
    },
    options,
  );
