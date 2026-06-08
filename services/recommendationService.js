/**
 * Smart Recommendation Engine
 * Scores products based on user behavior and returns personalized picks.
 */

const WEIGHTS = {
  PURCHASED: 5,
  CARTED: 3,
  VIEWED: 2,
  SEARCHED: 2,
  TRENDING_BONUS: 1.5,
  POPULAR_BONUS: 1,
};

function scoreProduct(product, userProfile) {
  if (!product || !product.id) return 0;
  let score = 0;
  const cat = product.category || '';

  if (userProfile.orderedCategories[cat]) {
    score += userProfile.orderedCategories[cat] * WEIGHTS.PURCHASED;
  }

  if (userProfile.cartedCategories[cat]) {
    score += userProfile.cartedCategories[cat] * WEIGHTS.CARTED;
  }

  if (userProfile.viewedProducts[product.id]) {
    score += userProfile.viewedProducts[product.id] * WEIGHTS.VIEWED;
  }

  if (userProfile.viewedCategories[cat]) {
    score += userProfile.viewedCategories[cat] * WEIGHTS.VIEWED;
  }

  for (const query of userProfile.searchedQueries) {
    if (product.name.toLowerCase().includes(query.toLowerCase()) || cat.toLowerCase().includes(query.toLowerCase())) {
      score += WEIGHTS.SEARCHED;
      break;
    }
  }

  if (product.reviewCount && product.reviewCount > 200) {
    score += WEIGHTS.TRENDING_BONUS;
  }

  if (product.rating && product.rating >= 4.7) {
    score += WEIGHTS.POPULAR_BONUS;
  }

  return score;
}

export function getSmartPicks(allProducts, userProfile, cartItems = [], count = 10) {
  if (!allProducts || allProducts.length === 0) return [];

  const cartIds = new Set((cartItems || []).filter(i => i).map(i => i.id));
  const available = allProducts.filter(p => p && p.id && !cartIds.has(p.id));

  const scored = available.map(p => ({
    ...p,
    _score: scoreProduct(p, userProfile),
  }));

  const hasActivity = Object.keys(userProfile.orderedCategories).length > 0 ||
    Object.keys(userProfile.viewedProducts).length > 0 ||
    Object.keys(userProfile.cartedCategories).length > 0 ||
    userProfile.searchedQueries.length > 0;

  if (!hasActivity) {
    return scored
      .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
      .slice(0, count);
  }

  const personalizedCount = Math.ceil(count * 0.6);
  const trendingCount = count - personalizedCount;

  const personalized = scored
    .sort((a, b) => b._score - a._score)
    .slice(0, personalizedCount);

  const personalizedIds = new Set(personalized.map(p => p.id));

  const trending = scored
    .filter(p => !personalizedIds.has(p.id))
    .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
    .slice(0, trendingCount);

  const result = [];
  let pi = 0, ti = 0;
  while (result.length < count && (pi < personalized.length || ti < trending.length)) {
    if (pi < personalized.length) result.push(personalized[pi++]);
    if (result.length < count && pi < personalized.length && pi % 2 === 0) {
      result.push(personalized[pi++]);
    }
    if (result.length < count && ti < trending.length) {
      result.push(trending[ti++]);
    }
  }

  return result.slice(0, count);
}

export function getRecommendationReason(product, userProfile) {
  if (!product) return '✨ Popular pick';
  const cat = product.category || '';

  if (userProfile.orderedCategories[cat]) return '🔄 Based on your orders';
  if (userProfile.cartedCategories[cat]) return '🛒 Related to your cart';
  if (userProfile.viewedProducts[product.id]) return '👁️ Recently viewed';
  if (userProfile.viewedCategories[cat]) return '📂 From browsed category';

  for (const query of userProfile.searchedQueries) {
    if (product.name.toLowerCase().includes(query.toLowerCase())) return `🔍 Related to "${query}"`;
  }

  if (product.reviewCount > 200) return '🔥 Trending now';
  if (product.rating >= 4.7) return '⭐ Top rated';

  return '✨ Popular pick';
}
