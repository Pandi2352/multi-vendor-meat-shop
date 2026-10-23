import { useEffect, useRef, type RefObject } from 'react';

/** Calls `handler` on a pointer-down outside every given element. */
export const useClickOutside = (
  refs: RefObject<HTMLElement | null>[],
  handler: () => void,
  enabled = true,
): void => {
  const handlerRef = useRef(handler);
  const refsRef = useRef(refs);
  handlerRef.current = handler;
  refsRef.current = refs;

  useEffect(() => {
    if (!enabled) return;
    const listener = (event: PointerEvent) => {
      const target = event.target as Node;
      if (refsRef.current.some((ref) => ref.current?.contains(target))) return;
      handlerRef.current();
    };
    document.addEventListener('pointerdown', listener);
    return () => document.removeEventListener('pointerdown', listener);
  }, [enabled]);
};
