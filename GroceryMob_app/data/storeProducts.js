// Store-wise product catalog — GROCERY ONLY
// Each store generates products from this catalog with price variance

const PRODUCT_CATALOG = {
  'Rice & Grains': [
    { name: 'Ponni Raw Rice', unit: '5 kg', basePrice: 399, brand: 'Local', image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400' },
    { name: 'India Gate Basmati Rice', unit: '1 kg', basePrice: 199, brand: 'India Gate', image: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=400' },
    { name: 'Sona Masoori Rice', unit: '5 kg', basePrice: 280, brand: 'Local', image: 'https://images.unsplash.com/photo-1594135235079-9fec30953217?w=400' },
    { name: 'Fortune Idly Rice', unit: '5 kg', basePrice: 320, brand: 'Fortune', image: 'https://images.unsplash.com/photo-1536304929001-5b6d0e3d54ef?w=400' },
    { name: 'Whole Wheat Grains', unit: '1 kg', basePrice: 55, brand: 'Local', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400' },
  ],
  'Dal & Pulses': [
    { name: 'Tata Sampann Toor Dal', unit: '1 kg', basePrice: 145, brand: 'Tata Sampann', image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=400' },
    { name: 'Moong Dal (Yellow)', unit: '1 kg', basePrice: 110, brand: 'Local', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400' },
    { name: 'Urad Dal (White)', unit: '1 kg', basePrice: 130, brand: 'Local', image: 'https://images.unsplash.com/photo-1551221193-2708307d85c4?w=400' },
    { name: 'Chana Dal', unit: '500 g', basePrice: 90, brand: 'Local', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400' },
    { name: 'Masoor Dal', unit: '1 kg', basePrice: 100, brand: 'Local', image: 'https://images.unsplash.com/photo-1613758947307-f3d8e92b0e1b?w=400' },
  ],
  'Oils & Ghee': [
    { name: 'Fortune Sunflower Oil', unit: '1 L', basePrice: 160, brand: 'Fortune', image: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=400' },
    { name: 'Gold Winner Groundnut Oil', unit: '1 L', basePrice: 210, brand: 'Gold Winner', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400' },
    { name: 'Arokya Pure Ghee', unit: '500 ml', basePrice: 280, brand: 'Arokya', image: 'https://images.unsplash.com/photo-1631276774928-1c9649820e15?w=400' },
    { name: 'Idhayam Gingelly Oil', unit: '500 ml', basePrice: 195, brand: 'Idhayam', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400' },
    { name: 'Parachute Coconut Oil', unit: '500 ml', basePrice: 140, brand: 'Parachute', image: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=400' },
  ],
  'Atta & Flour': [
    { name: 'Aashirvaad Whole Wheat Atta', unit: '1 kg', basePrice: 65, brand: 'Aashirvaad', image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=400' },
    { name: 'Pillsbury Maida', unit: '500 g', basePrice: 40, brand: 'Pillsbury', image: 'https://images.unsplash.com/photo-1608198399988-341f712c3711?w=400' },
    { name: 'Local Ragi Flour', unit: '1 kg', basePrice: 85, brand: 'Local', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400' },
    { name: 'Rice Flour (Fine)', unit: '500 g', basePrice: 45, brand: 'Local', image: 'https://images.unsplash.com/photo-1590080876351-941da357a4e4?w=400' },
    { name: 'Gram Flour (Besan)', unit: '500 g', basePrice: 70, brand: 'Local', image: 'https://images.unsplash.com/photo-1612257999756-ba39a7133a4a?w=400' },
  ],
  'Masalas & Spices': [
    { name: 'Everest Turmeric Powder', unit: '200 g', basePrice: 65, brand: 'Everest', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400' },
    { name: 'Everest Chilli Powder', unit: '200 g', basePrice: 75, brand: 'Everest', image: 'https://images.unsplash.com/photo-1582281295982-f472f10b7b12?w=400' },
    { name: 'MDH Coriander Powder', unit: '200 g', basePrice: 55, brand: 'MDH', image: 'https://images.unsplash.com/photo-1599909533601-510b1e4f1680?w=400' },
    { name: 'Everest Garam Masala', unit: '100 g', basePrice: 90, brand: 'Everest', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400' },
    { name: 'Cumin Seeds (Jeera)', unit: '200 g', basePrice: 85, brand: 'Local', image: 'https://images.unsplash.com/photo-1512303021958-868cb530ea87?w=400' },
    { name: 'Mustard Seeds', unit: '200 g', basePrice: 30, brand: 'Local', image: 'https://images.unsplash.com/photo-1606913084603-3e7702b01627?w=400' },
    { name: 'Black Pepper Grains', unit: '100 g', basePrice: 120, brand: 'Local', image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=400' },
  ],
  'Sugar & Salt': [
    { name: 'Refined Sugar', unit: '1 kg', basePrice: 48, brand: 'Local', image: 'https://images.unsplash.com/photo-1605374823293-1f19f2913e01?w=400' },
    { name: 'Tata Iodized Salt', unit: '1 kg', basePrice: 22, brand: 'Tata', image: 'https://images.unsplash.com/photo-1610631882961-ad86a6358cc1?w=400' },
    { name: 'Natural Rock Salt', unit: '1 kg', basePrice: 35, brand: 'Local', image: 'https://images.unsplash.com/photo-1518110925495-5fe2c8dcf2b4?w=400' },
    { name: 'Pure Jaggery Powder', unit: '500 g', basePrice: 95, brand: 'Local', image: 'https://images.unsplash.com/photo-1604514813560-1e4f0c783c64?w=400' },
  ],
  'Grocery Essentials': [
    { name: 'Local Rava (Sooji)', unit: '1 kg', basePrice: 55, brand: 'Local', image: 'https://images.unsplash.com/photo-1590080876351-941da357a4e4?w=400' },
    { name: 'Bambino Vermicelli', unit: '200 g', basePrice: 35, brand: 'Bambino', image: 'https://images.unsplash.com/photo-1612929633738-8fe01f7280ed?w=400' },
    { name: 'Natural Tamarind', unit: '250 g', basePrice: 60, brand: 'Local', image: 'https://images.unsplash.com/photo-1604514813560-1e4f0c783c64?w=400' },
    { name: 'Traditional Jaggery Block', unit: '500 g', basePrice: 80, brand: 'Local', image: 'https://images.unsplash.com/photo-1604514813560-1e4f0c783c64?w=400' },
  ],
  'Packaged Foods': [
    { name: 'Lijjat Papad (Special)', unit: '200 g', basePrice: 45, brand: 'Lijjat', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400' },
    { name: "Mother's Recipe Mango Pickle", unit: '300 g', basePrice: 85, brand: "Mother's Recipe", image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400' },
    { name: 'MTR Rava Idli Mix', unit: '200 g', basePrice: 55, brand: 'MTR', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400' },
    { name: 'MTR Gulab Jamun Mix', unit: '200 g', basePrice: 65, brand: 'MTR', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400' },
  ],
};

// Sync with backend products
export function syncProductCatalogWithBackend(backendProducts) {
  if (!backendProducts || backendProducts.length === 0) return;

  // Clear existing catalog items to avoid duplicates and ensure true data parity
  for (const category in PRODUCT_CATALOG) {
    PRODUCT_CATALOG[category] = [];
  }

  // Category mappings: Backend -> Client UI Categories
  const BACKEND_CAT_MAP = {
    'Rice & Grains': 'Rice & Grains',
    'Dal & Pulses': 'Dal & Pulses',
    'Flour & Powders': 'Atta & Flour',
    'Oil & Ghee': 'Oils & Ghee',
    'Masalas & Spices': 'Masalas & Spices',
    'Sugar & Salt': 'Sugar & Salt',
    'Dry Items & Cooking Essentials': 'Grocery Essentials',
    'Packed Grocery': 'Packaged Foods',
  };

  backendProducts.forEach(product => {
    const rawCat = product.category;
    const cat = BACKEND_CAT_MAP[rawCat] || rawCat;
    
    if (!PRODUCT_CATALOG[cat]) {
      PRODUCT_CATALOG[cat] = [];
    }

    PRODUCT_CATALOG[cat].push({
      id: product._id || product.id,
      name: product.name,
      unit: product.unit || '1 kg',
      basePrice: product.price,
      originalPrice: product.originalPrice || 0,
      brand: product.brand || 'Local',
      image: product.image,
      rating: product.rating || 4.5,
      reviewCount: product.reviewCount || 10,
      stockStatus: product.stockStatus || 'IN_STOCK',
      stock: product.stock !== undefined ? product.stock : 100,
      isTrending: product.isTrending || false,
      isRecommended: product.isRecommended || false,
    });
  });
}

// Generate store-specific products with slight price variations
let productIdCounter = 1;

export function generateStoreProducts(store) {
  const products = [];

  store.categories.forEach(category => {
    const catalogItems = PRODUCT_CATALOG[category] || [];
    catalogItems.forEach(item => {
      // Use exact price from backend database to ensure parity, fallback to calculated original price
      const price = item.basePrice;
      const originalPrice = item.originalPrice || Math.round(price * 1.15);
      const rating = item.rating || parseFloat((3.8 + Math.random() * 1.1).toFixed(1));
      
      const stockRoll = Math.random();
      let stockQuantity = item.stock !== undefined ? item.stock : 100;
      let stockStatus = item.stockStatus || 'IN_STOCK';
      
      if (item.stock === 0 || stockStatus === 'OUT_OF_STOCK') {
        stockQuantity = 0;
        stockStatus = 'OUT_OF_STOCK';
      } else if (stockStatus === 'LIMITED') {
        stockQuantity = Math.floor(Math.random() * 5) + 1;
      }

      products.push({
        // Stable client-side ID structure that preserves the DB Object ID
        id: `${store.id}-p${item.id || productIdCounter++}`,
        dbId: item.id || null,
        storeId: store.id,
        name: item.name,
        category,
        brand: item.brand || '',
        price,
        originalPrice,
        unit: item.unit,
        image: item.image,
        rating: parseFloat(rating),
        reviewCount: item.reviewCount || Math.floor(Math.random() * 300) + 20,
        stockQuantity,
        stockStatus,
        inStock: stockQuantity > 0,
        isHighDemand: Math.random() > 0.8,
        isPopular: Math.random() > 0.7,
        isTrending: item.isTrending || false,
        isRecommended: item.isRecommended || false,
      });
    });
  });

  return products;
}

export function getProductCatalogCategories() {
  return Object.keys(PRODUCT_CATALOG);
}

export default PRODUCT_CATALOG;
