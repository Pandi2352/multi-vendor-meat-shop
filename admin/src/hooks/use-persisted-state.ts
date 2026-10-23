import { useCallback, useState } from 'react';
import { storage } from '@/lib/storage';

/** useState that survives reloads (per browser). Use only for UI preferences. */
export const usePersistedState = <T,>(key: string, initial: T): [T, (value: T | ((prev: T) => T)) => void] => {
  const [value, setValue] = useState<T>(() => storage.get(key, initial));

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        storage.set(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, update];
};
