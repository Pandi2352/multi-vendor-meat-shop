import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * One allowed value kept in the URL (`?tab=NEW`), so pages can be linked to in a given state and
 * survive a reload. Unknown values fall back to the default; the default is left out of the URL.
 */
export const useSearchParamState = <T extends string>(key: string, allowed: readonly T[], fallback: T) => {
  const [params, setParams] = useSearchParams();
  const raw = params.get(key);
  const value = raw !== null && (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;

  const setValue = useCallback(
    (next: T) =>
      setParams(
        (current) => {
          const updated = new URLSearchParams(current);
          if (next === fallback) updated.delete(key);
          else updated.set(key, next);
          return updated;
        },
        { replace: true },
      ),
    [fallback, key, setParams],
  );

  return [value, setValue] as const;
};
