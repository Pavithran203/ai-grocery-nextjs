// ── Base URL ──────────────────────────────────────────────────
// Client-side: uses Next.js proxy (relative path). Server-side: fetches Node Express directly.
const BASE_URL = typeof window !== 'undefined' ? '/api' : 'http://localhost:5000/api';
// ── Auth token helper (client only) ──────────────────────────
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('fk_token') || '';
  }
  return '';
};

export const setToken = (token) => {
  if (typeof window !== 'undefined') localStorage.setItem('fk_token', token);
};

export const removeToken = () => {
  if (typeof window !== 'undefined') localStorage.removeItem('fk_token');
};

// ── Core fetch wrapper ────────────────────────────────────────
const apiFetch = async (path, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers, cache: 'no-store' });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || data.message || 'API Error');
  }
  return data;
};

// ── Public API ────────────────────────────────────────────────
export const api = {

  // ── Categories ──────────────────────────────────────────────
  getCategories: () =>
    apiFetch('/categories').then(d => d.categories),

  // ── Products ─────────────────────────────────────────────────
  getProducts: (category = null) => {
    const q = category ? `?category=${encodeURIComponent(category)}` : '';
    return apiFetch(`/products${q}`).then(d => d.products);
  },

  getProductById: (id) =>
    apiFetch(`/products/${id}`).then(d => d.product),

  getRecommended: () =>
    apiFetch('/products?recommended=true').then(d => d.products),

  getTrending: () =>
    apiFetch('/products?trending=true').then(d => d.products),

  getMegaDeals: () =>
    apiFetch('/products?mega_deal=true').then(d => d.products),

  searchProducts: (query) =>
    apiFetch(`/products?search=${encodeURIComponent(query)}`).then(d => d.products),

  getSmartSuggestions: (cartItemIds) => {
    if (!cartItemIds || !cartItemIds.length) return Promise.resolve([]);
    const ids = cartItemIds.join(',');
    return apiFetch(`/products/suggestions?ids=${ids}`).then(d => d.suggestions);
  },

  // ── Auth ─────────────────────────────────────────────────────
  login: (email, password) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name, email, password, phone) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone }),
    }),

  getMe: () =>
    apiFetch('/auth/me'),

  updateProfile: (data) =>
    apiFetch('/auth/me', { method: 'PUT', body: JSON.stringify(data) }),

  addAddress: (data) =>
    apiFetch('/auth/me/addresses', { method: 'POST', body: JSON.stringify(data) }),

  deleteAddress: (addressId) =>
    apiFetch(`/auth/me/addresses/${addressId}`, { method: 'DELETE' }),

  // ── Cart (authenticated) ─────────────────────────────────────
  getCart: () =>
    apiFetch('/cart').then(d => d.cart),

  addToCart: (productId, quantity = 1) =>
    apiFetch('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }).then(d => d.cart),

  updateCartItem: (productId, quantity) =>
    apiFetch(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }).then(d => d.cart),

  removeFromCart: (productId) =>
    apiFetch(`/cart/${productId}`, { method: 'DELETE' }).then(d => d.cart),

  clearCart: () =>
    apiFetch('/cart/clear', { method: 'DELETE' }),

  // ── Orders (authenticated) ───────────────────────────────────
  createOrder: (deliveryAddress, paymentMethod = 'COD', notes = '', paymentDetails = {}) =>
    apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify({
        deliveryAddress,
        paymentMethod,
        notes,
        paymentDetails,
      }),
    }).then(d => d.order),

  getMyOrders: () =>
    apiFetch('/orders').then(d => d.orders),

  getOrderById: (id) =>
    apiFetch(`/orders/${id}`).then(d => d.order),

  cancelOrder: (id) =>
    apiFetch(`/orders/${id}/cancel`, { method: 'PUT' }).then(d => d.order),

  trackOrder: (id) =>
    apiFetch(`/orders/${id}`).then(d => d.order),


  // ── Admin ────────────────────────────────────────────────────
  createProduct: (data) =>
    apiFetch('/products', { method: 'POST', body: JSON.stringify(data) }).then(d => d.product),

  getAllOrders: () =>
    apiFetch('/orders/admin/all').then(d => d.orders),

  updateOrderStatus: (id, orderStatus) =>
    apiFetch(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ orderStatus }),
    }).then(d => d.order),

  // ── Customers (Admin) ────────────────────────────────────────
  getCustomers: (page = 1, limit = 20, search = '', status = '', accountType = '') => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (accountType) params.append('accountType', accountType);
    return apiFetch(`/customers?${params}`).then(d => ({ customers: d.customers, pagination: d.pagination }));
  },

  getCustomerById: (id) =>
    apiFetch(`/customers/${id}`).then(d => d.customer),

  getCustomerStats: () =>
    apiFetch('/customers/stats').then(d => d.statistics),

  createCustomer: (data) =>
    apiFetch('/customers', { method: 'POST', body: JSON.stringify(data) }).then(d => d.customer),

  updateCustomer: (id, data) =>
    apiFetch(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(d => d.customer),

  deleteCustomer: (id) =>
    apiFetch(`/customers/${id}`, { method: 'DELETE' }),

  resetCustomerPassword: (id, newPassword) =>
    apiFetch(`/customers/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword })
    }).then(d => d.customer),

  addLoyaltyPoints: (id, points) =>
    apiFetch(`/customers/${id}/loyalty`, { method: 'POST', body: JSON.stringify({ points }) }).then(d => d.customer),

  // ── Deliveries (Admin & Customer) ────────────────────────────
  getDeliveries: (page = 1, limit = 20, status = '', customerId = '') => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (status) params.append('status', status);
    if (customerId) params.append('customerId', customerId);
    return apiFetch(`/deliveries?${params}`).then(d => ({ deliveries: d.deliveries, pagination: d.pagination }));
  },

  getDeliveryById: (id) =>
    apiFetch(`/deliveries/${id}`).then(d => d.delivery),

  getDeliveryStats: () =>
    apiFetch('/deliveries/stats').then(d => d.statistics),

  createDelivery: (data) =>
    apiFetch('/deliveries', { method: 'POST', body: JSON.stringify(data) }).then(d => d.delivery),

  updateDelivery: (id, data) =>
    apiFetch(`/deliveries/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(d => d.delivery),

  deleteDelivery: (id) =>
    apiFetch(`/deliveries/${id}`, { method: 'DELETE' }),

  addTrackingEvent: (id, data) =>
    apiFetch(`/deliveries/${id}/track`, { method: 'POST', body: JSON.stringify(data) }).then(d => d.delivery),

  verifyDeliveryOTP: (id, otp) =>
    apiFetch(`/deliveries/${id}/verify-otp`, { method: 'POST', body: JSON.stringify({ otp }) }).then(d => d.delivery),

  rateDelivery: (id, rating, feedback) =>
    apiFetch(`/deliveries/${id}/rate`, { method: 'POST', body: JSON.stringify({ rating, feedback }) }).then(d => d.delivery),

  // ── Notifications ────────────────────────────────────────────
  getNotifications: () =>
    apiFetch('/notifications'),

  markNotificationRead: (id) =>
    apiFetch(`/notifications/${id}/read`, { method: 'PUT' }),

  markAllRead: () =>
    apiFetch('/notifications/read-all', { method: 'PUT' }),
};
