import { useEffect, useState } from 'react';
import { toast, toastStore } from './toast.store';
import type { ToastItem } from './toast.types';

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>(toastStore.getToasts());

  useEffect(() => {
    return toastStore.subscribe(setToasts);
  }, []);

  return {
    toast,
    toasts,
    dismiss: toastStore.dismiss,
    clear: toastStore.clear,
  };
}
