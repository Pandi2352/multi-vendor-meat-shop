import { toIST, type DateInput } from './date.util.js';
import { randomCode } from './string.util.js';

export enum ReferencePrefix {
  ORDER = 'ORD',
  REFUND = 'RFD',
  SETTLEMENT = 'SET',
  PAYOUT = 'PAY',
  TICKET = 'TKT',
  DELIVERY = 'DLV',
}

const SUFFIX_LENGTH = 5;

/**
 * Human-friendly reference, e.g. `ORD-261023-7K3FQ` (prefix, IST date, random suffix).
 * Not a primary key — documents keep their UUID `_id`. Store it with a unique index and retry on collision.
 */
export const createReferenceNumber = (
  prefix: ReferencePrefix,
  date: DateInput = new Date(),
): string => `${prefix}-${toIST(date).format('YYMMDD')}-${randomCode(SUFFIX_LENGTH)}`;
