"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, getToken, removeToken, setToken } from "@/services/api";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // true until first auth check done

  // ── Bootstrap: verify stored token on mount ───────────────────
  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }

    api.getMe()
      .then(data => setUser(data.user || null))
      .catch(() => { removeToken(); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  // ── Login helper (called by login page) ───────────────────────
  const login = useCallback(async (email, password) => {
    const data = await api.login(email, password);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  // ── Register helper ───────────────────────────────────────────
  const register = useCallback(async (name, email, password, phone) => {
    const data = await api.register(name, email, password, phone);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  // ── Logout ─────────────────────────────────────────────────────
  const logout = useCallback(() => {
    removeToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}
