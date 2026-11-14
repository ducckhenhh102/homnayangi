import restaurantRepository from '../repositories/restaurant.repository.js';
import { formatRestaurant } from './restaurant.service.js';

export const wheelService = {
  async spin({ mode = 'restaurant', filters, excludeIds = [] }) {
    // 1. Fetch all eligible restaurants in radius
    const { items: candidates } = await restaurantRepository.findNearby({
      lat: filters.lat,
      lng: filters.lng,
      radiusKm: filters.radiusKm || 10,
      companion: filters.companion,
      diningType: filters.diningType,
      limit: 50, // Grab full candidate pool up to 50
    });

    if (!candidates || candidates.length === 0) {
      return {
        data: null,
        meta: {
          candidateCount: 0,
          reason: 'NO_CANDIDATES',
          message: 'Không có quán ăn hoặc món ăn nào phù hợp với bộ lọc trong bán kính đã chọn.',
        },
      };
    }

    // 2. Mode: Restaurant
    if (mode === 'restaurant') {
      let pool = candidates.filter((c) => !excludeIds.includes(`internal:${c.id}`) && !excludeIds.includes(c.id));
      if (pool.length === 0) {
        pool = candidates; // fallback if all were excluded
      }

      const selectedIndex = Math.floor(Math.random() * pool.length);
      const selected = pool[selectedIndex];

      return {
        data: {
          mode: 'restaurant',
          selected: formatRestaurant(selected),
        },
        meta: {
          candidateCount: candidates.length,
          selectionMethod: 'uniform',
        },
      };
    }

    // 3. Mode: Food (Only foods available at qualified restaurants in radius)
    const foodMap = new Map();

    for (const r of candidates) {
      if (r.foods && r.foods.length > 0) {
        for (const rf of r.foods) {
          const food = rf.food;
          if (!food) continue;

          if (!foodMap.has(food.id)) {
            foodMap.set(food.id, {
              id: food.id,
              name: food.name,
              slug: food.slug,
              category: food.category,
              description: food.description,
              availableAt: [],
            });
          }

          foodMap.get(food.id).availableAt.push({
            id: `internal:${r.id}`,
            name: r.name,
            address: r.address,
            distanceKm: r.distanceKm,
            priceVnd: rf.priceVnd,
          });
        }
      }
    }

    const foodCandidates = Array.from(foodMap.values());
    if (foodCandidates.length === 0) {
      return {
        data: null,
        meta: {
          candidateCount: 0,
          reason: 'NO_CANDIDATES',
          message: 'Các quán trong bán kính hiện chưa cập nhật món cụ thể.',
        },
      };
    }

    let foodPool = foodCandidates.filter((f) => !excludeIds.includes(f.id));
    if (foodPool.length === 0) {
      foodPool = foodCandidates;
    }

    const selectedIndex = Math.floor(Math.random() * foodPool.length);
    const selectedFood = foodPool[selectedIndex];

    return {
      data: {
        mode: 'food',
        selected: selectedFood,
      },
      meta: {
        candidateCount: foodCandidates.length,
        selectionMethod: 'uniform',
      },
    };
  },
};

export default wheelService;
