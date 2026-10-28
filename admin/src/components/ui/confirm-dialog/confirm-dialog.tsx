import type { ReactNode } from 'react';
import { Alert } from '../alert';
import { Button } from '../button';
import { Dialog } from '../dialog';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  /** `danger` for actions that remove or cancel something. */
  tone?: 'primary' | 'danger';
  loading?: boolean;
  /** Shown above the buttons when the action failed. */
  error?: string | null;
}

/** "Are you sure?" for one action, with Cancel and a confirm button. */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  onConfirm,
  onClose,
  tone = 'primary',
  loading,
  error,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title} className="max-w-md">
      <div className="space-y-3 px-5 py-4 text-sm leading-6 text-muted">
        {children}
        {error && (
          <Alert tone="danger" title="That didn’t work">
            {error}
          </Alert>
        )}
      </div>
      <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
        <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant={tone === 'danger' ? 'danger' : 'primary'} size="sm" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
