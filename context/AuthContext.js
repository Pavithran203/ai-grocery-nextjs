"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, setAuthToken } from '@/services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const router = useRouter();

  // Load saved auth on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('freshkart_token') || sessionStorage.getItem('freshkart_token');
    const savedUser = localStorage.getItem('freshkart_user') || sessionStorage.getItem('freshkart_user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setAuthToken(savedToken); // Set it in api service
      } catch (e) {
        localStorage.removeItem('freshkart_token');
        localStorage.removeItem('freshkart_user');
        sessionStorage.removeItem('freshkart_token');
        sessionStorage.removeItem('freshkart_user');
      }
    }
    setLoading(false);
  }, []);

  // Register
  const register = async (name, email, password, phone = '') => {
    try {
      const data = await api.register({ name, email, password, phone });
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        setAuthToken(data.token);
        localStorage.setItem('freshkart_token', data.token);
        localStorage.setItem('freshkart_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Registration failed' };
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const data = await api.login(email, password);
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        setAuthToken(data.token);
        localStorage.setItem('freshkart_token', data.token);
        localStorage.setItem('freshkart_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: data.message || 'Invalid credentials' };
    } catch (err) {
      return { success: false, message: err.message || 'Invalid credentials' };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem('freshkart_token');
    localStorage.removeItem('freshkart_user');
    sessionStorage.removeItem('freshkart_token');
    sessionStorage.removeItem('freshkart_user');
    router.push('/');
  };

  // Get current user from API
  const fetchMe = async () => {
    if (!token) return;
    try {
      const userData = await api.getMe();
      if (userData) {
        setUser(userData);
        localStorage.setItem('freshkart_user', JSON.stringify(userData));
      }
    } catch (err) {
      // Failed to fetch user, might be token expired
      if (err.message.includes('token') || err.message.includes('Unauthorized')) {
        logout();
      }
    }
  };

  // Update Profile
  const updateProfile = async (updates) => {
    try {
      const updatedUser = await api.updateProfile(updates);
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('freshkart_user', JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      }
      return { success: false, message: 'Failed to update profile' };
    } catch (err) {
      return { success: false, message: err.message || 'Failed to update profile' };
    }
  };

  // Guest Login Mock (optional, kept for UX continuity)
  const continueAsGuest = () => {
    const guestId = 'guest_' + Date.now();
    const guestUser = { name: 'Guest User', isGuest: true, _id: guestId };
    const guestToken = 'demo-token-' + guestId;
    
    setUser(guestUser);
    setToken(guestToken);
    setAuthToken(guestToken);
    sessionStorage.setItem('freshkart_user', JSON.stringify(guestUser));
    sessionStorage.setItem('freshkart_token', guestToken);
    return { success: true };
  };

  const loginWithOtp = async (phone, otp, name = '', email = '') => {
    // Left empty/mock since the backend might not support OTP yet
    return continueAsGuest();
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated,
      login,
      register,
      signup: register,
      updateProfile,
      loginWithOtp,
      continueAsGuest,
      logout,
      fetchMe,
      isLoginModalOpen,
      setLoginModalOpen,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
