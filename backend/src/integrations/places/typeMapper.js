/**
 * Maps Google Places (New) primaryType and types array
 * to our internal dining types: 'snack' | 'meal' | 'drinking'
 */

const SNACK_TYPES = new Set([
  'bakery',
  'cafe',
  'coffee_shop',
  'tea_house',
  'ice_cream_shop',
  'dessert_shop',
  'dessert_restaurant',
  'snack_bar',
  'pastry_shop',
  'juice_shop',
  'bubble_tea_store',
]);

const DRINKING_TYPES = new Set([
  'bar',
  'pub',
  'beer_garden',
  'brewery',
  'wine_bar',
  'cocktail_bar',
  'karaoke',
  'lounge',
  'night_club',
]);

const MEAL_TYPES = new Set([
  'restaurant',
  'vietnamese_restaurant',
  'asian_restaurant',
  'seafood_restaurant',
  'noodle_shop',
  'ramen_restaurant',
  'fast_food_restaurant',
  'diner',
  'buffet_restaurant',
  'barbecue_restaurant',
  'hot_pot_restaurant',
  'steak_house',
  'pizza_restaurant',
  'sushi_restaurant',
]);

/**
 * Maps Google Places types to internal dining types with confidence
 * @param {string[]} types
 * @param {string} [primaryType]
 * @returns {{ diningTypes: string[], confidence: 'high' | 'medium' | 'low' | 'unknown' }}
 */
export function mapGoogleTypesToDiningTypes(types = [], primaryType = '') {
  const allTypes = [primaryType, ...types].filter(Boolean);
  const matched = new Set();

  for (const t of allTypes) {
    if (SNACK_TYPES.has(t)) matched.add('snack');
    if (DRINKING_TYPES.has(t)) matched.add('drinking');
    if (MEAL_TYPES.has(t)) matched.add('meal');
  }

  // If primaryType matched specifically, confidence is high
  let confidence = 'unknown';
  if (primaryType && (SNACK_TYPES.has(primaryType) || DRINKING_TYPES.has(primaryType) || MEAL_TYPES.has(primaryType))) {
    confidence = 'high';
  } else if (matched.size > 0) {
    confidence = 'medium';
  }

  // Fallback: if it's general "food" or "point_of_interest" with no specific match
  if (matched.size === 0) {
    if (allTypes.some((t) => t.includes('restaurant') || t.includes('food'))) {
      matched.add('meal');
      confidence = 'low';
    } else {
      confidence = 'unknown';
    }
  }

  return {
    diningTypes: Array.from(matched),
    confidence,
  };
}

/**
 * Returns Google Places API (New) includedTypes for a requested internal diningType
 * @param {string} diningType
 * @returns {string[]}
 */
export function getIncludedGoogleTypes(diningType) {
  switch (diningType) {
    case 'snack':
      return ['cafe', 'coffee_shop', 'bakery', 'ice_cream_shop', 'dessert_shop', 'snack_bar'];
    case 'drinking':
      return ['bar', 'pub', 'beer_garden', 'wine_bar', 'cocktail_bar', 'lounge'];
    case 'meal':
      return ['restaurant', 'vietnamese_restaurant', 'seafood_restaurant', 'fast_food_restaurant', 'noodle_shop'];
    default:
      return ['restaurant', 'cafe', 'bar'];
  }
}
