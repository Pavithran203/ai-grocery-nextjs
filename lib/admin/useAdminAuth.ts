"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AdminUser, AuditEntry } from './mockData';
import { api } from '@/services/api';

interface AdminAuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  auditLogs: AuditEntry[];
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  addAuditEntry: (entry: Omit<AuditEntry, 'id'>) => void;
}

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      auditLogs: [],
      login: async (email, password) => {
        try {
          const response = await fetch('/api/admin/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const data = await response.json();
          if (!response.ok) {
            return { success: false, message: data.message || 'Invalid admin credentials' };
          }

          if (typeof window !== 'undefined') {
            localStorage.setItem('nearmart_admin_token', data.token);
            localStorage.setItem('nearmart_admin_user', JSON.stringify(data.user));
          }

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            auditLogs: [{
              id: `audit-${Date.now()}`,
              timestamp: new Date().toISOString(),
              actor: data.user.name,
              action: 'Admin login',
              details: `${data.user.role} signed in to the admin portal`,
            }, ...get().auditLogs],
          });

          return { success: true };
        } catch (error) {
          return { success: false, message: 'Failed to authenticate. Please try again later.' };
        }
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('nearmart_admin_token');
          localStorage.removeItem('nearmart_admin_user');
        }
        set({ user: null, token: null, isAuthenticated: false, auditLogs: [] });
      },
      addAuditEntry: (entry) => set((state) => ({
        auditLogs: [{ id: `audit-${Date.now()}`, ...entry }, ...state.auditLogs].slice(0, 20),
      })),
    }),
    {
      name: 'nearmart-admin-session',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? window.localStorage : null)),
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated, auditLogs: state.auditLogs }),
    }
  )
);
