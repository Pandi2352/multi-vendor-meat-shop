import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNetworkStatus } from './use-network-status';

describe('useNetworkStatus', () => {
  it('returns network status and updates on events', () => {
    const { result } = renderHook(() => useNetworkStatus());

    expect(typeof result.current.isOnline).toBe('boolean');

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current.isOnline).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current.isOnline).toBe(true);
  });
});
