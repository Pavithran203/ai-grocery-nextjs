"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const FavoriteContext = createContext();

export const useFavorites = () => useContext(FavoriteContext);

const FAVORITES_KEY_PREFIX = 'nearmart_favorites_';
const PREFERRED_STORE_KEY_PREFIX = 'nearmart_preferred_store_';

export const FavoriteProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [preferredStoreId, setPreferredStoreId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const getFavKey = () => user ? `${FAVORITES_KEY_PREFIX}${user._id || user.id}` : null;
  const getPrefKey = () => user ? `${PREFERRED_STORE_KEY_PREFIX}${user._id || user.id}` : null;

  useEffect(() => {
    const loadData = () => {
      const favKey = getFavKey();
      const prefKey = getPrefKey();

      if (!favKey || !prefKey) {
        setFavorites([]);
        setPreferredStoreId(null);
        setLoading(false);
        return;
      }

      try {
        const storedFavorites = localStorage.getItem(favKey);
        const storedPreferred = localStorage.getItem(prefKey);
        
        if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
        else setFavorites([]);

        if (storedPreferred) setPreferredStoreId(storedPreferred);
        else setPreferredStoreId(null);
      } catch (e) {
        console.error('Error loading favorite stores:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const toggleFavorite = (storeId) => {
    const key = getFavKey();
    if (!key) return;

    try {
      const updatedFavorites = favorites.includes(storeId)
        ? favorites.filter(id => id !== storeId)
        : [...favorites, storeId];
      
      setFavorites(updatedFavorites);
      localStorage.setItem(key, JSON.stringify(updatedFavorites));
    } catch (e) {
      console.error('Error toggling favorite:', e);
    }
  };

  const isFavorite = (storeId) => favorites.includes(storeId);

  const setPreferredStore = (storeId) => {
    const key = getPrefKey();
    if (!key) return;

    try {
      setPreferredStoreId(storeId);
      if (storeId) {
        localStorage.setItem(key, storeId);
      } else {
        localStorage.removeItem(key);
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
