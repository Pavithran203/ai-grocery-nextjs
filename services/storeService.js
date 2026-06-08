import { DEMO_STORES } from '@/data/demoStores';

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
  
  const [oh, om] = store.openTime.split(':').map(Number);
  const [ch, cm] = store.closeTime.split(':').map(Number);
  
  const openMinutes = oh * 60 + om;
  const closeMinutes = ch * 60 + cm;

  if (currentMinutes < openMinutes || currentMinutes >= closeMinutes) {
    return { label: 'Closed Now', type: 'CLOSED', color: '#EF4444', bgColor: '#FEF2F2' };
  }

  const minutesUntilClose = closeMinutes - currentMinutes;
  if (minutesUntilClose <= 60 && minutesUntilClose > 0) {
    return { label: 'Closing Soon', type: 'CLOSING_SOON', color: '#F59E0B', bgColor: '#FFFBEB' };
  }

  return { label: 'Open Now', type: 'OPEN', color: '#059669', bgColor: '#ECFDF5' };
}

function calculateDeliveryInfo(store, distance, orderAmount = 0) {
  if (!store || distance == null) return null;
  
  if (store.deliveryAvailable === false) {
    return {
      isDeliverable: false,
      isPickupOnly: true,
      message: 'Pickup Only',
      status: 'pickup_only'
    };
  }

  const maxRadius = store.deliveryRadiusKm || 30; // 30km limit as per requirement 5
  const freeThreshold = store.freeDeliveryThreshold || 500;
  
  const isWithinFreeDistance = distance <= 5;
  const isOrderFree = orderAmount >= freeThreshold;
  const isEligibleForFree = isWithinFreeDistance || isOrderFree;

  if (distance > maxRadius) {
    return {
      isDeliverable: false,
      deliveryCharge: null,
      message: 'Not deliverable',
      status: 'out_of_range',
      estimatedTime: null
    };
  }

  let charge = 0;

  if (isEligibleForFree) {
    charge = 0;
  } else {
    if (distance <= 8) {
      charge = 35;
    } else if (distance <= 12) {
      charge = 60;
    } else if (distance <= 20) {
      charge = 90;
    } else {
      charge = 120 + Math.round((distance - 20) * 5);
    }
  }

  return {
    isDeliverable: true,
    deliveryCharge: charge,
    message: charge === 0 ? 'Free Delivery' : `₹${charge} delivery`,
    status: charge === 0 ? 'free' : 'paid',
    isWithinFreeDistance,
    freeThreshold,
    estimatedTime: store.estimatedDeliveryTime || '30-45 mins'
  };
}

export const storeService = {
  getNearbyStores(userLat, userLon, radiusKm = 100, favoriteStoreIds = []) {
    if (userLat == null || userLon == null) return [];

    const allStoresWithDistance = DEMO_STORES.map(store => {
      const distance = parseFloat(getDistanceKm(userLat, userLon, store.latitude, store.longitude).toFixed(1));
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

    let nearby = allStoresWithDistance.filter(s => s.distance <= radiusKm);

    if (nearby.length === 0) {
      nearby = [...allStoresWithDistance]
        .sort((a, b) => a.distance - b.distance);
    }

    return nearby.sort((a, b) => {
      const aEffectiveDist = a.isFav ? Math.max(0, a.distance - 2) : a.distance;
      const bEffectiveDist = b.isFav ? Math.max(0, b.distance - 2) : b.distance;
      
      if (Math.abs(aEffectiveDist - bEffectiveDist) < 0.5) {
        const aOpen = a.status.type === 'OPEN' || a.status.type === 'CLOSING_SOON';
        const bOpen = b.status.type === 'OPEN' || b.status.type === 'CLOSING_SOON';
        if (aOpen && !bOpen) return -1;
        if (!aOpen && bOpen) return 1;
      }
      
      return aEffectiveDist - bEffectiveDist;
    });
  },

  getStoreById(storeId, userLat = null, userLon = null, orderAmount = 0) {
    const store = DEMO_STORES.find(s => s.id === storeId);
    if (!store) return null;
    
    let distance = null;
    if (userLat != null && userLon != null) {
      distance = parseFloat(getDistanceKm(userLat, userLon, store.latitude, store.longitude).toFixed(1));
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

  filterStores(stores, activeFilters) {
    if (!activeFilters || activeFilters.length === 0) return stores;

    return stores.filter(store => {
      return activeFilters.every(filterId => {
        switch (filterId) {
          case 'free_delivery':
            return store.deliveryInfo?.isWithinFreeDistance;
          case 'pickup_only':
            return store.pickupAvailable && !store.deliveryAvailable;
          case 'delivery_available':
            return store.deliveryAvailable;
          case 'long_distance':
            return store.distance > 20;
          case 'fast_delivery':
            return store.distance < 5;
          case 'open_now':
            return store.status?.type === 'OPEN';
          case 'top_rated_store':
            return store.rating >= 4.5;
          default:
            return true;
        }
      });
    });
  },
  getAllStores(userLat = null, userLon = null) {
    return DEMO_STORES.map(store => {
      let distance = null;
      if (userLat != null && userLon != null) {
        distance = parseFloat(getDistanceKm(userLat, userLon, store.latitude, store.longitude).toFixed(1));
      }
      const status = getStoreStatus(store);
      return {
        ...store,
        distance,
        status,
        isOpen: status.type === 'OPEN' || status.type === 'CLOSING_SOON',
        deliveryInfo: calculateDeliveryInfo(store, distance, 0)
      };
    });
  },

  getStoresByZip(zipCode) {
    if (!zipCode) return [];
    return this.getAllStores().filter(s => s.zipCode === zipCode);
  },

  searchStores(query, stores) {
    if (!query) return stores;
    const q = query.toLowerCase();
    return stores.filter(store => 
      store.name.toLowerCase().includes(q) || 
      store.area.toLowerCase().includes(q) ||
      (store.categories && store.categories.some(c => c.toLowerCase().includes(q)))
    );
  }
};
