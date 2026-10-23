export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export interface RetryOptions {
  attempts?: number;
  baseDelayMs?: number;
  factor?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

/** Retries with exponential backoff. Re-throws the last error. */
export const retry = async <T>(
  fn: (attempt: number) => Promise<T>,
  options: RetryOptions = {},
): Promise<T> => {
  const { attempts = 3, baseDelayMs = 100, factor = 2, shouldRetry = () => true } = options;
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      if (attempt === attempts || !shouldRetry(error, attempt)) break;
      await sleep(baseDelayMs * factor ** (attempt - 1));
    }
  }
  throw lastError;
};

export class TimeoutError extends Error {
  constructor(message = 'Operation timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export const withTimeout = async <T>(
  promise: Promise<T>,
  ms: number,
  message?: string,
): Promise<T> => {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(message)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
};
