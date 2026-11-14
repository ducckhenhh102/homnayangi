import prisma from '../config/db.js';
import { distanceKm, getBoundingBox } from '../utils/geo.js';

export const restaurantRepository = {
  async findMany({ page = 1, limit = 20, status = 'PUBLISHED', diningType, companionType }) {
    const take = Math.min(50, Math.max(1, Number(limit) || 20));
    const skip = (Math.max(1, Number(page) || 1) - 1) * take;

    const where = {};
    if (status) {
      where.status = status;
    }

    if (diningType) {
      where.diningTypes = {
        some: {
          diningTypeId: diningType,
        },
      };
    }

    if (companionType) {
      where.companionTypes = {
        some: {
          companionTypeId: companionType,
        },
      };
    }

    const [items, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          diningTypes: { include: { diningType: true } },
          companionTypes: { include: { companionType: true } },
          images: {
            orderBy: { sortOrder: 'asc' },
            take: 1,
          },
          foods: {
            take: 5,
            include: { food: true },
          },
        },
      }),
      prisma.restaurant.count({ where }),
    ]);

    return { items, total, page, limit: take };
  },

  async findById(id) {
    return prisma.restaurant.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        diningTypes: { include: { diningType: true } },
        companionTypes: { include: { companionType: true } },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        foods: {
          include: { food: true },
        },
      },
    });
  },

  async findNearby({ lat, lng, radiusKm = 10, companion, diningType, page = 1, limit = 20, sort = 'distance' }) {
    // Strict clamp: max 10 km
    const maxAllowedRadius = Math.min(10, Math.max(1, Number(radiusKm) || 10));
    const bbox = getBoundingBox(lat, lng, maxAllowedRadius);

    const where = {
      status: 'PUBLISHED',
      latitude: { gte: bbox.minLat, lte: bbox.maxLat },
      longitude: { gte: bbox.minLng, lte: bbox.maxLng },
    };

    if (diningType) {
      where.diningTypes = {
        some: { diningTypeId: diningType },
      };
    }

    const rawCandidates = await prisma.restaurant.findMany({
      where,
      include: {
        diningTypes: { include: { diningType: true } },
        companionTypes: { include: { companionType: true } },
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        foods: { take: 5, include: { food: true } },
      },
    });

    // Calculate exact Haversine distance and filter strictly <= maxAllowedRadius
    const withinRadius = [];
    for (const item of rawCandidates) {
      const d = distanceKm(lat, lng, item.latitude, item.longitude);
      if (d <= maxAllowedRadius) {
        let rankScore = 100;
        if (companion) {
          const match = item.companionTypes.find((c) => c.companionTypeId === companion);
          if (match && match.suitabilityScore != null) {
            rankScore = match.suitabilityScore;
          }
        }
        withinRadius.push({
          ...item,
          distanceKm: Math.round(d * 100) / 100,
          rankScore,
        });
      }
    }

    // Sort: 'distance' or 'relevance' (rankScore desc, then distance asc)
    withinRadius.sort((a, b) => {
      if (sort === 'relevance') {
        if (b.rankScore !== a.rankScore) {
          return b.rankScore - a.rankScore;
        }
      }
      return a.distanceKm - b.distanceKm;
    });

    // Pagination
    const take = Math.min(50, Math.max(1, Number(limit) || 20));
    const skip = (Math.max(1, Number(page) || 1) - 1) * take;
    const paginated = withinRadius.slice(skip, skip + take);

    return {
      items: paginated,
      total: withinRadius.length,
      page: Math.max(1, Number(page) || 1),
      limit: take,
      radiusKm: maxAllowedRadius,
    };
  },
};

export default restaurantRepository;
