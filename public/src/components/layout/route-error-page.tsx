import React from 'react';
import { isApiError, getStatusCode } from '@/lib/api-error';
import { NotFoundPage } from './not-found-page';
import { ForbiddenPage } from './forbidden-page';
import { ServerErrorPage } from './server-error-page';

export interface RouteErrorPageProps {
  error?: unknown;
  onReset?: () => void;
}

export const RouteErrorPage: React.FC<RouteErrorPageProps> = ({ error, onReset }) => {
  const status = getStatusCode(error);

  if (status === 404) {
    return <NotFoundPage />;
  }

  if (status === 403) {
    return <ForbiddenPage />;
  }

  const message = isApiError(error) ? error.message : undefined;
  return <ServerErrorPage onRetry={onReset} message={message} />;
};
