import { applyDecorators } from '@nestjs/common';
import {
  ArrayUnique,
  IsArray,
  IsUUID,
  ValidateBy,
  buildMessage,
  type ValidationOptions,
} from 'class-validator';

/** Passes when the value is later than (or equal to, with `allowEqual`) the sibling property. */
export const IsAfter = (
  property: string,
  allowEqual = false,
  options?: ValidationOptions,
): PropertyDecorator =>
  ValidateBy(
    {
      name: 'isAfter',
      constraints: [property],
      validator: {
        validate: (value, args) => {
          const other = (args?.object as Record<string, unknown> | undefined)?.[property];
          if (value === undefined || value === null || other === undefined || other === null)
            return true;
          const current = new Date(value as string).getTime();
          const reference = new Date(other as string).getTime();
          return allowEqual ? current >= reference : current > reference;
        },
        defaultMessage: buildMessage(
          (each) => `${each}$property must be after ${property}`,
          options,
        ),
      },
    },
    options,
  );

export const IsUuidV7 = (options?: ValidationOptions): PropertyDecorator => IsUUID('7', options);

/** A unique array of UUID v7 ids — for bulk operations. */
export const IsUuidArray = (options?: ValidationOptions): PropertyDecorator =>
  applyDecorators(IsArray(options), ArrayUnique(options), IsUUID('7', { ...options, each: true }));
