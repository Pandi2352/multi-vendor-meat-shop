import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorState } from '../ui/error-state';

export interface NotFoundPageProps {
  onGoHome?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onGoHome }) => {
  let navigate: ReturnType<typeof useNavigate> | null = null;
  try {
    // Call inside try/catch in case rendered outside Router context
    navigate = useNavigate();
  } catch {
    navigate = null;
  }

  const handleHome = () => {
    if (onGoHome) {
      onGoHome();
    } else if (navigate) {
      navigate('/');
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <ErrorState
        statusCode="404"
        title="Page Not Found"
        description="The page or resource you are looking for does not exist or has been moved."
        actionLabel="Go to Homepage"
        onAction={handleHome}
      />
    </div>
  );
};
