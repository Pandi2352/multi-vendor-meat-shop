import { GEO } from '#common/constants';

export interface LatLng {
  lat: number;
  lng: number;
}

/** GeoJSON point as stored in MongoDB. Note the order: [longitude, latitude]. */
export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number];
}

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

export const toGeoPoint = ({ lat, lng }: LatLng): GeoPoint => ({
  type: 'Point',
  coordinates: [lng, lat],
});

export const fromGeoPoint = ({ coordinates: [lng, lat] }: GeoPoint): LatLng => ({ lat, lng });

/** Great-circle distance in kilometres. */
export const haversineKm = (a: LatLng, b: LatLng): number => {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * GEO.EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
};

export const isWithinRadius = (center: LatLng, point: LatLng, radiusKm: number): boolean =>
  haversineKm(center, point) <= radiusKm;

/** For `$centerSphere` queries, which take the radius in radians. */
export const kmToRadians = (km: number): number => km / GEO.EARTH_RADIUS_KM;

export const kmToMeters = (km: number): number => Math.round(km * 1000);
