export const VALID_DINING_TYPES = ['snack', 'meal', 'drinking'];

export function clampRadius(radius) {
  const num = Number(radius);
  if (isNaN(num)) return 5;
  if (num < 1) return 1;
  if (num > 10) return 10;
  return Math.round(num);
}

export function validatePreferences(prefs = {}) {
  const diningType = VALID_DINING_TYPES.includes(prefs.diningType) ? prefs.diningType : 'meal';
  const radiusKm = clampRadius(prefs.radiusKm);

  const lat = Number(prefs.location?.lat);
  const lng = Number(prefs.location?.lng);
  const isLocationValid = !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;

  return {
    diningType,
    radiusKm,
    isLocationValid,
  };
}
