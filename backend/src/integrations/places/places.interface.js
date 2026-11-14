/**
 * Interface contract for Places Providers (Google Places, Mock, etc.)
 */
export class PlacesProvider {
  /**
   * Search nearby places
   * @param {Object} params
   * @param {number} params.lat
   * @param {number} params.lng
   * @param {number} params.radiusKm
   * @param {string} [params.diningType]
   * @param {number} [params.limit]
   * @returns {Promise<Array<NormalizedPlace>>}
   */
  async searchNearby(params) {
    throw new Error('searchNearby must be implemented by subclass');
  }

  /**
   * Get place details by provider place ID
   * @param {string} placeId
   * @returns {Promise<NormalizedPlace|null>}
   */
  async getPlaceDetails(placeId) {
    throw new Error('getPlaceDetails must be implemented by subclass');
  }
}
