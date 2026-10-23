import { ValidateBy, buildMessage, type ValidationOptions } from 'class-validator';

export interface PaiseOptions {
  /** Allow 0 (default true). */
  allowZero?: boolean;
  max?: number;
}

/** Integer money in paise. */
export const IsPaise = (
  paiseOptions: PaiseOptions = {},
  options?: ValidationOptions,
): PropertyDecorator => {
  const { allowZero = true, max } = paiseOptions;
  return ValidateBy(
    {
      name: 'isPaise',
      constraints: [allowZero, max],
      validator: {
        validate: (value) =>
          Number.isSafeInteger(value) &&
          (allowZero ? (value as number) >= 0 : (value as number) > 0) &&
          (max === undefined || (value as number) <= max),
        defaultMessage: buildMessage(
          (each) => `${each}$property must be a whole amount in paise`,
          options,
        ),
      },
    },
    options,
  );
};

export interface GramsOptions {
  /** Weight must be a multiple of this (e.g. 250). */
  step?: number;
  min?: number;
  max?: number;
}

/** Integer weight in grams. */
export const IsGrams = (
  gramsOptions: GramsOptions = {},
  options?: ValidationOptions,
): PropertyDecorator => {
  const { step, min = 1, max } = gramsOptions;
  return ValidateBy(
    {
      name: 'isGrams',
      constraints: [step, min, max],
      validator: {
        validate: (value) =>
          Number.isSafeInteger(value) &&
          (value as number) >= min &&
          (max === undefined || (value as number) <= max) &&
          (step === undefined || (value as number) % step === 0),
        defaultMessage: buildMessage(
          (each) =>
            `${each}$property must be a whole number of grams${step ? ` in steps of ${step}` : ''}`,
          options,
        ),
      },
    },
    options,
  );
};
