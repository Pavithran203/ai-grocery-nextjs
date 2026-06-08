"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

const STORAGE_KEY = 'freshkart_wishlist';

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const loadWishlist = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setWishlist(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Wishlist load error', e);
      }
    };
    loadWishlist();
  }, []);

  const saveWishlist = (items) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
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
