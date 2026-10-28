import { useEffect, useRef } from 'react';
import { CircleCheck, CircleAlert, TriangleAlert, Info, X, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { ToastItem, ToastTone } from './toast.types';

const TONE_ICONS: Record<ToastTone, LucideIcon> = {
  success: CircleCheck,
  error: CircleAlert,
  warning: TriangleAlert,
  info: Info,
};

const TONE_CLASSES: Record<ToastTone, { border: string; icon: string }> = {
  success: { border: 'border-success/30', icon: 'text-success' },
  error: { border: 'border-danger/30', icon: 'text-danger' },
  warning: { border: 'border-warning/30', icon: 'text-warning' },
  info: { border: 'border-info/30', icon: 'text-info' },
};

interface ToastItemProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export function ToastCard({ toast, onDismiss }: ToastItemProps) {
  const Icon = TONE_ICONS[toast.tone];
  const { border, icon } = TONE_CLASSES[toast.tone];
  const timerRef = useRef<number | undefined>(undefined);
  const remainingRef = useRef<number>(toast.duration);
  const startRef = useRef<number>(Date.now());

  const startTimer = () => {
    if (toast.duration <= 0) return;
    startRef.current = Date.now();
    timerRef.current = window.setTimeout(() => {
      onDismiss(toast.id);
    }, remainingRef.current);
  };

  const pauseTimer = () => {
    if (toast.duration <= 0) return;
    window.clearTimeout(timerRef.current);
    const elapsed = Date.now() - startRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
  };

  useEffect(() => {
    startTimer();
    return () => window.clearTimeout(timerRef.current);
  }, []);

  return (
    <div
      role="status"
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
      className={cn(
        'group flex w-full max-w-sm items-start gap-3 rounded-md border bg-surface p-3.5 text-text',
        'motion-safe:animate-pop-in transition-all',
        border,
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0 mt-0.5', icon)} aria-hidden="true" />

      <div className="min-w-0 flex-1 space-y-1">
        {toast.title && <p className="text-xs font-semibold leading-tight text-text">{toast.title}</p>}
        <div className="text-xs leading-normal text-muted">{toast.message}</div>

        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick();
              onDismiss(toast.id);
            }}
            className="mt-1 inline-flex text-xs font-medium text-primary hover:underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-md p-1 text-muted hover:bg-surface-muted hover:text-text transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
