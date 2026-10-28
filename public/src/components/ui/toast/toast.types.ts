import type { ReactNode } from 'react';

export type ToastTone = 'info' | 'success' | 'warning' | 'error';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  title?: string;
  tone?: ToastTone;
  /** Duration in milliseconds. Set to 0 to disable auto-dismiss. Default: 4000ms. */
  duration?: number;
  action?: ToastAction;
}

export interface ToastItem {
  id: string;
  tone: ToastTone;
  title?: string;
  message: ReactNode;
  duration: number;
  action?: ToastAction;
  createdAt: number;
}
