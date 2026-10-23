export interface FieldError {
  field: string;
  messages: string[];
}

export interface BackendErrorBody {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
  path?: string;
  timestamp?: string;
}

export interface BackendErrorResponse {
  success: false;
  error: BackendErrorBody;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;
  readonly requestId?: string;
  readonly path?: string;
  readonly timestamp?: string;

  constructor(status: number, body: Partial<BackendErrorBody> = {}) {
    super(body.message || `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.code || 'UNKNOWN_ERROR';
    this.details = body.details;
    this.requestId = body.requestId;
    this.path = body.path;
    this.timestamp = body.timestamp;
  }
}

export const isApiError = (err: unknown): err is ApiError => err instanceof ApiError;

export const getErrorMessage = (err: unknown, fallback = 'Something went wrong. Please try again.'): string => {
  if (isApiError(err)) return err.message;
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return fallback;
};

export const getFieldErrors = (err: unknown): Record<string, string> => {
  if (!isApiError(err) || !Array.isArray(err.details)) return {};
  const map: Record<string, string> = {};
  for (const item of err.details as FieldError[]) {
    if (item && typeof item.field === 'string' && Array.isArray(item.messages) && item.messages.length > 0) {
      map[item.field] = item.messages[0];
    }
  }
  return map;
};

export const getStatusCode = (err: unknown): number | null => (isApiError(err) ? err.status : null);
export const isAuthError = (err: unknown): boolean => getStatusCode(err) === 401;
export const isForbiddenError = (err: unknown): boolean => getStatusCode(err) === 403;
export const isNotFoundError = (err: unknown): boolean => getStatusCode(err) === 404;
export const isServerError = (err: unknown): boolean => {
  const status = getStatusCode(err);
  return status !== null && status >= 500;
};
