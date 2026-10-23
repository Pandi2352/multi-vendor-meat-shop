import React from 'react';
import { ErrorState } from '../ui/error-state';

export interface NotFoundPageProps {
  onGoHome?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onGoHome }) => {
  const handleHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <ErrorState
        statusCode="404"
        title="Admin Page Not Found"
        description="The management console page or resource you requested cannot be located."
        actionLabel="Go to Dashboard"
        onAction={handleHome}
      />
    </div>
  );
};
