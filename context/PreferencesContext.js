"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const PreferencesContext = createContext();

export const usePreferences = () => useContext(PreferencesContext);

const PREFS_KEY = 'nearmart_prefs';

export const PreferencesProvider = ({ children }) => {
  const [viewedCategories, setViewedCategories] = useState({});
  const [viewedProducts, setViewedProducts] = useState({});
  const [cartedCategories, setCartedCategories] = useState({});
  const [searchedQueries, setSearchedQueries] = useState([]);
  const [orderedCategories, setOrderedCategories] = useState({});
  
  const stateRef = useRef({ viewedCategories: {}, viewedProducts: {}, cartedCategories: {}, searchedQueries: [], orderedCategories: {} });

  useEffect(() => {
    stateRef.current = { viewedCategories, viewedProducts, cartedCategories, searchedQueries, orderedCategories };
  }, [viewedCategories, viewedProducts, cartedCategories, searchedQueries, orderedCategories]);

  useEffect(() => {
    const loadPrefs = () => {
      try {
        const stored = localStorage.getItem(PREFS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const vc = parsed.viewedCategories || {};
          const vp = parsed.viewedProducts || {};
          const cc = parsed.cartedCategories || {};
          const sq = parsed.searchedQueries || [];
          const oc = parsed.orderedCategories || {};
          setViewedCategories(vc);
          setViewedProducts(vp);
          setCartedCategories(cc);
          setSearchedQueries(sq);
          setOrderedCategories(oc);
          stateRef.current = { viewedCategories: vc, viewedProducts: vp, cartedCategories: cc, searchedQueries: sq, orderedCategories: oc };
        }
      } catch (e) {
        console.error('Preferences load error:', e);
      }
    };
    loadPrefs();
  }, []);

  const persistState = (updated) => {
    const merged = { ...stateRef.current, ...updated };
    stateRef.current = merged;
    localStorage.setItem(PREFS_KEY, JSON.stringify(merged));
  };

  const trackView = (category) => {
    if (!category) return;
    setViewedCategories(prev => {
      const updated = { ...prev, [category]: (prev[category] || 0) + 1 };
      persistState({ viewedCategories: updated });
      return updated;
    });
  };

  const trackProductView = (productId) => {
    if (!productId) return;
    setViewedProducts(prev => {
      const updated = { ...prev, [productId]: (prev[productId] || 0) + 1 };
      persistState({ viewedProducts: updated });
      return updated;
    });
  };

  const trackCartAdd = (category) => {
    if (!category) return;
    setCartedCategories(prev => {
      const updated = { ...prev, [category]: (prev[category] || 0) + 1 };
      persistState({ cartedCategories: updated });
      return updated;
    });
  };

  const trackSearch = (query) => {
    if (!query || query.trim().length === 0) return;
    const lowerQuery = query.toLowerCase().trim();
    setSearchedQueries(prev => {
      const updated = [lowerQuery, ...prev.filter(q => q !== lowerQuery)].slice(0, 10);
      persistState({ searchedQueries: updated });
      return updated;
    });
  };

  const removeSearch = (query) => {
    setSearchedQueries(prev => {
       const updated = prev.filter(q => q !== query);
       persistState({ searchedQueries: updated });
       return updated;
    });
  };

  const trackOrder = (items) => {
    if (!items || items.length === 0) return;
    setOrderedCategories(prev => {
      const updated = { ...prev };
      items.forEach(item => {
        if (item.category) {
          updated[item.category] = (updated[item.category] || 0) + 1;
        }
      });
      persistState({ orderedCategories: updated });
      return updated;
    });
  };

  const getUserProfile = () => stateRef.current;

  return (
    <PreferencesContext.Provider value={{
      viewedCategories,
      viewedProducts,
      cartedCategories,
      searchedQueries,
      orderedCategories,
      trackView,
      trackProductView,
      trackCartAdd,
      trackSearch,
      removeSearch,
      trackOrder,
      getUserProfile,
    }}>
      {children}
    </PreferencesContext.Provider>
  );
};
