// Object and array helpers. Keep them pure and generic.

export const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === Object.prototype;

export const pick = <T extends object, K extends keyof T>(
  source: T,
  keys: readonly K[],
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  for (const key of keys) if (key in source) result[key] = source[key];
  return result;
};

export const omit = <T extends object, K extends keyof T>(
  source: T,
  keys: readonly K[],
): Omit<T, K> => {
  const result = { ...source };
  for (const key of keys) delete result[key];
  return result;
};

/** Drops keys whose value is `undefined` (and `null` when `dropNull` is set). */
export const compact = <T extends object>(source: T, dropNull = false): Partial<T> =>
  Object.fromEntries(
    Object.entries(source).filter(([, v]) => v !== undefined && (!dropNull || v !== null)),
  ) as Partial<T>;

export const chunk = <T>(items: readonly T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
};

export const groupBy = <T, K extends PropertyKey>(
  items: readonly T[],
  key: (item: T) => K,
): Record<K, T[]> => {
  const result = {} as Record<K, T[]>;
  for (const item of items) (result[key(item)] ??= []).push(item);
  return result;
};

export const keyBy = <T, K extends PropertyKey>(
  items: readonly T[],
  key: (item: T) => K,
): Record<K, T> => {
  const result = {} as Record<K, T>;
  for (const item of items) result[key(item)] = item;
  return result;
};

export const uniqBy = <T>(items: readonly T[], key: (item: T) => unknown): T[] => {
  const seen = new Set<unknown>();
  return items.filter((item) => {
    const k = key(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

export const sumBy = <T>(items: readonly T[], value: (item: T) => number): number =>
  items.reduce((total, item) => total + value(item), 0);
