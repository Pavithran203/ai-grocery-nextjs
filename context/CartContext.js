"use client"
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { api } from '@/services/api';

const CartContext = createContext({
  cartItems: [],
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  getCartTotal: () => 0,
  getCartCount: () => 0,
  isCartLoading: false,
  cartToast: null,
  setCartToast: () => {}
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [cartToast, setCartToast] = useState(null);
  const initializedRef = useRef(false);
  const router = useRouter();
  
  const { user } = useAuth();
  
  // Load initial cart
  useEffect(() => {
    const fetchCart = async () => {
      setIsCartLoading(true);
      if (user && !user.isGuest) {
        try {
          const cart = await api.getCart();
          if (cart && cart.items) {
            // Check if there's an offline cart to sync
            const local = sessionStorage.getItem('ai_grocery_cart');
            if (local) {
              const localItems = JSON.parse(local);
              if (localItems.length > 0) {
                // Map localItems to backend format { productId, quantity }
                const syncItems = localItems.map(item => ({ 
                  productId: item.id.includes('__') ? item.id.split('__')[1] : item.id, 
                  quantity: item.quantity 
                }));
                await api.syncCart(syncItems);
                sessionStorage.removeItem('ai_grocery_cart');
                // refetch synced cart
                const syncedCart = await api.getCart();
                setCartItems(syncedCart.items.map(i => ({ ...i.product, quantity: i.quantity })));
                setIsCartLoading(false);
                initializedRef.current = true;
                return;
              }
            }
            setCartItems(cart.items.map(i => ({ ...i.product, quantity: i.quantity })));
          }
        } catch (e) {
          console.error('Failed to fetch cart:', e);
        }
      } else {
        const saved = sessionStorage.getItem('ai_grocery_cart');
        if (saved) {
            try {
                setCartItems(JSON.parse(saved));
            } catch(e) {}
        }
      }
      initializedRef.current = true;
      setIsCartLoading(false);
    };

    fetchCart();
  }, [user]);

  // Save to session storage for guests only — only after initial load is done
  useEffect(() => {
    if (!initializedRef.current) return;
    if (!user || user.isGuest) {
      sessionStorage.setItem('ai_grocery_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const addToCart = async (product, quantity = 1) => {
    if (user && !user.isGuest) {
      setIsCartLoading(true);
      try {
        const updatedCart = await api.addToCart(product.id, quantity);
        if (updatedCart && updatedCart.items) {
          setCartItems(updatedCart.items.map(i => ({ ...i.product, quantity: i.quantity })));
        } else {
          // Backend returned no items — fall back to local add
          setCartItems(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
              return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
            }
            return [...prev, { ...product, quantity }];
          });
        }
      } catch (e) {
        console.error('Failed to add to cart via API, falling back to local cart:', e);
        // Fallback: add locally so the user isn't stuck
        setCartItems(prev => {
          const existing = prev.find(item => item.id === product.id);
          if (existing) {
            return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
          }
          return [...prev, { ...product, quantity }];
        });
      }
      setIsCartLoading(false);
    } else {
      setCartItems(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
          return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
        }
        return [...prev, { ...product, quantity }];
      });
    }
    // Auto open drawer when adding
    setCartToast(product);
    setIsCartOpen(true);
  };

  const removeFromCart = async (id) => {
    if (user && !user.isGuest) {
      setIsCartLoading(true);
      try {
        const updatedCart = await api.removeFromCart(id);
        if (updatedCart && updatedCart.items) {
          setCartItems(updatedCart.items.map(i => ({ ...i.product, quantity: i.quantity })));
        } else {
          // Backend returned no items or product not found — remove locally
          setCartItems(prev => prev.filter(item => item.id !== id));
        }
      } catch (e) {
        console.error('Failed to remove from cart via API, falling back to local:', e);
        setCartItems(prev => prev.filter(item => item.id !== id));
      }
      setIsCartLoading(false);
    } else {
      setCartItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) return removeFromCart(id);
    
    if (user && !user.isGuest) {
      setIsCartLoading(true);
      try {
        const updatedCart = await api.updateCartItem(id, quantity);
        if (updatedCart && updatedCart.items) {
          setCartItems(updatedCart.items.map(i => ({ ...i.product, quantity: i.quantity })));
        } else {
          // Backend didn't return items — update locally
          setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
        }
      } catch (e) {
        console.error('Failed to update quantity via API, falling back to local:', e);
        setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
      }
      setIsCartLoading(false);
    } else {
      setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
    }
  };

  const clearCart = async () => {
    if (user && !user.isGuest) {
      setIsCartLoading(true);
      try {
        await api.clearCart();
        setCartItems([]);
      } catch (e) {
        console.error('Failed to clear cart:', e);
      }
      setIsCartLoading(false);
    } else {
      setCartItems([]);
    }
  };

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  
  const applyCoupon = (coupon) => setAppliedCoupon(coupon);
  const removeCoupon = () => setAppliedCoupon(null);

  const getCartTotal = () => {
    const total = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    if (!appliedCoupon) return total;
    
    if (appliedCoupon.type === 'percentage') {
      return total - (total * (appliedCoupon.value / 100));
    } else if (appliedCoupon.type === 'flat') {
      return Math.max(0, total - appliedCoupon.value);
    }
    return total;
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      setIsCartOpen,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
      isCartLoading,
      cartToast,
      setCartToast
    }}>
      {children}
    </CartContext.Provider>
  );
};
