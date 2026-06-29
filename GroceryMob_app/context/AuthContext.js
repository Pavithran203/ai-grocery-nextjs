import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Stable Demo Credentials
const DEMO_USER = {
  uid: 'demo-user-123',
  name: 'Demo User',
  email: 'demo@gmail.com',
  phone: '9876543210',
  isGuest: false,
  addresses: []
};

const FIXED_OTP = '1234';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on startup
  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('nearmart_user');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          // Set demo token for backend compatibility
          await AsyncStorage.setItem('nearmart_token', 'demo-token-' + parsedUser.uid);
          setUser(parsedUser);
        }
      } catch (e) {
        console.error('Failed to load demo session', e);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  const clearAllLocalData = async () => {
    try {
      const keysToClear = [
        'nearmart_guest_cart',
        '@nearmart_addresses',
        'nearmart_guest_wishlist',
        'nearmart_guest_favorites',
        'nearmart_local_orders',
        '@nearmart_guest_orders',
        'nearmart_coupon',
        'searchPreferences'
      ];
      
      // Clear static keys
      for (const key of keysToClear) {
        await AsyncStorage.removeItem(key);
      }

      // Find and clear all user-specific keys
      const allKeys = await AsyncStorage.getAllKeys();
      const prefixesToClear = [
        '@nearmart_orders_',
        '@nearmart_wishlist_',
        '@nearmart_coins_',
        '@nearmart_coins_history_',
        '@nearmart_favorites_',
        '@nearmart_preferred_store_'
      ];
      const userKeys = allKeys.filter(k => prefixesToClear.some(pref => k.startsWith(pref)));
      for (const key of userKeys) {
        await AsyncStorage.removeItem(key);
      }
    } catch (e) {
      console.error('Error clearing local data:', e);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      if (email === 'demo@gmail.com' && password === '123456') {
        // Clear previous session data before logging in as a different user
        await clearAllLocalData();
        
        const userData = { ...DEMO_USER };
        const token = 'demo-token-' + userData.uid;
        await AsyncStorage.setItem('nearmart_user', JSON.stringify(userData));
        await AsyncStorage.setItem('nearmart_token', token);
        api.setAuthToken(token);
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, message: 'Invalid demo credentials. Use demo@gmail.com / 123456' };
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      // CLEAR ALL OLD DATA FOR NEW ACCOUNT
      await clearAllLocalData();

      const newUser = {
        uid: 'user-' + Date.now(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        isGuest: false,
        addresses: []
      };
      const token = 'demo-token-' + newUser.uid;
      await AsyncStorage.setItem('nearmart_user', JSON.stringify(newUser));
      await AsyncStorage.setItem('nearmart_token', token);
      api.setAuthToken(token);
      setUser(newUser);
      return { success: true };
    } catch (e) {
      return { success: false, message: 'Signup failed: ' + e.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('nearmart_user');
    await AsyncStorage.removeItem('nearmart_token');
    api.setAuthToken(null);
    setUser(null);
    return { success: true };
  };

  const forgotPassword = async (email) => {
    // Simulated forgot password
    return { success: true, message: 'Demo: Password reset link sent to ' + email };
  };

  const loginAsGuest = async (guestData = {}) => {
    console.log('🔑 Logging in as guest...', guestData.name || 'Anonymous');
    const guestUser = {
      uid: 'guest-' + Date.now(),
      name: guestData.name || 'Guest User',
      email: guestData.email || 'guest@example.com',
      phone: guestData.phone || '',
      addresses: guestData.address ? [guestData.address] : [],
      isGuest: true
    };
    const token = 'demo-token-' + guestUser.uid;
    await AsyncStorage.setItem('nearmart_user', JSON.stringify(guestUser));
    await AsyncStorage.setItem('nearmart_token', token);
    api.setAuthToken(token);
    setUser(guestUser);
    console.log('✅ Guest User state updated locally');
    return { success: true };
  };

  const sendOTP = async (phone) => {
    // Simulated OTP send
    return { success: true, message: 'OTP Sent Successfully (Demo)', dev_otp: FIXED_OTP };
  };

  const verifyOTP = async (phone, otp) => {
    if (otp === FIXED_OTP) {
      const userData = { ...DEMO_USER, phone };
      await AsyncStorage.setItem('nearmart_user', JSON.stringify(userData));
      await AsyncStorage.setItem('nearmart_token', 'demo-token-' + userData.uid);
      setUser(userData);
      return { success: true };
    } else {
      return { success: false, message: 'Invalid OTP. Use 1234 for demo.' };
    }
  };

  const updateProfile = async (data) => {
    const updatedUser = { ...user, ...data };
    await AsyncStorage.setItem('nearmart_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ 
      user, loading, login, signup, logout, forgotPassword, 
      loginAsGuest, sendOTP, verifyOTP, updateProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
