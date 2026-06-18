"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from './LocationContext';

const StoreContext = createContext();
export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    // Return a safe fallback to prevent crashes if used outside provider during HMR or edge cases
    return { 
      selectedStore: null, 
      matchedShops: [], 
      showStorePopup: false, 
      setShowStorePopup: () => {}, 
      getShopProducts: (p) => p, 
      selectStore: () => {} 
    };
  }
  return context;
};

// ── Meaningful shop name parts for random generation ──
const SHOP_PREFIXES = ["NearMart", "GreenBasket", "DailyFresh", "NatureMart", "HarvestHub", "PurePantry", "SpiceLane", "GrainVilla", "KisanMart", "VillageFresh", "OrganicNest", "FarmDirect"];
const SHOP_SUFFIXES = ["Supermarket", "Grocers", "Fresh Store", "Mini Mart", "Express", "Provisions", "Market", "Essentials"];
const AREA_NAMES = ["Main Road", "Cross Street", "Market Lane", "Temple Road", "Bus Stand Area", "Railway Nagar", "Lake View", "Park Avenue", "Gandhi Street", "Nehru Nagar", "Junction", "Colony"];

// Mock logos/icons for shops
const SHOP_LOGOS = ["🥬", "🥛", "🥥", "🥖", "🥜", "🍎", "🥦", "🍯", "🏪", "🏬"];

const AREA_MAPPING = {
  "600001": "Parrys", "600002": "Mount Road", "600004": "Mylapore", "600017": "T. Nagar", "600018": "Alwarpet", "600020": "Adyar", "600028": "R.A. Puram", "600033": "West Mambalam", "600040": "Anna Nagar", "600041": "Thiruvanmiyur", "600042": "Velachery", "600073": "Selaiyur", "600100": "Pallikaranai", "600101": "Anna Nagar West", "600102": "Anna Nagar East", "600113": "Taramani"
};

function seededRandom(seed) {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  const rng = function() {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) / 4294967296);
  };
  // Warmup the PRNG to ensure divergent sequences for similar seeds
  for (let j = 0; j < 15; j++) rng();
  return rng;
}

function seededShuffle(arr, rng) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateShopsForPincode(pincode) {
  if (!pincode) return [];
  const rng = seededRandom(pincode);
  const shops = [];
  const areaName = AREA_MAPPING[pincode] || "Local Area";

  for (let i = 0; i < 4; i++) {
    const prefix = SHOP_PREFIXES[Math.floor(rng() * SHOP_PREFIXES.length)];
    const suffix = SHOP_SUFFIXES[Math.floor(rng() * SHOP_SUFFIXES.length)];
    const street = AREA_NAMES[Math.floor(rng() * AREA_NAMES.length)];
    const logo = SHOP_LOGOS[Math.floor(rng() * SHOP_LOGOS.length)];
    shops.push({
      id: `shop-${pincode}-${i}`,
      name: `${prefix} ${suffix}`,
      logo: logo,
      address: `${Math.floor(rng() * 200 + 1)}, ${street}, ${areaName}`,
      pincode,
      areaName,
      shopSeed: `${pincode}-shop${i}`
    });
  }
  return shops;
}

export const StoreProvider = ({ children }) => {
  const { zipCode } = useLocation();
  const [selectedStore, setSelectedStore] = useState(null);
  const [matchedShops, setMatchedShops] = useState([]);
  const [showStorePopup, setShowStorePopup] = useState(false);

  // Initialize and react to zipCode changes
  useEffect(() => {
    const savedShop = sessionStorage.getItem('nearmart_selected_shop');
    const effectiveZip = zipCode || '600001';
    
    const shops = generateShopsForPincode(effectiveZip);
    setMatchedShops(shops);

    if (savedShop) {
      try { 
        const parsed = JSON.parse(savedShop);
        // If the saved shop is from the current zip or we just loaded, keep it
        if (parsed.pincode === effectiveZip) {
          setSelectedStore(parsed);
        } else {
          // If zip changed, auto-select the first shop from new zip or clear
          setSelectedStore(shops[0] || null);
        }
      } catch {
        setSelectedStore(shops[0] || null);
      }
    } else {
      setSelectedStore(shops[0] || null);
    }
  }, [zipCode]);

  const getShopProducts = (allProducts, shop) => {
    let customProducts = [];
    if (typeof window !== 'undefined') {
      try {
        customProducts = JSON.parse(localStorage.getItem('nearmart_admin_products') || '[]');
      } catch (e) {}
    }

    // Merge standard products with custom admin products
    const mergedMap = new Map();
    (allProducts || []).forEach(p => {
      const cleanId = p.id && p.id.includes('__') ? p.id.split('__')[1] : p.id;
      mergedMap.set(cleanId, p);
    });
    customProducts.forEach(p => {
      const cleanId = p.id && p.id.includes('__') ? p.id.split('__')[1] : p.id;
      mergedMap.set(cleanId, p);
    });
    const finalProducts = Array.from(mergedMap.values()).filter(p => p.available !== false && !p.deleted);

    if (!shop) return finalProducts;
    const seed = shop.shopSeed || shop.id || 'default-seed';
    const rng = seededRandom(seed);
    const shuffled = seededShuffle(finalProducts, rng);
    
    return shuffled.map(p => ({
      ...p,
      originalId: p.id,
      id: `${shop.id}__${p.id}`,
      storeId: shop.id,
      storeName: shop.name
    }));
  };

  const selectStore = (shop) => {
    setSelectedStore(shop);
    sessionStorage.setItem('nearmart_selected_shop', JSON.stringify(shop));
  };

  return (
    <StoreContext.Provider value={{
      selectedStore, matchedShops, showStorePopup, setShowStorePopup,
      getShopProducts, selectStore
    }}>
      {children}
    </StoreContext.Provider>
  );
};
