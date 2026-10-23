import React from 'react';
import { ErrorState } from '../ui/error-state';

export interface ServerErrorPageProps {
  onRetry?: () => void;
  message?: string;
}

export const ServerErrorPage: React.FC<ServerErrorPageProps> = ({ onRetry, message }) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <ErrorState
        statusCode="500"
        title="Server Error"
        description={
          message || 'Our services encountered an unexpected issue. Please try again shortly.'
        }
        actionLabel="Retry"
        onAction={handleRetry}
      />
    </div>
  );
};
