"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

const STORAGE_KEY_PREFIX = 'nearmart_wishlist_';

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useAuth(); // Scoped to user

  const getStorageKey = () => user ? `${STORAGE_KEY_PREFIX}${user._id || user.id}` : null;

  useEffect(() => {
    const loadWishlist = () => {
      const key = getStorageKey();
      if (!key) {
        setWishlist([]);
        return;
      }
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          setWishlist(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Wishlist load error', e);
      }
    };
    loadWishlist();
  }, [user]);

  const saveWishlist = (items) => {
    const key = getStorageKey();
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch (e) {
      console.error('Wishlist save error', e);
    }
  };

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === product.id);
      let updated;
      if (exists) {
        updated = prev.filter(item => item.id !== product.id);
      } else {
        updated = [...prev, product];
      }
      saveWishlist(updated);
      return updated;
    });
  };

  const isInWishlist = (id) => wishlist.some(item => item.id === id);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
