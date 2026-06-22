"use client"
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const { isLoggedIn } = useAuth();
  const prevLoggedIn = useRef(isLoggedIn);

  // ── Helpers ──────────────────────────────────────────────────
  const getId = (item) => item._id || item.id;

  const loadLocalCart = () => {
    try {
      return JSON.parse(localStorage.getItem('ai_grocery_cart') || '[]');
    } catch { return []; }
  };

  const saveLocalCart = (items) => {
    localStorage.setItem('ai_grocery_cart', JSON.stringify(items));
  };

  // Normalize a server cart item to the local shape
  const normalizeServerItem = (item) => ({
    _id: item.product?._id || item.product || item._id,
    id:  item.product?._id || item.product || item._id,
    name: item.name,
    price: item.price,
    image: item.image,
    category: item.product?.category || item.category || '',
    quantity: item.quantity,
  });

  // ── Bootstrap on mount ────────────────────────────────────────
  useEffect(() => {
    if (isLoggedIn) {
      // Already logged in on page load — fetch server cart
      api.getCart()
        .then(serverCart => {
          const items = (serverCart?.items || []).map(normalizeServerItem);
          setCartItems(items);
        })
        .catch(() => setCartItems(loadLocalCart()));
    } else {
      setCartItems(loadLocalCart());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── React to login / logout ───────────────────────────────────
  useEffect(() => {
    const wasLoggedIn = prevLoggedIn.current;
    prevLoggedIn.current = isLoggedIn;

    if (isLoggedIn && !wasLoggedIn) {
      // Just logged in — merge local cart into server then reload
      mergeAndSync();
    } else if (!isLoggedIn && wasLoggedIn) {
      // Just logged out — fall back to localStorage
      setCartItems(loadLocalCart());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const mergeAndSync = async () => {
    setSyncing(true);
    try {
      const localItems = loadLocalCart();
      for (const item of localItems) {
        try { await api.addToCart(getId(item), item.quantity); } catch { /* skip */ }
      }
      localStorage.removeItem('ai_grocery_cart');
      const serverCart = await api.getCart();
      setCartItems((serverCart?.items || []).map(normalizeServerItem));
    } catch {
      setCartItems(loadLocalCart());
    } finally {
      setSyncing(false);
    }
  };

  // ── addToCart ─────────────────────────────────────────────────
  const addToCart = useCallback(async (product, quantity = 1) => {
    const pId = getId(product);

    // Optimistic update
    setCartItems(prev => {
      const existing = prev.find(i => getId(i) === pId);
      const updated = existing
        ? prev.map(i => getId(i) === pId ? { ...i, quantity: i.quantity + quantity } : i)
        : [...prev, { ...product, quantity }];
      if (!isLoggedIn) saveLocalCart(updated);
      return updated;
    });

    if (isLoggedIn) {
      try {
        const serverCart = await api.addToCart(pId, quantity);
        setCartItems((serverCart?.items || []).map(normalizeServerItem));
      } catch { /* keep optimistic state */ }
    }
  }, [isLoggedIn]);

  // ── removeFromCart ────────────────────────────────────────────
  const removeFromCart = useCallback(async (id) => {
    setCartItems(prev => {
      const updated = prev.filter(i => getId(i) !== id);
      if (!isLoggedIn) saveLocalCart(updated);
      return updated;
    });

    if (isLoggedIn) {
      try {
        const serverCart = await api.removeFromCart(id);
        setCartItems((serverCart?.items || []).map(normalizeServerItem));
      } catch { /* keep optimistic */ }
    }
  }, [isLoggedIn]);

  // ── updateQuantity ────────────────────────────────────────────
  const updateQuantity = useCallback(async (id, quantity) => {
    if (quantity < 1) return removeFromCart(id);

    setCartItems(prev => {
      const updated = prev.map(i => getId(i) === id ? { ...i, quantity } : i);
      if (!isLoggedIn) saveLocalCart(updated);
      return updated;
    });

    if (isLoggedIn) {
      try {
        const serverCart = await api.updateCartItem(id, quantity);
        setCartItems((serverCart?.items || []).map(normalizeServerItem));
      } catch { /* keep optimistic */ }
    }
  }, [isLoggedIn, removeFromCart]);

  // ── clearCart ─────────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    setCartItems([]);
    localStorage.removeItem('ai_grocery_cart');
    if (isLoggedIn) {
      try { await api.clearCart(); } catch { /* ignore */ }
    }
  }, [isLoggedIn]);

  const getCartTotal = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const getCartCount = () =>
    cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      syncing,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};
