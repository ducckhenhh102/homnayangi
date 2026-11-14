import restaurantRepository from '../repositories/restaurant.repository.js';

export function formatRestaurant(item) {
  if (!item) return null;

  return {
    id: `internal:${item.id}`,
    rawId: item.id,
    source: 'internal',
    name: item.name,
    slug: item.slug,
    description: item.description,
    address: item.address,
    location: {
      lat: item.latitude,
      lng: item.longitude,
    },
    diningTypes: item.diningTypes?.map((d) => d.diningTypeId) || [],
    companionTypes: item.companionTypes?.map((c) => c.companionTypeId) || [],
    priceMin: item.priceMin,
    priceMax: item.priceMax,
    rating: null, // Strictly honest: null when not collected/verified
    isOpen: null, // Strictly honest: null when live status is unavailable
    imageUrl: item.images?.[0]?.secureUrl || null,
    images: item.images?.map((img) => ({
      id: img.id,
      url: img.secureUrl,
      alt: img.altText,
    })) || [],
    foods: item.foods?.map((rf) => ({
      id: rf.food.id,
      name: rf.food.name,
      slug: rf.food.slug,
      category: rf.food.category,
      priceVnd: rf.priceVnd,
    })) || [],
    attribution: null,
  };
}

export const restaurantService = {
  async getRestaurants(query) {
    const { items, total, page, limit } = await restaurantRepository.findMany(query);
    return {
      data: items.map(formatRestaurant),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getRestaurantDetail(id) {
    // Strip namespace prefix if client requested "internal:<id>"
    const cleanId = id.startsWith('internal:') ? id.replace('internal:', '') : id;
    const item = await restaurantRepository.findById(cleanId);
    if (!item) {
      const err = new Error(`Không tìm thấy quán với ID hoặc slug '${id}'`);
      err.statusCode = 404;
      err.code = 'NOT_FOUND';
      throw err;
    }
    return {
      data: formatRestaurant(item),
    };
  },
};

export default restaurantService;
