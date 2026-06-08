import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Local network IP - phone and PC must be on the same Wi-Fi
export const API_BASE_URL = 'http://192.168.1.103:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

let authToken = null;

apiClient.interceptors.request.use(async (config) => {
  try {
    // If the header isn't already set by defaults, try to set it from in-memory or storage
    if (!config.headers.Authorization) {
      let token = authToken;
      if (!token) {
        token = await AsyncStorage.getItem('groceryAppToken');
        authToken = token;
      }
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.error('API Request Interceptor Error:', error);
  }
  return config;
}, (error) => Promise.reject(error));

export const api = {
  setAuthToken: (token) => {
    authToken = token;
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  },
  // --- Firebase Sync & Profile ---
  register: async (userData) => {
    // Sync Firebase user with backend profile
    const res = await apiClient.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data.user;
  },
  updateProfile: async (data) => {
    const res = await apiClient.put('/auth/me', data);
    return res.data.user;
  },
  addAddress: async (address) => {
    const res = await apiClient.post('/auth/me/addresses', address);
    return res.data.addresses;
  },
  deleteAddress: async (addressId) => {
    const res = await apiClient.delete(`/auth/me/addresses/${addressId}`);
    return res.data.addresses;
  },

  // --- Products & Categories ---
  getCategories: async () => {
    const res = await apiClient.get('/categories');
    return res.data.categories || [];
  },
  getProducts: async (category = null) => {
    const url = category ? `/products?category=${category}&limit=1000` : '/products?limit=1000';
    const res = await apiClient.get(url);
    return (res.data.products || []).map(p => ({ ...p, id: p._id }));
  },
  getProductById: async (id) => {
    const res = await apiClient.get(`/products/${id}`);
    const p = res.data.product || null;
    return p ? { ...p, id: p._id } : null;
  },

  // --- Cart ---
  getCart: async () => {
    try {
      const res = await apiClient.get('/cart');
      return res.data.cart || { items: [], totalPrice: 0 };
    } catch (e) {
      return { items: [], totalPrice: 0 };
    }
  },
  addToCart: async (productId, quantity) => {
    const res = await apiClient.post('/cart', { productId, quantity });
    return res.data.cart;
  },
  updateCartItem: async (productId, quantity) => {
    const res = await apiClient.put('/cart/update', { productId, quantity });
    return res.data.cart;
  },
  removeFromCart: async (productId) => {
    const res = await apiClient.delete(`/cart/${productId}`);
    return res.data.cart;
  },
  clearCart: async () => {
    const res = await apiClient.delete('/cart');
    return res.data;
  },
  syncCart: async (items) => {
    const res = await apiClient.post('/cart/sync', { items });
    return res.data;
  },
  addComboToCart: async (comboId) => {
    const res = await apiClient.post('/cart/combo', { comboId });
    return res.data;
  },

  // --- Orders ---
  createOrder: async (orderData) => {
    const res = await apiClient.post('/orders', orderData);
    return res.data.order;
  },
  getMyOrders: async () => {
    const res = await apiClient.get('/orders');
    return (res.data.orders || []).map(o => ({ ...o, id: o._id }));
  },
  
  // --- Combos ---
  getActiveCombos: async () => {
    const res = await apiClient.get('/combos');
    return res.data.combos || [];
  }
};
