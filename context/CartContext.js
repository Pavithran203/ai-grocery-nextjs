"use client"
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { api } from '@/services/api';
import { useTranslation } from 'react-i18next';

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

const getBaseId = (id) => {
  if (!id) return '';
  const str = String(id);
  return str.includes('__') ? str.split('__')[1] : str;
};

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [cartToast, setCartToast] = useState(null);
  const initializedRef = useRef(false);
  const router = useRouter();
  const { i18n } = useTranslation();
  
  const { user } = useAuth();
  
  // Load initial cart
  useEffect(() => {
    const fetchCart = async () => {
      setIsCartLoading(true);
      let items = [];
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
                items = syncedCart.items.map(i => ({ ...i.product, quantity: i.quantity }));
              }
            } else {
              items = cart.items.map(i => ({ ...i.product, quantity: i.quantity }));
            }
          }
        } catch (e) {
          if (e.isOffline) {
            console.warn('Backend is offline, using local cart.');
            const saved = sessionStorage.getItem('ai_grocery_cart');
            if (saved) {
              try {
                items = JSON.parse(saved);
              } catch (err) {}
            }
          } else {
            console.error('Failed to fetch cart:', e);
          }
        }
      } else {
        const saved = sessionStorage.getItem('ai_grocery_cart');
        if (saved) {
            try {
                items = JSON.parse(saved);
            } catch(e) {}
        }
      }

      // Sync items with the latest catalog to reflect updated prices/stocks
      if (items.length > 0) {
        try {
          const latestProducts = await api.getProducts();
          items = items.map(item => {
            const latest = latestProducts.find(p => getBaseId(p.id) === getBaseId(item.id));
            if (latest) {
              return { 
                ...item, 
                ...latest, 
                price: latest.price, 
                stock: latest.stock, 
                name: latest.name 
              };
            }
            return item;
          });
        } catch (e) {
          console.warn('Failed to update cart item details from catalog:', e);
        }
      }

      setCartItems(items);
      initializedRef.current = true;
      setIsCartLoading(false);
    };

    fetchCart();
  }, [user]);

  // Save to session storage for all users — acts as local/offline backup
  useEffect(() => {
    if (!initializedRef.current) return;
    sessionStorage.setItem('ai_grocery_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = async (product, quantity = 1) => {
    // Validate stock limits locally first
    const baseId = getBaseId(product.id);
    const existing = cartItems.find(item => getBaseId(item.id) === baseId);
    const currentQty = existing ? existing.quantity : 0;
    const newQty = currentQty + quantity;

    let currentStock = product.stock;
    try {
      const latestProducts = await api.getProducts();
      const latest = latestProducts.find(p => getBaseId(p.id) === baseId);
      if (latest) {
        currentStock = latest.stock;
      }
    } catch (e) {
      console.warn('Failed to fetch latest stock in addToCart, using cached stock');
    }

    if (currentStock !== undefined && currentStock !== null) {
      if (newQty > currentStock) {
        const prodName = product[`name_${i18n?.language || 'en'}`] || product.name;
        alert(`Sorry, only ${currentStock} unit(s) of "${prodName}" are available in stock. You already have ${currentQty} in your cart.`);
        return;
      }
    }

    if (user && !user.isGuest) {
      setIsCartLoading(true);
      try {
        const updatedCart = await api.addToCart(product.id, quantity);
        if (updatedCart && updatedCart.items) {
          setCartItems(updatedCart.items.map(i => ({ ...i.product, quantity: i.quantity })));
        } else {
          // Backend returned no items — fall back to local add
          setCartItems(prev => {
            const existing = prev.find(item => getBaseId(item.id) === baseId);
            if (existing) {
              return prev.map(item => getBaseId(item.id) === baseId ? { ...item, quantity: item.quantity + quantity } : item);
            }
            return [...prev, { ...product, quantity }];
          });
        }
      } catch (e) {
        if (e.isOffline) {
          console.warn('Backend is offline, adding product to local cart:', product?.name);
        } else {
          console.error('Failed to add to cart via API, falling back to local cart:', e);
        }
        // Fallback: add locally so the user isn't stuck
        setCartItems(prev => {
          const existing = prev.find(item => getBaseId(item.id) === baseId);
          if (existing) {
            return prev.map(item => getBaseId(item.id) === baseId ? { ...item, quantity: item.quantity + quantity } : item);
          }
          return [...prev, { ...product, quantity }];
        });
      }
      setIsCartLoading(false);
    } else {
      setCartItems(prev => {
        const existing = prev.find(item => getBaseId(item.id) === baseId);
        if (existing) {
          return prev.map(item => getBaseId(item.id) === baseId ? { ...item, quantity: item.quantity + quantity } : item);
        }
        return [...prev, { ...product, quantity }];
      });
    }
    // Auto open drawer when adding
    setCartToast(product);
    setIsCartOpen(true);
  };

  const removeFromCart = async (id) => {
    const baseId = getBaseId(id);
    if (user && !user.isGuest) {
      setIsCartLoading(true);
      try {
        const updatedCart = await api.removeFromCart(id);
        if (updatedCart && updatedCart.items) {
          setCartItems(updatedCart.items.map(i => ({ ...i.product, quantity: i.quantity })));
        } else {
          // Backend returned no items or product not found — remove locally
          setCartItems(prev => prev.filter(item => getBaseId(item.id) !== baseId));
        }
      } catch (e) {
        if (e.isOffline) {
          console.warn('Backend is offline, removing product from local cart.');
        } else {
          console.error('Failed to remove from cart via API, falling back to local:', e);
        }
        setCartItems(prev => prev.filter(item => getBaseId(item.id) !== baseId));
      }
      setIsCartLoading(false);
    } else {
      setCartItems(prev => prev.filter(item => getBaseId(item.id) !== baseId));
    }
  };

  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) return removeFromCart(id);
    
    // Validate stock limits locally first
    const baseId = getBaseId(id);
    const item = cartItems.find(i => getBaseId(i.id) === baseId);
    
    let currentStock = item ? item.stock : undefined;
    try {
      const latestProducts = await api.getProducts();
      const latest = latestProducts.find(p => getBaseId(p.id) === baseId);
      if (latest) {
        currentStock = latest.stock;
      }
    } catch (e) {
      console.warn('Failed to fetch latest stock in updateQuantity, using cached stock');
    }

    if (currentStock !== undefined && currentStock !== null) {
      if (quantity > currentStock) {
        const itemName = item[`name_${i18n?.language || 'en'}`] || item.name;
        alert(`Sorry, only ${currentStock} unit(s) of "${itemName}" are available in stock.`);
        return;
      }
    }

    if (user && !user.isGuest) {
      setIsCartLoading(true);
      try {
        const updatedCart = await api.updateCartItem(id, quantity);
        if (updatedCart && updatedCart.items) {
          setCartItems(updatedCart.items.map(i => ({ ...i.product, quantity: i.quantity })));
        } else {
          // Backend didn't return items — update locally
          setCartItems(prev => prev.map(item => getBaseId(item.id) === baseId ? { ...item, quantity } : item));
        }
      } catch (e) {
        if (e.isOffline) {
          console.warn('Backend is offline, updating product in local cart.');
        } else {
          console.error('Failed to update quantity via API, falling back to local:', e);
        }
        setCartItems(prev => prev.map(item => getBaseId(item.id) === baseId ? { ...item, quantity } : item));
      }
      setIsCartLoading(false);
    } else {
      setCartItems(prev => prev.map(item => getBaseId(item.id) === baseId ? { ...item, quantity } : item));
    }
  };

  const clearCart = async () => {
    if (user && !user.isGuest) {
      setIsCartLoading(true);
      try {
        await api.clearCart();
        setCartItems([]);
      } catch (e) {
        if (e.isOffline) {
          console.warn('Backend is offline, cart cleared locally.');
        } else {
          console.error('Failed to clear cart:', e);
        }
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
