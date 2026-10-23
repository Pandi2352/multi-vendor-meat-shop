import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger } from '@/lib/logger';
import { ErrorState } from '../ui/error-state';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Uncaught error in admin ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <ErrorState
            statusCode="500"
            title="Dashboard Error"
            description={
              this.state.error?.message ||
              'An unexpected error occurred in the management dashboard.'
            }
            actionLabel="Reload Dashboard"
            onAction={this.handleReset}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
