import { IsIn, ValidateBy, buildMessage, type ValidationOptions } from 'class-validator';
import { REGEX, TN_DISTRICT_CODES } from '#common/constants';

export const IsPincode = (options?: ValidationOptions): PropertyDecorator =>
  ValidateBy(
    {
      name: 'isPincode',
      validator: {
        validate: (value) => typeof value === 'string' && REGEX.PINCODE.test(value),
        defaultMessage: buildMessage(
          (each) => `${each}$property must be a 6-digit PIN code`,
          options,
        ),
      },
    },
    options,
  );

export const IsTimeHHmm = (options?: ValidationOptions): PropertyDecorator =>
  ValidateBy(
    {
      name: 'isTimeHHmm',
      validator: {
        validate: (value) => typeof value === 'string' && REGEX.TIME_HHMM.test(value),
        defaultMessage: buildMessage(
          (each) => `${each}$property must be a time in HH:mm format`,
          options,
        ),
      },
    },
    options,
  );

export const IsSlug = (options?: ValidationOptions): PropertyDecorator =>
  ValidateBy(
    {
      name: 'isSlug',
      validator: {
        validate: (value) => typeof value === 'string' && REGEX.SLUG.test(value),
        defaultMessage: buildMessage(
          (each) => `${each}$property must be lowercase words joined by hyphens`,
          options,
        ),
      },
    },
    options,
  );

export const IsDistrict = (options?: ValidationOptions): PropertyDecorator =>
  IsIn([...TN_DISTRICT_CODES], {
    message: '$property must be a Tamil Nadu district code',
    ...options,
  });
