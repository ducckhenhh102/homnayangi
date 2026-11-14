import prisma from '../../config/db.js';
import restaurantRepository from '../../repositories/restaurant.repository.js';
import { formatRestaurant } from '../../services/restaurant.service.js';
import { GooglePlacesAdapter } from './googlePlaces.adapter.js';
import { MockPlacesAdapter } from './mockPlaces.adapter.js';

class HybridPlacesService {
  /**
   * @param {Object} options
   * @param {import('./places.interface.js').PlacesProvider} [options.provider]
   */
  constructor(options = {}) {
    this.provider = options.provider || null;
  }

  getProvider() {
    if (this.provider) return this.provider;

    const providerType = process.env.PLACES_PROVIDER || 'google';
    if (providerType === 'mock') {
      this.provider = new MockPlacesAdapter();
    } else {
      this.provider = new GooglePlacesAdapter({
        apiKey: process.env.GOOGLE_MAPS_SERVER_KEY,
      });
    }
    return this.provider;
  }

  setProvider(provider) {
    this.provider = provider;
  }

  isPlacesEnabled() {
    return process.env.PLACES_ENABLED === 'true';
  }

  /**
   * Discover restaurants nearby merging internal Neon data and external Google Places
   * @param {Object} params
   * @param {number} params.lat
   * @param {number} params.lng
   * @param {number} params.radiusKm
   * @param {string} [params.diningType]
   * @param {string} [params.companion]
   * @param {number} [params.page]
   * @param {number} [params.limit]
   */
  async getNearbyHybrid(params) {
    const { lat, lng, radiusKm, diningType, companion, page = 1, limit = 20 } = params;

    // 1. Always query internal Neon restaurants first
    const internalResult = await restaurantRepository.findNearby({
      lat,
      lng,
      radiusKm,
      diningType,
      companion,
      page: 1,
      limit: 100, // retrieve ample candidates to merge & dedup
    });

    const internalItems = internalResult.items.map(formatRestaurant);
    const sources = ['internal'];
    let partialResults = false;
    let externalItems = [];

    // 2. Query external places provider if feature flag PLACES_ENABLED is true
    if (this.isPlacesEnabled()) {
      try {
        const provider = this.getProvider();
        const rawExternal = await provider.searchNearby({
          lat,
          lng,
          radiusKm,
          diningType,
          limit: 20,
        });

        if (Array.isArray(rawExternal) && rawExternal.length > 0) {
          sources.push('google_places');

          // Query linked provider IDs from DB to prevent duplicates (Phase 12.7)
          const externalPlaceIds = rawExternal.map((p) => p.rawId);
          const existingLinks = await prisma.restaurantProviderLink.findMany({
            where: {
              providerPlaceId: { in: externalPlaceIds },
            },
            select: {
              restaurantId: true,
              providerPlaceId: true,
            },
          });

          const linkedPlaceIds = new Set(existingLinks.map((l) => l.providerPlaceId));

          // Filter out external items that already exist in internal DB
          externalItems = rawExternal.filter((ext) => {
            // Already linked
            if (linkedPlaceIds.has(ext.rawId)) return false;

            // Strict 10 km limit
            if (ext.distanceKm !== null && ext.distanceKm > radiusKm) return false;

            // Name + distance collision heuristic (if same exact name within 100m)
            const collision = internalItems.some((intItem) => {
              const nameMatch = intItem.name.toLowerCase().trim() === ext.name.toLowerCase().trim();
              const closeDist =
                intItem.location.lat &&
                ext.location.lat &&
                Math.abs(intItem.location.lat - ext.location.lat) < 0.001 &&
                Math.abs(intItem.location.lng - ext.location.lng) < 0.001;
              return nameMatch || closeDist;
            });

            return !collision;
          });
        }
      } catch (err) {
        // Robust fallback: external failure never breaks internal discovery
        console.warn(`[HybridPlacesService] External provider failed: ${err.message}`);
        partialResults = true;
      }
    }

    // 3. Merge candidates: internal first (higher data richness & menu), then external
    const combined = [...internalItems, ...externalItems];

    // Sort by companion score then distance
    combined.sort((a, b) => {
      // Prioritize internal candidates with high rating/verified menu
      if (a.source === 'internal' && b.source !== 'internal') return -1;
      if (b.source === 'internal' && a.source !== 'internal') return 1;

      const distA = a.distanceKm ?? 999;
      const distB = b.distanceKm ?? 999;
      return distA - distB;
    });

    // Pagination
    const total = combined.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = combined.slice(startIndex, startIndex + limit);

    return {
      data: paginatedItems,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit) || 1,
        radiusKm,
        partialResults,
        sources,
      },
    };
  }

  /**
   * Get restaurant or external place details
   * @param {string} id
   */
  async getPlaceDetail(id) {
    if (id.startsWith('places:')) {
      const provider = this.getProvider();
      const place = await provider.getPlaceDetails(id);
      if (!place) {
        const err = new Error(`Không tìm thấy địa điểm '${id}'`);
        err.statusCode = 404;
        err.code = 'NOT_FOUND';
        throw err;
      }
      return { data: place };
    }

    // Internal ID
    const cleanId = id.startsWith('internal:') ? id.replace('internal:', '') : id;
    const item = await restaurantRepository.findById(cleanId);
    if (!item) {
      const err = new Error(`Không tìm thấy quán với ID hoặc slug '${id}'`);
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return { data: formatRestaurant(item) };
  }
}

export const hybridPlacesService = new HybridPlacesService();
export default hybridPlacesService;
