import React from 'react';
import { ErrorState } from '../ui/error-state';

export interface ForbiddenPageProps {
  title?: string;
  description?: string;
  homeLabel?: string;
  onGoBack?: () => void;
  onGoHome?: () => void;
}

export const ForbiddenPage: React.FC<ForbiddenPageProps> = ({
  title = 'Unauthorized Admin Action',
  description = 'Your current role or session lacks permissions to perform this operation or view this console.',
  homeLabel = 'Go to Dashboard',
  onGoBack,
  onGoHome,
}) => {
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
        title={title}
        description={description}
        actionLabel="Go Back"
        onAction={handleBack}
        secondaryActionLabel={homeLabel}
        onSecondaryAction={handleHome}
      />
    </div>
  );
};
