"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoriteContext = createContext();

export const useFavorites = () => useContext(FavoriteContext);

const FAVORITES_KEY = 'freshkart_favorites';
const PREFERRED_STORE_KEY = 'freshkart_preferred_store';

export const FavoriteProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [preferredStoreId, setPreferredStoreId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      try {
        const storedFavorites = localStorage.getItem(FAVORITES_KEY);
        const storedPreferred = localStorage.getItem(PREFERRED_STORE_KEY);
        
        if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
        if (storedPreferred) setPreferredStoreId(storedPreferred);
      } catch (e) {
        console.error('Error loading favorite stores:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const toggleFavorite = (storeId) => {
    try {
      const updatedFavorites = favorites.includes(storeId)
        ? favorites.filter(id => id !== storeId)
        : [...favorites, storeId];
      
      setFavorites(updatedFavorites);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
    } catch (e) {
      console.error('Error toggling favorite:', e);
    }
  };

  const isFavorite = (storeId) => favorites.includes(storeId);

  const setPreferredStore = (storeId) => {
    try {
      setPreferredStoreId(storeId);
      if (storeId) {
        localStorage.setItem(PREFERRED_STORE_KEY, storeId);
      } else {
        localStorage.removeItem(PREFERRED_STORE_KEY);
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
