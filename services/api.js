import {
  categories, products, recommendedProducts, trendingProducts,
  smartSuggestionsMap, bundleSuggestions, megaDeals, newArrivals,
  orders as mockOrders
} from './mockData';
import { getSafeProductImage } from './imageUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

// Helper: robust fetch with auth header
const fetchWithAuth = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Try to get token from variable or localStorage
  let token = authToken;
  if (!token && typeof window !== 'undefined') {
    token = localStorage.getItem('freshkart_token') || sessionStorage.getItem('freshkart_token');
    if (token) authToken = token;
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      signal: AbortSignal.timeout(8000), // 8s timeout to prevent infinite loading
    });

    if (!res.ok) {
      let errorData = {};
      try { errorData = await res.json(); } catch (e) { }
      throw new Error(errorData.message || 'API request failed');
    }
    return await res.json();
  } catch (err) {
    if (err.name === 'TimeoutError') {
      throw new Error('Server connection timed out. Please check if the backend is running properly.');
    }
    throw err;
  }
};

// Helper: try backend, fallback to mock data (for public read endpoints)
const tryBackend = async (endpoint, fallback) => {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(300), // Reduced timeout to 300ms for instant fallback
    });
    if (!res.ok) throw new Error('Backend error');
    const data = await res.json();
    if (data.success) return data;
    throw new Error('Backend returned unsuccessful');
  } catch {
    // Backend unavailable — use mock data
    return null;
  }
};

const CATEGORY_MAP = {
  'rice & grains': 'rice-grains',
  'rice and grains': 'rice-grains',
  'rice-grains': 'rice-grains',
  'dal & pulses': 'dal-pulses',
  'dal and pulses': 'dal-pulses',
  'dal-pulses': 'dal-pulses',
  'oil & ghee': 'oil-ghee',
  'oil and ghee': 'oil-ghee',
  'oil-ghee': 'oil-ghee',
  'flour & baking': 'flour-baking',
  'flour and baking': 'flour-baking',
  'flour-baking': 'flour-baking',
  'masalas & spices': 'masalas-spices',
  'masalas and spices': 'masalas-spices',
  'masalas-spices': 'masalas-spices',
  'sugar & salt': 'sugar-salt',
  'sugar and salt': 'sugar-salt',
  'sugar-salt': 'sugar-salt',
  'household essentials': 'household',
  'household': 'household',
  'cleaning supplies': 'cleaning',
  'cleaning': 'cleaning',
  'personal care': 'personal-care',
  'personal-care': 'personal-care',
  'snacks & biscuits': 'snacks',
  'snacks and biscuits': 'snacks',
  'snacks': 'snacks',
};

const CATEGORY_KEYWORDS = {
  'rice-grains': ['rice', 'grain', 'atta', 'maida', 'wheat', 'corn', 'rava', 'sooji', 'basmati', 'ponni'],
  'dal-pulses': ['dal', 'rajma', 'chana', 'toor', 'moong', 'urad', 'pulses', 'lentil', 'split'],
  'oil-ghee': ['oil', 'ghee', 'sunflower', 'coconut', 'sesame', 'groundnut'],
  'flour-baking': ['flour', 'atta', 'maida', 'bread', 'baking', 'rava', 'sooji'],
  'masalas-spices': ['masala', 'spice', 'turmeric', 'chilli', 'cumin', 'mustard', 'pepper', 'garam'],
  'sugar-salt': ['sugar', 'salt', 'jaggery', 'vellam', 'sakkarai', 'karupatti'],
  'household': ['household', 'soap', 'detergent', 'cleaner', 'dish'],
  'cleaning': ['cleaning', 'soap', 'detergent', 'floor', 'wash'],
  'personal-care': ['shampoo', 'body', 'cream', 'tooth', 'sanitary', 'soap'],
  'snacks': ['snack', 'biscuit', 'papad', 'chips', 'cookie', 'jamun'],
};

const normalizeCategory = (cat) => {
  if (!cat) return null;
  const normalized = String(cat).trim().toLowerCase();
  return CATEGORY_MAP[normalized] || normalized;
};

const getLocalProductOverride = (backendProduct) => {
  const id = backendProduct?._id || backendProduct?.id;
  if (!id) return null;
  return products.find((product) => String(product.id) === String(id)) || null;
};

const matchesCategory = (product, cat) => {
  const normalized = normalizeCategory(cat);
  if (!normalized) return true;

  const productCategory = String(product.category || '').toLowerCase();
  const productName = String(product.name || '').toLowerCase();
  const haystack = `${productCategory} ${productName}`;

  if (productCategory === normalized) return true;
  if (productCategory === CATEGORY_MAP[normalized]) return true;

  const keywords = CATEGORY_KEYWORDS[normalized] || [];
  return keywords.some(keyword => haystack.includes(keyword));
};

export const api = {
  setAuthToken,

  // --- Auth & Profile ---
  register: async (userData) => {
    // Generate a demo uid for the user
    const uid = 'web_' + Date.now();
    const payload = {
      uid,
      name: userData.name,
      email: userData.email,
      phone: userData.phone
    };
    try {
      const data = await fetchWithAuth('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
      if (data.success) {
        data.token = 'demo-token-' + uid;
        if (typeof window !== 'undefined') localStorage.setItem(`mock_user_${userData.email}`, JSON.stringify(data.user || payload));
      }
      return data;
    } catch (e) {
      if (typeof window !== 'undefined') localStorage.setItem(`mock_user_${userData.email}`, JSON.stringify(payload));
      return {
        success: true,
        user: payload,
        token: 'demo-token-' + uid
      };
    }
  },
  login: async (email, password) => {
    // Since this is a demo environment, we simulate login locally by returning a mock user.
    const uid = email.replace(/[^a-zA-Z0-9]/g, '_');
    const token = 'demo-token-' + uid;
    const isAdmin = email.toLowerCase() === 'admin@freshkart.com';

    // Keep the mock token for local state and demo API fallbacks.
    authToken = token;

    try {
      const data = await fetchWithAuth('/auth/me');
      if (data.success || data.user) {
        return { success: true, user: data.user || data, token };
      }
      throw new Error('User not found');
    } catch (e) {
      if (isAdmin) {
        return {
          success: true,
          user: {
            _id: uid,
            name: 'Admin Manager',
            email,
            role: 'admin',
          },
          token,
        };
      }

      // Check if user was registered locally
      let savedUser = null;
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`mock_user_${email}`);
        if (stored) savedUser = JSON.parse(stored);
      }

      return {
        success: true,
        user: savedUser || {
          _id: uid,
          name: email.split('@')[0],
          email,
          phone: '0000000000',
        },
        token,
      };
    }
  },
  getMe: async () => {
    const data = await fetchWithAuth('/auth/me');
    return data.user;
  },
  updateProfile: async (userData) => {
    const data = await fetchWithAuth('/auth/me', { method: 'PUT', body: JSON.stringify(userData) });
    return data.user;
  },
  addAddress: async (address) => {
    const data = await fetchWithAuth('/auth/me/addresses', { method: 'POST', body: JSON.stringify(address) });
    return data.addresses;
  },
  deleteAddress: async (addressId) => {
    const data = await fetchWithAuth(`/auth/me/addresses/${addressId}`, { method: 'DELETE' });
    return data.addresses;
  },

  getCategories: async () => {
    const data = await tryBackend('/categories');
    if (data && data.categories && data.categories.length > 0) {
      return data.categories.map((c, i) => ({
        id: c._id || String(i + 1),
        name: c.name,
        image_url: c.image_url || c.image,
        color: categories[i]?.color || '#E8F5E9',
        icon: categories.find(fc => fc.name.toLowerCase() === c.name.toLowerCase())?.icon || '📦',
      }));
    }
    return categories;
  },

  // ── Products ──
  getProducts: async (cat = null) => {
    let customProducts = [];
    if (typeof window !== 'undefined') {
      try {
        customProducts = JSON.parse(localStorage.getItem('nearmart_admin_products') || '[]');
      } catch(e) {}
    }
    
    // Create a merged list where custom products (by id) override or add to standard products
    const mergedMap = new Map(products.map(p => [p.id, p]));
    customProducts.forEach(p => mergedMap.set(p.id, p));
    const allProducts = Array.from(mergedMap.values());

    const query = cat ? `?category=${encodeURIComponent(cat)}&limit=1000` : '?limit=1000';
    const data = await tryBackend(`/products${query}`);
    
    if (data && data.products && data.products.length > 0) {
      const mapped = data.products.map((product) => {
        const mappedProduct = mapBackendProduct(product);
        const localOverride = getLocalProductOverride(product) || customProducts.find(cp => cp.id === mappedProduct.id);
        return localOverride ? { ...mappedProduct, ...localOverride, id: mappedProduct.id } : mappedProduct;
      });
      return cat ? mapped.filter(product => matchesCategory(product, cat)) : mapped;
    }
    
    return cat ? allProducts.filter(product => matchesCategory(product, cat)) : allProducts;
  },

  getProductById: async (id) => {
    const actualId = id.includes('__') ? id.split('__')[1] : id;
    let customProducts = [];
    if (typeof window !== 'undefined') {
      try {
        customProducts = JSON.parse(localStorage.getItem('nearmart_admin_products') || '[]');
      } catch(e) {}
    }

    const data = await tryBackend(`/products/${actualId}`);
    if (data && data.product) {
      const mappedProduct = mapBackendProduct(data.product);
      const localOverride = getLocalProductOverride(data.product) || customProducts.find(cp => cp.id === mappedProduct.id);
      return localOverride ? { ...mappedProduct, ...localOverride, id: mappedProduct.id } : mappedProduct;
    }
    
    return customProducts.find(p => p.id === actualId) || products.find(p => p.id === actualId);
  },

  getRecommended: async () => {
    const data = await tryBackend('/products?recommended=true&limit=10');
    if (data && data.products && data.products.length > 0) return data.products.map(mapBackendProduct);
    return recommendedProducts;
  },

  getTrending: async () => {
    const data = await tryBackend('/products?trending=true&limit=10');
    if (data && data.products && data.products.length > 0) return data.products.map(mapBackendProduct);
    return trendingProducts;
  },

  getMegaDeals: async () => {
    const data = await tryBackend('/products?megaDeal=true&limit=12');
    if (data && data.products && data.products.length > 0) return data.products.map(mapBackendProduct);
    return megaDeals;
  },

  getNewArrivals: async () => {
    return newArrivals;
  },

  getSmartSuggestions: async (cartItemIds) => {
    const cleanIds = cartItemIds.map(id => id.includes('__') ? id.split('__')[1] : id);
    if (cleanIds.length > 0) {
      const data = await tryBackend(`/products/suggestions?ids=${cleanIds.join(',')}`);
      if (data && data.suggestions && data.suggestions.length > 0) {
        return data.suggestions.map(mapBackendProduct);
      }
    }
    const seen = new Map();
    cleanIds.forEach(id => {
      const suggestedIds = smartSuggestionsMap[id] || [];
      suggestedIds.forEach(sId => {
        const prod = products.find(p => p.id === sId);
        if (prod && !seen.has(sId)) seen.set(sId, prod);
      });
    });
    return Array.from(seen.values()).slice(0, 10);
  },

  getBundleSuggestions: async () => {
    return bundleSuggestions;
  },

  search: async (query) => {
    if (!query || query.length < 2) return { products: [], categories: [] };
    const data = await tryBackend(`/products?search=${encodeURIComponent(query)}&limit=8`);
    if (data && data.products) {
      return {
        products: data.products.map(mapBackendProduct),
        categories: categories.filter(c => c.name.toLowerCase().includes(query.toLowerCase())),
      };
    }
    await delay(100);
    const q = query.toLowerCase();
    const matchedProducts = products.filter(p =>
      p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.tag || '').toLowerCase().includes(q)
    ).slice(0, 8);
    const matchedCategories = categories.filter(c => c.name.toLowerCase().includes(q));
    return { products: matchedProducts, categories: matchedCategories };
  },

  // --- Cart ---
  getCart: async () => {
    try {
      const data = await fetchWithAuth('/cart');
      return data.cart || { items: [], totalPrice: 0 };
    } catch (e) {
      return { items: [], totalPrice: 0 };
    }
  },
  addToCart: async (productId, quantity) => {
    const actualId = productId.includes('__') ? productId.split('__')[1] : productId;
    const data = await fetchWithAuth('/cart', { method: 'POST', body: JSON.stringify({ productId: actualId, quantity }) });
    return data.cart;
  },
  updateCartItem: async (productId, quantity) => {
    const actualId = productId.includes('__') ? productId.split('__')[1] : productId;
    const data = await fetchWithAuth('/cart/update', { method: 'PUT', body: JSON.stringify({ productId: actualId, quantity }) });
    return data.cart;
  },
  removeFromCart: async (productId) => {
    const actualId = productId.includes('__') ? productId.split('__')[1] : productId;
    const data = await fetchWithAuth(`/cart/${actualId}`, { method: 'DELETE' });
    return data.cart;
  },
  clearCart: async () => {
    const data = await fetchWithAuth('/cart/clear', { method: 'DELETE' });
    return data;
  },
  syncCart: async (items) => {
    const data = await fetchWithAuth('/cart/sync', { method: 'POST', body: JSON.stringify({ items }) });
    return data;
  },
  addComboToCart: async (comboId) => {
    const data = await fetchWithAuth('/cart/combo', { method: 'POST', body: JSON.stringify({ comboId }) });
    return data;
  },

  // --- Orders ---
  createOrder: async (orderData) => {
    const data = await fetchWithAuth('/orders', { method: 'POST', body: JSON.stringify(orderData) });
    return data.order;
  },
  getMyOrders: async () => {
    try {
      const data = await fetchWithAuth('/orders');
      return (data.orders || []).map(o => ({ ...o, id: o._id }));
    } catch (err) {
      // Backend unavailable or auth failed. Use safe local mock orders instead of throwing.
      return mockOrders.map((order) => ({ ...order, id: order._id || order.id }));
    }
  },

  // --- Combos ---
  getActiveCombos: async () => {
    const data = await tryBackend('/combos');
    return data?.combos || [];
  },

  // Fallback Process Payment (if you still want to mock checkout without backend)
  processPayment: async (data) => {
    await delay(2000);
    return {
      success: true,
      orderId: `ORD${Date.now()}`,
      transactionId: `TXN${Math.floor(Math.random() * 9_999_999)}`,
      estimatedDelivery: '12–18 mins',
      deliveryBoy: {
        name: 'Ravi Kumar',
        phone: '+91 98765 43210',
        rating: 4.8,
      },
    };
  },
};

function mapBackendProduct(p) {
  // Find matching product in mockData to use its translations as a fallback
  const mockProduct = products.find(mp => mp.id === p._id || mp.id === p.id) || products.find(mp => mp.name === p.name) || {};

  const discount = p.originalPrice && p.originalPrice > p.price
    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
    : 0;

  const safeImageUrl = getSafeProductImage(
    {
      ...mockProduct,
      id: p._id || p.id,
      name: p.name || mockProduct.name,
    },
    p.image_url || p.image || mockProduct.image_url
  );

  return {
    id: p._id || p.id,
    name: p.name,
    name_ta: p.name_ta || mockProduct.name_ta,
    name_te: p.name_te || mockProduct.name_te,
    name_kn: p.name_kn || mockProduct.name_kn,
    name_ml: p.name_ml || mockProduct.name_ml,
    name_hi: p.name_hi || mockProduct.name_hi,
    price: p.price,
    originalPrice: p.originalPrice,
    rating: p.rating || 0,
    reviews: p.reviewCount || 0,
    category: p.category,
    unit: p.unit || mockProduct.unit || '1 kg',
    image_url: safeImageUrl,
    tag: (p.tags && p.tags.find(t => ['Traditional', 'Pure', 'Premium', 'Recommended', 'Trending'].includes(t))) ||
      (p.isTrending ? 'Trending' : p.isRecommended ? 'Recommended' : (p.tags && p.tags[0]) || ''),
    discount,
    stock: p.stock,
    isAvailable: p.isAvailable !== false,
  };
}
