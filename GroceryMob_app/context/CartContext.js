import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import Toast from 'react-native-root-toast';
import { triggerLight, triggerSuccess } from '../utils/Haptics';
import { COLORS } from '../services/theme';
import { Alert } from 'react-native';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [currentStore, setCurrentStore] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [comboDiscount, setComboDiscount] = useState(0);
  const [comboItemIds, setComboItemIds] = useState(new Set());
  const { user } = useAuth();
  const prevUserRef = useRef(user);

  // Persistence Key
  const GUEST_CART_KEY = 'groceryAppGuestCart';
  const COUPON_KEY = 'groceryAppCoupon';

  // Initial Load & User Transition Logic
  const syncGuestCart = async () => {
    const guestCartStr = await AsyncStorage.getItem(GUEST_CART_KEY);
    let guestItems = [];
    try {
      guestItems = JSON.parse(guestCartStr);
    } catch (e) {
      guestItems = [];
    }
    
    if (!Array.isArray(guestItems)) guestItems = [];
    if (guestItems.length === 0) return await loadCartFromDB();

    // If still a guest user, don't clear local storage yet, just return current items
    if (user && user.isGuest) {
      setCartItems(guestItems);
      return guestItems;
    }

    // Real user login: Sync to DB and clear local
    const itemsToSync = guestItems
      .filter(item => item && item.id)
      .map(item => ({ productId: item.id, quantity: item.quantity }));
    
    if (itemsToSync.length > 0) {
      try {
        await api.syncCart(itemsToSync);
        console.log('✅ Batch cart sync successful');
      } catch (e) {
        console.error('Batch cart sync failed', e.message);
      }
    }
    await AsyncStorage.removeItem(GUEST_CART_KEY);
    return await loadCartFromDB();
  };

  // Initial Load & User Transition Logic
  useEffect(() => {
    const initCart = async () => {
      // 1. GUEST LOGS IN: Merge Guest Cart to DB (only if non-guest user)
      if (user && !user.isGuest && !prevUserRef.current) {
        await syncGuestCart();
      } 
      // 2. USER LOGS OUT: Switch to Guest Mode
      else if (!user && prevUserRef.current) {
        setCartItems([]); // Clear current session
        // AsyncStorage will naturally handle subsequent guest additions
      }
      // 3. APP STARTUP (Guest): Load Local Storage
      else if (!user) {
        const guestCartStr = await AsyncStorage.getItem(GUEST_CART_KEY);
        if (guestCartStr) {
          try {
            const parsed = JSON.parse(guestCartStr);
            setCartItems(Array.isArray(parsed) ? parsed : []);
          } catch (e) {
            setCartItems([]);
          }
        }
      }
      // 4. APP STARTUP (Logged In): Load DB (Only for registered users)
      else if (user && !user.isGuest) {
        await loadCartFromDB();
      }
      // 5. GUEST USER (Active Session): Load local storage
      else if (user && user.isGuest) {
        const guestCartStr = await AsyncStorage.getItem(GUEST_CART_KEY);
        if (guestCartStr) {
          try {
            const parsed = JSON.parse(guestCartStr);
            setCartItems(Array.isArray(parsed) ? parsed : []);
          } catch (e) {
            setCartItems([]);
          }
        }
      }
      
      // Also load persisted coupon
      const storedCoupon = await AsyncStorage.getItem(COUPON_KEY);
      if (storedCoupon) {
        setAppliedCoupon(JSON.parse(storedCoupon));
      }

      prevUserRef.current = user;
    };

    initCart();
  }, [user]);

  // Persist guest changes to local storage
  useEffect(() => {
    if (!user && cartItems.length > 0) {
      AsyncStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartItems));
    } else if (!user && cartItems.length === 0) {
      AsyncStorage.removeItem(GUEST_CART_KEY);
    }
  }, [cartItems, user]);

  const loadCartFromDB = async () => {
    try {
      const dbCart = await api.getCart();
      const mappedItems = dbCart.items.map(item => {
        if (!item.product) return null;
        return {
          ...item.product,
          id: item.product._id,
          quantity: item.quantity,
          cartPrice: item.price,
          originalPrice: item.product.price,
          storeId: item.storeId || 'store-001' // Standard default store-001 ID
        };
      }).filter(Boolean);
      setCartItems(mappedItems);
      return mappedItems;
    } catch (e) {
      console.error('Failed to load cart', e);
      return [];
    }
  };

  const addToCart = async (product, quantity = 1) => {
    // Multi-store support: Allow adding products from any store

    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, quantity }];
    });

    triggerSuccess();
    Toast.show(`${product.name} added to cart`, {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
      backgroundColor: COLORS.emerald[600],
      textColor: COLORS.white,
      opacity: 1,
    });

    if (user && !user.isGuest) {
      try {
        const dbId = product.dbId || (product.id && typeof product.id === 'string' && product.id.includes('-p') ? product.id.split('-p')[1] : product.id);
        if (dbId && dbId.length === 24) {
           await api.addToCart(dbId, quantity);
        }
      } catch (e) {
        // API sync failed
      }
    }
  };

  const removeFromCart = async (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    
    if (user && !user.isGuest) {
      try {
        const dbId = id && typeof id === 'string' && id.includes('-p') ? id.split('-p')[1] : id;
        if (dbId && typeof dbId === 'string' && dbId.length === 24) {
          await api.removeFromCart(dbId);
        }
      } catch (e) {
        console.error('Failed to remove item from server', e.message);
      }
    }
  };

  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) return removeFromCart(id);
    
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
    triggerLight();
    
    if (user && !user.isGuest) {
      try {
        const dbId = id && typeof id === 'string' && id.includes('-p') ? id.split('-p')[1] : id;
        if (dbId && dbId.length === 24) {
           await api.updateCartItem(dbId, quantity);
        }
      } catch (e) {
        console.error('Failed to update quantity', e);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    setCurrentStore(null);
    if (user && !user.isGuest) {
      try {
        await api.clearCart();
      } catch (e) {
        // Silently log 401/sync errors to avoid breaking the UI flow
        console.log('Backend clearCart skipped/failed:', e.message);
      }
    }
 else {
      await AsyncStorage.removeItem(GUEST_CART_KEY);
    }
    setComboDiscount(0);
    setComboItemIds(new Set());
  };

  const addComboToCart = async (comboId) => {
    try {
      // If guest, handle locally by fetching combo products and adding them
      if (!user) {
        const combos = await api.getActiveCombos();
        const combo = combos.find(c => c._id === comboId);
        if (combo) {
          const ratio = combo.originalPrice > 0 ? combo.comboPrice / combo.originalPrice : 1;
          const newItems = [...cartItems];
          
          combo.products.forEach(product => {
            const comboItemPrice = Math.round(product.price * ratio);
            const existingIdx = newItems.findIndex(i => i.id === product._id);
            if (existingIdx >= 0) {
              newItems[existingIdx].quantity += 1;
              newItems[existingIdx].cartPrice = comboItemPrice;
            } else {
              newItems.push({
                ...product,
                id: product._id,
                quantity: 1,
                cartPrice: comboItemPrice,
                originalPrice: product.price
              });
            }
          });
          
          setCartItems(newItems);
          setComboDiscount(prev => prev + (combo.originalPrice - combo.comboPrice));
          triggerSuccess();
          return { success: true };
        }
      }

      const result = await api.addComboToCart(comboId);
      // Refresh cart from DB to pick up the newly added combo items
      await loadCartFromDB();
      // Accumulate combo savings
      if (result.combo && result.combo.savings) {
        setComboDiscount(prev => prev + result.combo.savings);
      }
      // Track which product IDs are combo items
      if (result.combo && result.combo.productIds) {
        setComboItemIds(prev => {
          const next = new Set(prev);
          result.combo.productIds.forEach(id => next.add(id));
          return next;
        });
      }
      triggerSuccess();
      Toast.show('Combo added to cart 🛒', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        backgroundColor: COLORS.emerald[600],
        textColor: COLORS.white,
        opacity: 1,
      });
      return { success: true };
    } catch (e) {
      console.error('Failed to add combo to cart', e);
      return { success: false, message: e.message };
    }
  };

  const getCartTotal = () => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total, item) => {
      const price = item.cartPrice || item.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const applyCouponToCart = async (couponObj) => {
    setAppliedCoupon(couponObj);
    await AsyncStorage.setItem(COUPON_KEY, JSON.stringify(couponObj));
  };

  const removeCouponFromCart = async () => {
    setAppliedCoupon(null);
    await AsyncStorage.removeItem(COUPON_KEY);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const getStoreSubtotal = (storeId) => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems
      .filter(item => item.storeId === storeId)
      .reduce((total, item) => {
        const price = item.cartPrice || item.price || 0;
        return total + (price * item.quantity);
      }, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      addComboToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
      getStoreSubtotal,
      refreshCart: loadCartFromDB,
      syncGuestCart,
      comboDiscount,
      comboItemIds,
      clearComboDiscount: () => setComboDiscount(0),
      appliedCoupon,
      applyCouponToCart,
      removeCouponFromCart,
      currentStore: (Array.isArray(cartItems) && cartItems.length > 0) ? cartItems[0].storeId : null
    }}>
      {children}
    </CartContext.Provider>
  );
};

