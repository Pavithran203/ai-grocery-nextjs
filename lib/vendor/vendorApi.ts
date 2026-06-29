"use client";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

function getToken() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('nearmart-vendor-session');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed?.state?.token || null;
    }
  } catch {}
  return null;
}

function headers() {
  const token = getToken();
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

export const vendorApi = {
  // ── Store Profile ──
  getProfile: async () => {
    const res = await fetch(`${API_BASE}/api/vendor/profile`, { headers: headers() });
    return res.json();
  },

  updateProfile: async (data: any) => {
    const res = await fetch(`${API_BASE}/api/vendor/profile`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  registerStore: async (data: any) => {
    const res = await fetch(`${API_BASE}/api/vendor/register`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // ── Dashboard ──
  getDashboard: async () => {
    const res = await fetch(`${API_BASE}/api/vendor/dashboard`, { headers: headers() });
    return res.json();
  },

  // ── Catalog ──
  searchCatalog: async (search = '') => {
    const res = await fetch(`${API_BASE}/api/vendor/catalog?search=${encodeURIComponent(search)}`, { headers: headers() });
    return res.json();
  },

  // ── Listings / Inventory ──
  getListings: async () => {
    const res = await fetch(`${API_BASE}/api/vendor/listings`, { headers: headers() });
    return res.json();
  },

  addListing: async (data: any) => {
    const res = await fetch(`${API_BASE}/api/vendor/listings`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  updateListing: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/api/vendor/listings/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  deleteListing: async (id: string) => {
    const res = await fetch(`${API_BASE}/api/vendor/listings/${id}`, {
      method: 'DELETE',
      headers: headers(),
    });
    return res.json();
  },

  bulkUpdate: async (updates: any[]) => {
    const res = await fetch(`${API_BASE}/api/vendor/listings/bulk`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ updates }),
    });
    return res.json();
  },

  // ── Product Requests ──
  requestProduct: async (data: any) => {
    const res = await fetch(`${API_BASE}/api/vendor/request-product`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // ── Orders ──
  getOrders: async () => {
    const res = await fetch(`${API_BASE}/api/vendor/orders`, { headers: headers() });
    return res.json();
  },

  updateOrderStatus: async (id: string, orderStatus: string) => {
    const res = await fetch(`${API_BASE}/api/vendor/orders/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ orderStatus }),
    });
    return res.json();
  },
};
