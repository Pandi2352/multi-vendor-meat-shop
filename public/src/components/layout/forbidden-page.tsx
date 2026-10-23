import React from 'react';
import { ErrorState } from '../ui/error-state';

export interface ForbiddenPageProps {
  onGoBack?: () => void;
  onGoHome?: () => void;
}

export const ForbiddenPage: React.FC<ForbiddenPageProps> = ({ onGoBack, onGoHome }) => {
  const handleBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      window.history.back();
    }
  };

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
        statusCode="403"
        title="Access Denied"
        description="You do not have permission to access this resource or perform this action."
        actionLabel="Go Back"
        onAction={handleBack}
        secondaryActionLabel="Go to Homepage"
        onSecondaryAction={handleHome}
      />
    </div>
  );
};
