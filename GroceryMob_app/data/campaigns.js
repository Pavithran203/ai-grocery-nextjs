// Dynamic Banner & Store Offer System
// Grocery Marketplace — Malligai Kadai

// ─── HOMEPAGE BANNERS ────────────────────────────────────────
export const BANNERS = [
  {
    id: 'smart-savings-zone',
    title: 'Smart Savings Zone',
    subtitle: 'Best store offers, grocery combos & monthly deals!',
    icon: '🎉',
    bannerBg: ['#D97706', '#F59E0B'],
    bannerImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400',
    ctaText: 'Explore Offers',
    navigationTarget: 'StoreOfferMarketplace',
    isActive: true,
    badge: '🔥 Top Deals',
  },
  {
    id: 'best-local-stores',
    title: 'Best Local Stores',
    subtitle: 'Discover trusted Kirana stores near you',
    icon: '🏪',
    bannerBg: ['#276749', '#40916C'],
    bannerImage: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80&w=400',
    ctaText: 'Find Stores',
    navigationTarget: 'StoresTab',
    isActive: true,
    badge: '📍 Nearby',
  },
];

export const getActiveBanners = () => BANNERS.filter(b => b.isActive);

// ─── STORE OFFER ZONE — Kitchen Essential Combos ─────────────
// Each store generates its own unique combos from this template pool
const COMBO_TEMPLATES = [
  {
    templateId: 'daily-cooking',
    title: 'Daily Cooking Pack',
    items: ['Ponni Raw Rice 5kg', 'Sunflower Oil 1L', 'Toor Dal 1kg'],
    basePrice: 704,
    emoji: '🍚',
  },
  {
    templateId: 'family-grocery',
    title: 'Family Grocery Combo',
    items: ['Ponni Raw Rice 5kg', 'Toor Dal 1kg', 'Sugar 1kg', 'Iodized Salt 1kg', 'Sunflower Oil 1L'],
    basePrice: 774,
    emoji: '👨‍👩‍👧‍👦',
  },
  {
    templateId: 'spice-box',
    title: 'Spice Box Combo',
    items: ['Turmeric Powder 200g', 'Chilli Powder 200g', 'Coriander Powder 200g', 'Garam Masala 100g', 'Cumin Seeds 200g'],
    basePrice: 370,
    emoji: '🌶️',
  },
  {
    templateId: 'kitchen-starter',
    title: 'Kitchen Starter Pack',
    items: ['Sugar 1kg', 'Iodized Salt 1kg', 'Wheat Flour 1kg', 'Besan 500g'],
    basePrice: 205,
    emoji: '🧂',
  },
  {
    templateId: 'oil-ghee-bundle',
    title: 'Oil & Ghee Bundle',
    items: ['Sunflower Oil 1L', 'Groundnut Oil 1L', 'Pure Ghee 500ml'],
    basePrice: 650,
    emoji: '🫒',
  },
  {
    templateId: 'monthly-mega',
    title: 'Monthly Mega Pack',
    items: ['Ponni Raw Rice 5kg', 'Toor Dal 1kg', 'Sunflower Oil 1L', 'Wheat Flour 1kg', 'Sugar 1kg', 'Turmeric 200g', 'Chilli Powder 200g'],
    basePrice: 1030,
    emoji: '📦',
  },
  {
    templateId: 'breakfast-pack',
    title: 'Breakfast Essentials',
    items: ['Rava (Sooji) 1kg', 'Vermicelli 200g', 'Rice Flour 500g', 'Urad Dal 1kg'],
    basePrice: 265,
    emoji: '🍳',
  },
  {
    templateId: 'supermarket-mega',
    title: 'Monthly Super Saver Pack',
    items: ['Ponni Raw Rice 25kg', 'Sunflower Oil 5L', 'Toor Dal 5kg', 'Sugar 5kg', 'Premium Atta 5kg'],
    basePrice: 2850,
    emoji: '🏢',
  },
];

// Seeded random for consistent store combos
export function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Generate unique combo offers for a store
 * Each store gets 2-4 combos with unique pricing
 */
export function generateStoreOffers(store) {
  if (!store || !store.id) return [];

  const seed = store.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const comboCount = 2 + Math.floor(seededRandom(seed) * 3); // 2-4 combos

  // Pick combos deterministically per store
  const selected = [];
  const used = new Set();
  for (let i = 0; i < comboCount && i < COMBO_TEMPLATES.length; i++) {
    const idx = Math.floor(seededRandom(seed + i * 7) * COMBO_TEMPLATES.length);
    if (!used.has(idx)) {
      used.add(idx);
      selected.push(COMBO_TEMPLATES[idx]);
    } else {
      // pick next available
      for (let j = 0; j < COMBO_TEMPLATES.length; j++) {
        if (!used.has(j)) { used.add(j); selected.push(COMBO_TEMPLATES[j]); break; }
      }
    }
  }

  // FORCE: Saravana Stores (store-008) should always have the Supermarket Mega Pack
  if (store.id === 'store-008' || store.storeType === 'Supermarket') {
    const megaTmpl = COMBO_TEMPLATES.find(t => t.templateId === 'supermarket-mega');
    if (megaTmpl && !selected.includes(megaTmpl)) {
       selected[0] = megaTmpl; // Replace first one with the big one
    }
  }

  return selected.map((tmpl, i) => {
    const variance = 0.85 + seededRandom(seed + i * 13) * 0.2; // 85-105% of base
    const offerPrice = Math.round(tmpl.basePrice * variance);
    const originalPrice = Math.round(offerPrice * (1.15 + seededRandom(seed + i * 3) * 0.1)); // 15-25% markup
    const discount = Math.round(((originalPrice - offerPrice) / originalPrice) * 100);

    return {
      id: `${store.id}-offer-${tmpl.templateId}`,
      storeId: store.id,
      storeName: store.name,
      storeEmoji: store.emoji,
      storeRating: store.rating,
      storeDistance: store.distance,
      estimatedDeliveryTime: store.estimatedDeliveryTime,
      title: tmpl.title,
      items: tmpl.items,
      emoji: tmpl.emoji,
      originalPrice,
      offerPrice,
      discountPercent: discount,
      isKitchenEssentialOffer: true,
      deliveryAvailable: store.deliveryAvailable !== false,
      deliveryCharge: store.deliveryInfo?.deliveryCharge || 0,
      freeDeliveryThreshold: store.freeDeliveryThreshold || 500,
      isPriority: store.id === 'store-008', // Tag for prioritization
    };
  });
}

// Legacy exports for backward compatibility
export const CAMPAIGNS = [];
export const PROMO_BANNERS = [];
export const getActiveCampaigns = () => [];
export const getCampaignForCategory = () => null;
