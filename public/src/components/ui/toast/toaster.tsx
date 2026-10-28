import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { toastStore } from './toast.store';
import { ToastCard } from './toast-card';
import type { ToastItem } from './toast.types';

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const unsubscribe = toastStore.subscribe((updated) => {
      setToasts(updated);
    });
    return () => unsubscribe();
  }, []);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="pointer-events-none fixed bottom-4 right-4 z-60 flex max-w-sm flex-col gap-2 p-2 sm:p-0 w-[calc(100vw-2rem)] sm:w-auto"
    >
      {toasts.map((item) => (
        <div key={item.id} className="pointer-events-auto">
          <ToastCard toast={item} onDismiss={(id) => toastStore.dismiss(id)} />
        </div>
      ))}
    </div>,
    document.body,
  );
}
