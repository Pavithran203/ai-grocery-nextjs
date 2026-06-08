import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const FavoriteContext = createContext();

export const useFavorites = () => useContext(FavoriteContext);

const FAVORITES_KEY = '@freshkart_favorites';
const PREFERRED_STORE_KEY = '@freshkart_preferred_store';

export const FavoriteProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [preferredStoreId, setPreferredStoreId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      // Clear or skip if guest
      if (!user || user.isGuest) {
        setFavorites([]);
        setPreferredStoreId(null);
        setLoading(false);
        return;
      }

      try {
        const storedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
        const storedPreferred = await AsyncStorage.getItem(PREFERRED_STORE_KEY);
        
        if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
        if (storedPreferred) setPreferredStoreId(storedPreferred);
      } catch (e) {
        console.error('Error loading favorite stores:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const toggleFavorite = async (storeId) => {
    const updatedFavorites = favorites.includes(storeId)
      ? favorites.filter(id => id !== storeId)
      : [...favorites, storeId];
    
    setFavorites(updatedFavorites);

    // Only persist for non-guests
    if (user && !user.isGuest) {
      try {
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      } catch (e) {
        console.error('Error toggling favorite:', e);
      }
    }
  };

  const isFavorite = (storeId) => favorites.includes(storeId);

  const setPreferredStore = async (storeId) => {
    try {
      setPreferredStoreId(storeId);
      if (storeId) {
        await AsyncStorage.setItem(PREFERRED_STORE_KEY, storeId);
      } else {
        await AsyncStorage.removeItem(PREFERRED_STORE_KEY);
      }
    } catch (e) {
      console.error('Error setting preferred store:', e);
    }
  };

  return (
    <FavoriteContext.Provider value={{
      favorites,
      preferredStoreId,
      toggleFavorite,
      isFavorite,
      setPreferredStore,
      loading
    }}>
      {children}
    </FavoriteContext.Provider>
  );
};
