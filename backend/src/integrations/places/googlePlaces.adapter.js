import { PlacesProvider } from './places.interface.js';
import { mapGoogleTypesToDiningTypes, getIncludedGoogleTypes } from './typeMapper.js';
import { distanceKm } from '../../utils/geo.js';

const GOOGLE_PLACES_NEARBY_URL = 'https://places.googleapis.com/v1/places:searchNearby';
const GOOGLE_PLACES_DETAIL_URL = 'https://places.googleapis.com/v1/places';

export class GooglePlacesAdapter extends PlacesProvider {
  /**
   * @param {Object} config
   * @param {string} [config.apiKey]
   * @param {number} [config.timeoutMs]
   */
  constructor(config = {}) {
    super();
    this.apiKey = config.apiKey || process.env.GOOGLE_MAPS_SERVER_KEY || '';
    this.timeoutMs = config.timeoutMs || 5000;
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Search nearby places via Google Places API (New)
   * @param {Object} params
   * @param {number} params.lat
   * @param {number} params.lng
   * @param {number} params.radiusKm
   * @param {string} [params.diningType]
   * @param {number} [params.limit]
   */
  async searchNearby(params) {
    if (!this.isConfigured()) {
      return [];
    }

    const { lat, lng, radiusKm, diningType, limit = 20 } = params;
    const radiusMeters = Math.min(Math.round(radiusKm * 1000), 10000); // Strict <= 10km

    const requestBody = {
      locationRestriction: {
        circle: {
          center: {
            latitude: lat,
            longitude: lng,
          },
          radius: radiusMeters,
        },
      },
      maxResultCount: Math.min(Math.max(limit, 1), 20),
    };

    if (diningType) {
      const types = getIncludedGoogleTypes(diningType);
      if (types.length > 0) {
        requestBody.includedTypes = types;
      }
    }

    const fieldMask = [
      'places.id',
      'places.displayName',
      'places.formattedAddress',
      'places.location',
      'places.priceLevel',
      'places.primaryType',
      'places.types',
      'places.rating',
      'places.userRatingCount',
    ].join(',');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(GOOGLE_PLACES_NEARBY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': fieldMask,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.warn(`[GooglePlacesAdapter] searchNearby failed (${response.status}): ${errorText}`);
        return [];
      }

      const data = await response.json();
      const rawPlaces = data.places || [];

      return rawPlaces.map((p) => this.normalizePlace(p, lat, lng));
    } catch (err) {
      clearTimeout(timeout);
      console.warn(`[GooglePlacesAdapter] searchNearby error: ${err.message}`);
      return [];
    }
  }

  /**
   * Get place details
   * @param {string} placeId
   */
  async getPlaceDetails(placeId) {
    if (!this.isConfigured() || !placeId) {
      return null;
    }

    const cleanId = placeId.startsWith('places:') ? placeId.replace('places:', '') : placeId;
    const url = `${GOOGLE_PLACES_DETAIL_URL}/${cleanId}`;
    const fieldMask = [
      'id',
      'displayName',
      'formattedAddress',
      'location',
      'priceLevel',
      'primaryType',
      'types',
      'rating',
      'userRatingCount',
      'websiteUri',
      'googleMapsUri',
    ].join(',');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': fieldMask,
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        return null;
      }

      const p = await response.json();
      return this.normalizePlace(p);
    } catch (err) {
      clearTimeout(timeout);
      console.warn(`[GooglePlacesAdapter] getPlaceDetails error: ${err.message}`);
      return null;
    }
  }

  normalizePlace(p, originLat, originLng) {
    const lat = p.location?.latitude || null;
    const lng = p.location?.longitude || null;

    let dist = null;
    if (originLat !== undefined && originLng !== undefined && lat !== null && lng !== null) {
      dist = distanceKm(originLat, originLng, lat, lng);
    }

    const { diningTypes, confidence } = mapGoogleTypesToDiningTypes(p.types, p.primaryType);

    return {
      id: `places:${p.id}`,
      rawId: p.id,
      source: 'google_places',
      name: p.displayName?.text || p.displayName || '',
      slug: null,
      description: null,
      address: p.formattedAddress || '',
      location: { lat, lng },
      diningTypes,
      typeConfidence: confidence,
      companionTypes: ['couple', 'friends', 'solo'], // Default signals
      priceMin: null,
      priceMax: null,
      rating: p.rating || null,
      userRatingCount: p.userRatingCount || 0,
      isOpen: null,
      distanceKm: dist,
      imageUrl: null,
      images: [],
      foods: [],
      attribution: {
        provider: 'Google Places',
        text: 'Dữ liệu được cung cấp bởi Google Places',
        placeUri: p.googleMapsUri || `https://www.google.com/maps/place/?q=place_id:${p.id}`,
      },
    };
  }
}
