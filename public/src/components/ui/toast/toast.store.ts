import type { ReactNode } from 'react';
import type { ToastItem, ToastOptions } from './toast.types';

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();

const notify = () => {
  listeners.forEach((listener) => listener([...toasts]));
};

let counter = 0;
const generateId = () => `toast-${Date.now()}-${++counter}`;

export const toastStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    listener([...toasts]);
    return () => {
      listeners.delete(listener);
    };
  },

  getToasts(): ToastItem[] {
    return [...toasts];
  },

  add(message: ReactNode, options: ToastOptions = {}): string {
    const id = generateId();
    const item: ToastItem = {
      id,
      tone: options.tone ?? 'info',
      title: options.title,
      message,
      duration: options.duration !== undefined ? options.duration : 4000,
      action: options.action,
      createdAt: Date.now(),
    };
    toasts = [...toasts, item];
    notify();
    return id;
  },

  dismiss(id: string): void {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  },

  clear(): void {
    toasts = [];
    notify();
  },
};

export function toast(message: ReactNode, options?: ToastOptions): string {
  return toastStore.add(message, options);
}

toast.success = (message: ReactNode, options?: Omit<ToastOptions, 'tone'>): string =>
  toastStore.add(message, { ...options, tone: 'success' });

toast.error = (message: ReactNode, options?: Omit<ToastOptions, 'tone'>): string =>
  toastStore.add(message, { ...options, tone: 'error' });

toast.warning = (message: ReactNode, options?: Omit<ToastOptions, 'tone'>): string =>
  toastStore.add(message, { ...options, tone: 'warning' });

toast.info = (message: ReactNode, options?: Omit<ToastOptions, 'tone'>): string =>
  toastStore.add(message, { ...options, tone: 'info' });

toast.dismiss = (id: string): void => toastStore.dismiss(id);
toast.clear = (): void => toastStore.clear();
