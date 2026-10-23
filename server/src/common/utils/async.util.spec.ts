import { describe, expect, it, vi } from 'vitest';
import { TimeoutError, retry, withTimeout } from './async.util.js';

describe('async.util', () => {
  it('retries until success', async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValueOnce('ok');
    await expect(retry(fn, { baseDelayMs: 1 })).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('stops when shouldRetry says no', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fatal'));
    await expect(retry(fn, { baseDelayMs: 1, shouldRetry: () => false })).rejects.toThrow('fatal');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('times out', async () => {
    await expect(withTimeout(new Promise(() => undefined), 5)).rejects.toBeInstanceOf(TimeoutError);
    await expect(withTimeout(Promise.resolve(1), 50)).resolves.toBe(1);
  });
});
