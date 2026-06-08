import { DEMO_STORES } from '../data/demoStores';
import { generateStoreProducts } from '../data/storeProducts';

// Haversine formula — returns distance in km
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getStoreStatus(store) {
  if (store.isClosedToday) {
    return { label: 'Closed Today', type: 'CLOSED_TODAY', color: '#EF4444', bgColor: '#FEF2F2' };
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  // Parse open/close times (format "HH:mm")
  const [oh, om] = store.openTime.split(':').map(Number);
  const [ch, cm] = store.closeTime.split(':').map(Number);
  
  const openMinutes = oh * 60 + om;
  const closeMinutes = ch * 60 + cm;

  if (currentMinutes < openMinutes || currentMinutes >= closeMinutes) {
    return { label: 'Closed Now', type: 'CLOSED', color: '#EF4444', bgColor: '#FEF2F2' };
  }

  // Check if closing within 60 minutes
  const minutesUntilClose = closeMinutes - currentMinutes;
  if (minutesUntilClose <= 60 && minutesUntilClose > 0) {
    return { label: 'Closing Soon', type: 'CLOSING_SOON', color: '#F59E0B', bgColor: '#FFFBEB' };
  }

  return { label: 'Open Now', type: 'OPEN', color: '#059669', bgColor: '#ECFDF5' };
}

function calculateDeliveryInfo(store, distance, orderAmount = 0) {
  if (!store || distance == null) return null;
  
  // If store doesn't support delivery at all
  if (store.deliveryAvailable === false) {
    return {
      isDeliverable: false,
      isPickupOnly: true,
      message: 'Pickup Only',
      status: 'pickup_only'
    };
  }

  const maxRadius = store.deliveryRadiusKm || 15;
  const freeThreshold = store.freeDeliveryThreshold || 500;
  const freeDistance = store.freeDeliveryRadiusKm || 2;
  const baseCharge = store.baseDeliveryCharge || 40;
  
  const isWithinFreeDistance = distance <= freeDistance;
  const isOrderFree = orderAmount >= freeThreshold;
  const isEligibleForFree = isWithinFreeDistance || isOrderFree;

  // OUT OF RANGE
  if (distance > maxRadius) {
    return {
      isDeliverable: false,
      deliveryCharge: null,
      message: 'Delivery not available for your location',
      status: 'out_of_range',
      estimatedTime: null
    };
  }

  // TIERED PRICING LOGIC
  let charge = 0;
  let status = 'fee_applied';
  let message = '';

  if (isEligibleForFree) {
    charge = 0;
    status = 'free';
    message = 'You are eligible for free delivery';
  } else {
    // Distance-based pricing
    if (distance <= 5) {
      charge = baseCharge; 
    } else if (distance <= 10) {
      charge = baseCharge + 20; 
    } else if (distance <= 15) {
      charge = baseCharge + 40;
    } else {
      charge = baseCharge + 60 + Math.round((distance - 15) * 10);
    }
    status = 'fee_applied';
    message = 'Delivery charges apply for your location';
  }

  return {
    isDeliverable: true,
    deliveryCharge: charge,
    message: message,
    status: status,
    estimatedTime: store.estimatedDeliveryTime || '30-45 mins',
    freeThreshold: freeThreshold,
    maxRadius: maxRadius,
    isWithinFreeDistance,
    freeDistance: freeDistance,
    baseCharge: baseCharge,
    minOrder: store.minOrder || 0
  };
}

// Product cache
const _cache = {};

export const storeService = {
  // Get nearby stores using REAL coordinates — returns [] if no coords
  getNearbyStores(userLat, userLon, radiusKm = 15, favoriteStoreIds = []) {
    if (userLat == null || userLon == null) return [];

    const allStoresWithDistance = DEMO_STORES.map(store => {
      const rawDist = getDistanceKm(userLat, userLon, store.latitude, store.longitude);
      const distance = rawDist != null && !isNaN(rawDist) ? parseFloat(rawDist.toFixed(1)) : 0;
      const status = getStoreStatus(store);
      const isFav = favoriteStoreIds.includes(store.id);
      
      return {
        ...store,
        distance,
        isFav,
        isOpen: status.type === 'OPEN' || status.type === 'CLOSING_SOON',
        status,
        deliveryInfo: calculateDeliveryInfo(store, distance, 0)
      };
    });

    // 1. Try to find stores within radius
    let nearby = allStoresWithDistance.filter(s => s.distance <= radiusKm);

    // 2. FALLBACK: If no stores within radius, get the 5 closest stores (for demo/testing)
    if (nearby.length === 0) {
      nearby = [...allStoresWithDistance]
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5);
    }

    // 3. SORT: Primary by Distance, but Favorites get a small boost (e.g. 1km deduction for sorting only)
    return nearby.sort((a, b) => {
      const aEffectiveDist = a.isFav ? Math.max(0, a.distance - 2) : a.distance;
      const bEffectiveDist = b.isFav ? Math.max(0, b.distance - 2) : b.distance;
      
      // If distances are very similar, prioritize Open stores
      if (Math.abs(aEffectiveDist - bEffectiveDist) < 0.5) {
        const aOpen = a.status.type === 'OPEN' || a.status.type === 'CLOSING_SOON';
        const bOpen = b.status.type === 'OPEN' || b.status.type === 'CLOSING_SOON';
        if (aOpen && !bOpen) return -1;
        if (!aOpen && bOpen) return 1;
      }
      
      return aEffectiveDist - bEffectiveDist;
    });
  },

  // ZIP-based filtering with better matching
  getStoresByZip(zipCode) {
    if (!zipCode || zipCode.length < 5) return [];
    const zipNum = parseInt(zipCode, 10);
    if (isNaN(zipNum)) return [];

    return DEMO_STORES
      .map(store => {
        const status = getStoreStatus(store);
        return {
          ...store,
          distance: null, 
          status,
          isOpen: status.type === 'OPEN' || status.type === 'CLOSING_SOON',
        };
      })
      .filter(store => {
        const storeZip = parseInt(store.zipCode, 10);
        return Math.abs(storeZip - zipNum) <= 10;
      })
      .sort((a, b) => {
        // Sort: Open stores first, then Exact ZIP matches, then by rating
        const aOpen = a.status.type === 'OPEN' || a.status.type === 'CLOSING_SOON';
        const bOpen = b.status.type === 'OPEN' || b.status.type === 'CLOSING_SOON';
        if (aOpen && !bOpen) return -1;
        if (!aOpen && bOpen) return 1;
        
        const aZip = parseInt(a.zipCode, 10);
        const bZip = parseInt(b.zipCode, 10);
        if (aZip === zipNum && bZip !== zipNum) return -1;
        if (aZip !== zipNum && bZip === zipNum) return 1;
        return b.rating - a.rating;
      });
  },

  getStoreById(storeId, userLat = null, userLon = null, orderAmount = 0) {
    const store = DEMO_STORES.find(s => s.id === storeId);
    if (!store) return null;
    
    let distance = null;
    if (userLat != null && userLon != null) {
      const rawDist = getDistanceKm(userLat, userLon, store.latitude, store.longitude);
      distance = rawDist != null && !isNaN(rawDist) ? parseFloat(rawDist.toFixed(1)) : 0;
    }

    const status = getStoreStatus(store);
    return { 
      ...store, 
      distance,
      status,
      isOpen: status.type === 'OPEN' || status.type === 'CLOSING_SOON',
      deliveryInfo: calculateDeliveryInfo(store, distance, orderAmount)
    };
  },

  getStoreProducts(store) {
    if (!store) return [];
    if (_cache[store.id]) return _cache[store.id];
    const products = generateStoreProducts(store);
    _cache[store.id] = products;
    return products;
  },

  getStoreProductsByCategory(store, category) {
    const products = this.getStoreProducts(store);
    return category ? products.filter(p => p.category === category) : products;
  },

  searchStores(query, stores) {
    if (!query || !query.trim()) return stores;
    const q = query.toLowerCase().trim();
    return stores.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.area.toLowerCase().includes(q) ||
      s.storeType.toLowerCase().includes(q) ||
      s.zipCode.includes(q) ||
      s.categories.some(c => c.toLowerCase().includes(q))
    );
  },

  searchStoreProducts(store, query) {
    const products = this.getStoreProducts(store);
    if (!query || !query.trim()) return products;
    const q = query.toLowerCase().trim();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  },

  getAllStores(userLat = null, userLon = null) {
    return DEMO_STORES.map(store => {
      const status = getStoreStatus(store);
      let distance = null;
      if (userLat != null && userLon != null) {
        const rawDist = getDistanceKm(userLat, userLon, store.latitude, store.longitude);
        distance = rawDist != null && !isNaN(rawDist) ? parseFloat(rawDist.toFixed(1)) : 0;
      }
      
      return { 
        ...store, 
        distance,
        status,
        isOpen: status.type === 'OPEN' || status.type === 'CLOSING_SOON',
        deliveryInfo: calculateDeliveryInfo(store, distance)
      };
    }).sort((a, b) => {
      // Sort open stores first, then by rating
      if (a.isOpen && !b.isOpen) return -1;
      if (!a.isOpen && b.isOpen) return 1;
      return b.rating - a.rating;
    });
  },

  filterStores(stores, activeFilters) {
    if (!activeFilters || activeFilters.length === 0) return stores;

    return stores.filter(store => {
      return activeFilters.every(filterId => {
        switch (filterId) {
          case 'free_delivery':
            return store.deliveryInfo?.status === 'free';
          case 'pickup_only':
            return store.deliveryAvailable === false && store.pickupAvailable === true;
          case 'delivery_available':
            return store.deliveryAvailable === true && store.deliveryInfo?.isDeliverable === true;
          case 'long_distance':
            return (store.deliveryRadiusKm || 0) > 20;
          case 'fast_delivery':
            const timeStr = (store.estimatedDeliveryTime || '').toLowerCase();
            if (timeStr.includes('hour') || timeStr.includes('hr')) {
              // Extract hours, convert to mins
              const hours = timeStr.match(/\d+/g);
              if (!hours) return false;
              const maxHours = Math.max(...hours.map(Number));
              return (maxHours * 60) <= 30; // 1 hour = 60m, never <= 30
            }
            const allNumbers = timeStr.match(/\d+/g);
            if (!allNumbers || allNumbers.length === 0) return false;
            const maxMins = Math.max(...allNumbers.map(Number));
            return maxMins <= 30;
          case 'open_now':
            return store.status?.type === 'OPEN' || store.status?.type === 'CLOSING_SOON';
          case 'top_rated_store':
            return (store.rating || 0) >= 4.5;
          default:
            return true;
        }
      });
    });
  }
};
