/**
 * The ONLY place where API coordinates ({lat, lng}) are converted to/from Leaflet's [lat, lng].
 */
export interface Coord {
  lat: number;
  lng: number;
}
export type LeafletPoint = [number, number];
export type LeafletBounds = [LeafletPoint, LeafletPoint];

/** Neutral world view used only before any ward data has loaded. */
export const FALLBACK_CENTER: LeafletPoint = [20.5937, 78.9629];
export const FALLBACK_ZOOM = 5;

export const round6 = (n: number): number => Math.round(n * 1e6) / 1e6;

export const toLeaflet = (c: Coord): LeafletPoint => [c.lat, c.lng];
export const pathToLeaflet = (path: Coord[]): LeafletPoint[] => path.map(toLeaflet);
export const fromLeaflet = (ll: { lat: number; lng: number }): Coord => ({
  lat: round6(ll.lat),
  lng: round6(ll.lng),
});

export const crewPosition = (c: { current_lat: number; current_lng: number }): Coord => ({
  lat: c.current_lat,
  lng: c.current_lng,
});
export const crewDepot = (c: { depot_lat: number; depot_lng: number }): Coord => ({
  lat: c.depot_lat,
  lng: c.depot_lng,
});
export const wardCenter = (w: { center_lat: number; center_lng: number }): Coord => ({
  lat: w.center_lat,
  lng: w.center_lng,
});

export function boundsOf(points: Coord[]): LeafletBounds | null {
  if (points.length === 0) return null;
  let minLat = Infinity;
  let minLng = Infinity;
  let maxLat = -Infinity;
  let maxLng = -Infinity;
  for (const p of points) {
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
    minLng = Math.min(minLng, p.lng);
    maxLng = Math.max(maxLng, p.lng);
  }
  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
}

const spanDeg = (pts: Coord[]): number => {
  const b = boundsOf(pts);
  return b ? Math.max(b[1][0] - b[0][0], b[1][1] - b[0][1]) : 0;
};

/**
 * Points used for the initial map view. A state-wide ward (ward-rajasthan) must not zoom the map out
 * to the whole state, so wards wider than 2 degrees are ignored unless they are the only ones.
 */
export function localWardPoints(wards: { boundary: Coord[] }[]): Coord[] {
  const local = wards.filter((w) => spanDeg(w.boundary) <= 2);
  return (local.length > 0 ? local : wards).flatMap((w) => w.boundary);
}

export function centroid(points: Coord[]): Coord | null {
  if (points.length === 0) return null;
  const sum = points.reduce((a, p) => ({ lat: a.lat + p.lat, lng: a.lng + p.lng }), { lat: 0, lng: 0 });
  return { lat: sum.lat / points.length, lng: sum.lng / points.length };
}

export const isValidLat = (n: number): boolean => Number.isFinite(n) && n >= -90 && n <= 90;
export const isValidLng = (n: number): boolean => Number.isFinite(n) && n >= -180 && n <= 180;
