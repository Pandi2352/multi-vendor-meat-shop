import { useSyncExternalStore } from 'react';

/** `useMediaQuery('(min-width: 1024px)')` — re-renders when the match changes. */
export const useMediaQuery = (query: string): boolean =>
  useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );

/** Matches Tailwind's `lg` breakpoint, where the sidebar is docked instead of a drawer. */
export const useIsDesktop = (): boolean => useMediaQuery('(min-width: 1024px)');
