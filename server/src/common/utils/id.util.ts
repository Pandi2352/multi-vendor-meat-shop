import { v7 as uuidv7, validate, version } from 'uuid';

/** Every document id in the system. UUID v7 is time-ordered, which keeps MongoDB indexes compact. */
export const generateId = (): string => uuidv7();

export const isUuid = (value: unknown): value is string =>
  typeof value === 'string' && validate(value) && version(value) === 7;
