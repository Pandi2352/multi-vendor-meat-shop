import { describe, expect, it } from 'vitest';
import { calculateDistanceKm, formatDistance } from './distance';

describe('distance utilities', () => {
  it('calculates distance between two known coordinates', () => {
    // Virudhunagar Town (9.568, 77.9624) to Sivakasi (9.4533, 77.8024) is roughly 21-22 km
    const distance = calculateDistanceKm(9.568, 77.9624, 9.4533, 77.8024);
    expect(distance).toBeGreaterThan(20);
    expect(distance).toBeLessThan(25);
  });

  it('formats distance correctly for sub-km and multiple km', () => {
    expect(formatDistance(0.4)).toBe('400 m away');
    expect(formatDistance(1.8)).toBe('1.8 km away');
  });
});
