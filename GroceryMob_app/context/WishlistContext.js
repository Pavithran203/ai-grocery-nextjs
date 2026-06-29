import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

const STORAGE_KEY_PREFIX = '@nearmart_wishlist_';

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useAuth();

  const getStorageKey = () => user ? `${STORAGE_KEY_PREFIX}${user.uid || user._id || user.id}` : null;

  // Load wishlist whenever the active user session changes
  useEffect(() => {
    const loadWishlist = async () => {
      const key = getStorageKey();
      if (!key) {
        setWishlist([]);
        return;
      }
      try {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          setWishlist(JSON.parse(stored));
        } else {
          setWishlist([]);
        }
      } catch (e) {
        console.error('Wishlist load error', e);
      }
    };
    loadWishlist();
  }, [user]);

  const saveWishlist = async (items) => {
    const key = getStorageKey();
    if (!key) return;
    try {
      await AsyncStorage.setItem(key, JSON.stringify(items));
    } catch (e) {
      console.error('Wishlist save error', e);
    }
  };

  const getDbId = (id) => id && typeof id === 'string' && id.includes('-p') ? id.split('-p')[1] : id;

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const prodDbId = getDbId(product.id);
      const exists = prev.find(item => getDbId(item.id) === prodDbId);
      let updated;
      if (exists) {
        updated = prev.filter(item => getDbId(item.id) !== prodDbId);
      } else {
        updated = [...prev, product];
      }
      saveWishlist(updated);
      return updated;
    });
  };

  const isInWishlist = (id) => {
    const targetDbId = getDbId(id);
    return wishlist.some(item => getDbId(item.id) === targetDbId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

