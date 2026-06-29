"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

interface VendorStore {
  _id: string;
  name: string;
  status: string;
  emoji?: string;
  address?: string;
  city?: string;
  area?: string;
  openTime?: string;
  closeTime?: string;
}

interface VendorUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface VendorAuthState {
  user: VendorUser | null;
  token: string | null;
  store: VendorStore | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  setStore: (store: VendorStore | null) => void;
  fetchStore: () => Promise<void>;
}

export const useVendorAuth = create<VendorAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      store: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        try {
          set({ isLoading: true });

          // Use the same demo auth approach as admin
          const demoVendors: Record<string, { name: string; role: string }> = {
            'vendor@nearmart.com': { name: 'Kumar Grocery Store', role: 'vendor' },
            'lakshmi@nearmart.com': { name: 'Lakshmi Traders', role: 'vendor' },
          };

          const demoUser = demoVendors[email];
          if (demoUser && password === 'Vendor123!') {
            const uid = `vendor_${email.split('@')[0]}`;
            const token = `demo-token-${uid}`;

            const user: VendorUser = {
              _id: uid,
              name: demoUser.name,
              email,
              role: 'vendor',
            };

            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });

            // Fetch store profile
            try {
              const res = await fetch(`${API_BASE}/api/vendor/profile`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await res.json();
              if (data.success && data.store) {
                set({ store: data.store });
              }
            } catch {
              // Store not yet linked — will show onboarding
            }

            return { success: true };
          }

          set({ isLoading: false });
          return { success: false, message: 'Invalid vendor credentials. Use vendor@nearmart.com / Vendor123!' };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, message: 'Login failed. Please try again.' };
        }
      },

      logout: () => {
        set({ user: null, token: null, store: null, isAuthenticated: false });
      },

      setStore: (store) => set({ store }),

      fetchStore: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await fetch(`${API_BASE}/api/vendor/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.success && data.store) {
            set({ store: data.store });
          }
        } catch {
          // silent fail
        }
      },
    }),
    {
      name: 'nearmart-vendor-session',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? window.localStorage : null)),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        store: state.store,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
