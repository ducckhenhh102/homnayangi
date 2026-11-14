import { PlacesProvider } from './places.interface.js';
import { distanceKm } from '../../utils/geo.js';

export class MockPlacesAdapter extends PlacesProvider {
  constructor(options = {}) {
    super();
    this.mockPlaces = options.mockPlaces || [
      {
        id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        name: 'Mock Cafe Phố Cổ (Google)',
        address: '12 Hàng Gai, Hoàn Kiếm, Hà Nội',
        lat: 21.0318,
        lng: 105.8510,
        diningTypes: ['snack'],
        rating: 4.6,
        userRatingCount: 120,
      },
      {
        id: 'ChIJrTLr-GyuEmsRBfy61i59si0',
        name: 'Mock Quán Nhậu Hồ Tây (Google)',
        address: '88 Trích Sài, Tây Hồ, Hà Nội',
        lat: 21.0490,
        lng: 105.8190,
        diningTypes: ['drinking'],
        rating: 4.3,
        userRatingCount: 85,
      },
      {
        id: 'ChIJ2eUgeAK6j4ARbn5u_wAGqWA',
        name: 'Mock Cơm Tấm Sài Gòn (Google)',
        address: '35 Thái Hà, Đống Đa, Hà Nội',
        lat: 21.0125,
        lng: 105.8185,
        diningTypes: ['meal'],
        rating: 4.5,
        userRatingCount: 210,
      },
    ];
    this.shouldFail = options.shouldFail || false;
    this.failStatus = options.failStatus || 500;
    this.failMessage = options.failMessage || 'Simulated provider error';
  }

  setMockPlaces(places) {
    this.mockPlaces = places;
  }

  setFailure(shouldFail, status = 500, message = 'Simulated provider error') {
    this.shouldFail = shouldFail;
    this.failStatus = status;
    this.failMessage = message;
  }

  async searchNearby(params) {
    if (this.shouldFail) {
      const err = new Error(this.failMessage);
      err.status = this.failStatus;
      throw err;
    }

    const { lat, lng, radiusKm, diningType, limit = 20 } = params;

    const filtered = this.mockPlaces
      .map((p) => {
        const dist = distanceKm(lat, lng, p.lat, p.lng);
        return {
          id: `places:${p.id}`,
          rawId: p.id,
          source: 'google_places',
          name: p.name,
          slug: null,
          description: null,
          address: p.address,
          location: { lat: p.lat, lng: p.lng },
          diningTypes: p.diningTypes,
          typeConfidence: 'high',
          companionTypes: ['couple', 'friends', 'solo'],
          priceMin: null,
          priceMax: null,
          rating: p.rating,
          userRatingCount: p.userRatingCount,
          isOpen: null,
          distanceKm: dist,
          imageUrl: null,
          images: [],
          foods: [],
          attribution: {
            provider: 'Google Places',
            text: 'Dữ liệu được cung cấp bởi Google Places (Mock)',
            placeUri: `https://www.google.com/maps/place/?q=place_id:${p.id}`,
          },
        };
      })
      .filter((p) => p.distanceKm <= radiusKm)
      .filter((p) => (diningType ? p.diningTypes.includes(diningType) : true))
      .slice(0, limit);

    return filtered;
  }

  async getPlaceDetails(placeId) {
    if (this.shouldFail) {
      throw new Error(this.failMessage);
    }

    const cleanId = placeId.startsWith('places:') ? placeId.replace('places:', '') : placeId;
    const found = this.mockPlaces.find((p) => p.id === cleanId);
    if (!found) return null;

    return {
      id: `places:${found.id}`,
      rawId: found.id,
      source: 'google_places',
      name: found.name,
      slug: null,
      description: null,
      address: found.address,
      location: { lat: found.lat, lng: found.lng },
      diningTypes: found.diningTypes,
      typeConfidence: 'high',
      companionTypes: ['couple', 'friends', 'solo'],
      priceMin: null,
      priceMax: null,
      rating: found.rating,
      userRatingCount: found.userRatingCount,
      isOpen: null,
      distanceKm: null,
      imageUrl: null,
      images: [],
      foods: [],
      attribution: {
        provider: 'Google Places',
        text: 'Dữ liệu được cung cấp bởi Google Places (Mock)',
        placeUri: `https://www.google.com/maps/place/?q=place_id:${found.id}`,
      },
    };
  }
}
