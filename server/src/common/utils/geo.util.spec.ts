import { describe, expect, it } from 'vitest';
import { fromGeoPoint, haversineKm, isWithinRadius, kmToRadians, toGeoPoint } from './geo.util.js';

const CHENNAI_CENTRAL = { lat: 13.0827, lng: 80.2707 };
const T_NAGAR = { lat: 13.0418, lng: 80.2341 };
const MADURAI = { lat: 9.9252, lng: 78.1198 };

describe('geo.util', () => {
  it('converts to and from GeoJSON (lng first)', () => {
    const point = toGeoPoint(CHENNAI_CENTRAL);
    expect(point).toEqual({ type: 'Point', coordinates: [80.2707, 13.0827] });
    expect(fromGeoPoint(point)).toEqual(CHENNAI_CENTRAL);
  });

  it('measures distance', () => {
    expect(haversineKm(CHENNAI_CENTRAL, T_NAGAR)).toBeCloseTo(6.1, 0);
    expect(haversineKm(CHENNAI_CENTRAL, MADURAI)).toBeGreaterThan(400);
  });

  it('checks radius', () => {
    expect(isWithinRadius(CHENNAI_CENTRAL, T_NAGAR, 8)).toBe(true);
    expect(isWithinRadius(CHENNAI_CENTRAL, MADURAI, 50)).toBe(false);
    expect(kmToRadians(6371)).toBe(1);
  });
});
