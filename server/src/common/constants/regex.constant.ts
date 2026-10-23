export const REGEX = {
  /** Indian mobile number in E.164 form: +91 followed by 10 digits starting 6-9. */
  PHONE_E164_IN: /^\+91[6-9]\d{9}$/,
  PINCODE: /^[1-9]\d{5}$/,
  TIME_HHMM: /^([01]\d|2[0-3]):[0-5]\d$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  /** `name` or `-createdAt,name` */
  SORT: /^-?[A-Za-z][\w.]*(,-?[A-Za-z][\w.]*)*$/,
} as const;
