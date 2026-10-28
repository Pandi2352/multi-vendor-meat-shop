import { useEffect, useRef } from 'react';

export interface UseDocumentTitleOptions {
  restoreOnUnmount?: boolean;
  prefix?: string;
}

export function useDocumentTitle(
  title: string,
  { restoreOnUnmount = false, prefix = 'Virudhunagar Meats Portal' }: UseDocumentTitleOptions = {},
) {
  const prevTitleRef = useRef(typeof document !== 'undefined' ? document.title : '');

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const fullTitle = title ? `${title} | ${prefix}` : prefix;
    document.title = fullTitle;

    return () => {
      if (restoreOnUnmount && prevTitleRef.current) {
        document.title = prevTitleRef.current;
      }
    };
  }, [title, restoreOnUnmount, prefix]);
}
