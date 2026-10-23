import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useEscapeKey } from '@/hooks';
import { cn } from '@/lib/cn';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name; also rendered as a heading unless `hideTitle`. */
  title: string;
  hideTitle?: boolean;
  children: ReactNode;
  className?: string;
  position?: 'center' | 'top';
}

/** Modal over a dimmed backdrop. Escape and backdrop click close it; page scroll is locked while open. */
export function Dialog({ open, onClose, title, hideTitle, children, className, position = 'center' }: DialogProps) {
  useEscapeKey(onClose, open);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 flex justify-center p-4',
        position === 'top' ? 'items-start pt-[12vh]' : 'items-center',
      )}
    >
      <button type="button" aria-label="Close dialog" onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn('relative w-full max-w-lg rounded-md border border-border bg-surface', className)}
      >
        {!hideTitle && <h2 className="border-b border-border px-5 py-4 text-base font-semibold text-text">{title}</h2>}
        {children}
      </div>
    </div>,
    document.body,
  );
}
