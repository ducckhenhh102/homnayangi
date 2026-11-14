/**
 * Calculate geographical distance in kilometers between two points using the standard Haversine formula
 */
export function distanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  // Earth mean radius: 6371.0088 km
  return 6371.0088 * 2 * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * Calculate bounding box [minLat, maxLat, minLng, maxLng] for preliminary database filtering
 */
export function getBoundingBox(lat, lng, radiusKm) {
  const latDelta = radiusKm / 111.0; // Approx 111 km per latitude degree
  const lngDelta = radiusKm / (111.0 * Math.cos((lat * Math.PI) / 180));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - Math.abs(lngDelta),
    maxLng: lng + Math.abs(lngDelta),
  };
}
