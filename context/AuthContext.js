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
    const savedToken = localStorage.getItem('nearmart_token') || sessionStorage.getItem('nearmart_token');
    const savedUser = localStorage.getItem('nearmart_user') || sessionStorage.getItem('nearmart_user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setAuthToken(savedToken); // Set it in api service
      } catch (e) {
        localStorage.removeItem('nearmart_token');
        localStorage.removeItem('nearmart_user');
        sessionStorage.removeItem('nearmart_token');
        sessionStorage.removeItem('nearmart_user');
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
        localStorage.setItem('nearmart_token', data.token);
        localStorage.setItem('nearmart_user', JSON.stringify(data.user));

        // Reset loyalty coins to 0 for a brand new register
        const userId = data.user?._id || data.user?.id;
        if (userId) {
          localStorage.setItem(`nearmart_coins_${userId}`, '0');
          localStorage.setItem(`nearmart_coins_history_${userId}`, '[]');
        }

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
        localStorage.setItem('nearmart_token', data.token);
        localStorage.setItem('nearmart_user', JSON.stringify(data.user));
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
    localStorage.removeItem('nearmart_token');
    localStorage.removeItem('nearmart_user');
    localStorage.removeItem('nearmart-admin-session');
    sessionStorage.removeItem('nearmart_token');
    sessionStorage.removeItem('nearmart_user');
    router.push('/');
  };

  // Get current user from API
  const fetchMe = async () => {
    if (!token) return;
    try {
      const userData = await api.getMe();
      if (userData) {
        setUser(userData);
        localStorage.setItem('nearmart_user', JSON.stringify(userData));
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
        localStorage.setItem('nearmart_user', JSON.stringify(updatedUser));
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
    sessionStorage.setItem('nearmart_user', JSON.stringify(guestUser));
    sessionStorage.setItem('nearmart_token', guestToken);
    return { success: true };
  };

  const loginWithOtp = async (phone, otp, name = '', email = '') => {
    // Completely wipe out any old "Guest User" session before proceeding
    localStorage.removeItem('nearmart_user');
    localStorage.removeItem('nearmart_token');
    sessionStorage.removeItem('nearmart_user');
    sessionStorage.removeItem('nearmart_token');

    if (name) {
      // If they provided a name, create a real account for them
      const userEmail = email || `user_${phone || Date.now()}@nearmart.com`;
      const password = 'DemoPassword123!'; // Mock password since they used OTP
      
      // Try to register
      const regRes = await register(name, userEmail, password, phone);
      if (regRes.success) {
        // Force the user object to have the name they just typed, even if the backend returns a fallback
        const updatedUser = { ...regRes.user, name };
        setUser(updatedUser);
        localStorage.setItem('nearmart_user', JSON.stringify(updatedUser));

        // Reset loyalty coins to 0 for a brand new signup!
        const userId = updatedUser._id || updatedUser.id;
        if (userId) {
          localStorage.setItem(`nearmart_coins_${userId}`, '0');
          localStorage.setItem(`nearmart_coins_history_${userId}`, '[]');
        }

        return { success: true };
      }
      
      // If email/phone exists, try login
      const logRes = await login(userEmail, password);
      if (logRes.success) {
        // Force the user object to have the name they just typed
        const updatedUser = { ...logRes.user, name };
        setUser(updatedUser);
        localStorage.setItem('nearmart_user', JSON.stringify(updatedUser));

        // Reset loyalty coins to 0 for a brand new profile setup!
        const userId = updatedUser._id || updatedUser.id;
        if (userId) {
          localStorage.setItem(`nearmart_coins_${userId}`, '0');
          localStorage.setItem(`nearmart_coins_history_${userId}`, '[]');
        }

        return { success: true };
      }
    }

    // Fallback if absolutely no name provided or everything failed
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
