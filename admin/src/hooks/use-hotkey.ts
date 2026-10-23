import { useEffect, useRef } from 'react';

interface HotkeyOptions {
  /** Require Ctrl (Windows/Linux) or ⌘ (macOS). */
  mod?: boolean;
}

/** `useHotkey('k', openSearch, { mod: true })` → Ctrl+K / ⌘K. */
export const useHotkey = (key: string, handler: () => void, options: HotkeyOptions = {}): void => {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== key.toLowerCase()) return;
      if (options.mod && !(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      handlerRef.current();
    };
    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [key, options.mod]);
};

export const isMacPlatform = (): boolean =>
  typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.userAgent);
