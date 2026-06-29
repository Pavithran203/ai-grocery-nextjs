import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const FavoriteContext = createContext();

export const useFavorites = () => useContext(FavoriteContext);

const FAVORITES_PREFIX = '@nearmart_favorites_';
const PREFERRED_STORE_PREFIX = '@nearmart_preferred_store_';

export const FavoriteProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [preferredStoreId, setPreferredStoreId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const getFavoritesKey = () => user ? `${FAVORITES_PREFIX}${user.uid || user._id || user.id}` : null;
  const getPreferredStoreKey = () => user ? `${PREFERRED_STORE_PREFIX}${user.uid || user._id || user.id}` : null;

  useEffect(() => {
    const loadData = async () => {
      // Clear or skip if guest
      if (!user || user.isGuest) {
        setFavorites([]);
        setPreferredStoreId(null);
        setLoading(false);
        return;
      }

      const favoritesKey = getFavoritesKey();
      const preferredKey = getPreferredStoreKey();

      try {
        const storedFavorites = favoritesKey ? await AsyncStorage.getItem(favoritesKey) : null;
        const storedPreferred = preferredKey ? await AsyncStorage.getItem(preferredKey) : null;
        
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        } else {
          setFavorites([]);
        }
        
        if (storedPreferred) {
          setPreferredStoreId(storedPreferred);
        } else {
          setPreferredStoreId(null);
        }
      } catch (e) {
        console.error('Error loading favorite stores:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const toggleFavorite = async (storeId) => {
    const favoritesKey = getFavoritesKey();
    const updatedFavorites = favorites.includes(storeId)
      ? favorites.filter(id => id !== storeId)
      : [...favorites, storeId];
    
    setFavorites(updatedFavorites);

    // Only persist for non-guests
    if (user && !user.isGuest && favoritesKey) {
      try {
        await AsyncStorage.setItem(favoritesKey, JSON.stringify(updatedFavorites));
      } catch (e) {
        console.error('Error toggling favorite:', e);
      }
    }
  };

  const isFavorite = (storeId) => favorites.includes(storeId);

  const setPreferredStore = async (storeId) => {
    const preferredKey = getPreferredStoreKey();
    try {
      setPreferredStoreId(storeId);
      if (user && !user.isGuest && preferredKey) {
        if (storeId) {
          await AsyncStorage.setItem(preferredKey, storeId);
        } else {
          await AsyncStorage.removeItem(preferredKey);
        }
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

