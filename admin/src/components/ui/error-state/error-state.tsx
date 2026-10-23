import React from 'react';
import { cn } from '@/lib/cn';
import { Button } from '../button';

export interface ErrorStateProps {
  statusCode?: number | string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  statusCode,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center bg-surface border border-border rounded-md max-w-lg mx-auto my-12',
        className,
      )}
    >
      {statusCode && (
        <span className="text-4xl font-extrabold tracking-tight text-primary mb-2">
          {statusCode}
        </span>
      )}
      <h2 className="text-xl font-bold text-text mb-2">{title}</h2>
      <p className="text-sm text-muted mb-6 max-w-md">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction && (
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <Button variant="outline" onClick={onSecondaryAction}>
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
