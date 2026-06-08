import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const OrdersContext = createContext();

export const useOrders = () => useContext(OrdersContext);

const ORDERS_PREFIX = '@freshkart_orders_';
const GUEST_ORDERS_KEY = '@freshkart_guest_orders';

const STAGE_PACKED_MIN = 1;
const STAGE_DELIVERY_MIN = 2;
const STAGE_DELIVERED_MIN = 3;

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();
  
  const getOrdersKey = () => user ? `${ORDERS_PREFIX}${user._id || user.id}` : GUEST_ORDERS_KEY;

  const loadOrders = async () => {
    const key = getOrdersKey();
    
    try {
      let fetchedOrders = [];
      if (user && !user.isGuest) {
        try { fetchedOrders = await api.getMyOrders(); } catch(e) {}
      }
      
      let localOrders = [];
      try {
        const stored = await AsyncStorage.getItem(key);
        if (stored) localOrders = JSON.parse(stored);
      } catch(e) {}
      
      let merged = [...localOrders, ...fetchedOrders];
      let unique = merged.filter((order, index, self) => 
         index === self.findIndex((o) => o.id === (order.id || order._id))
      );

      const now = new Date().getTime();
      unique = unique.map(order => {
         const createdAt = new Date(order.createdAt || new Date()).getTime();
         const diffMinutes = (now - createdAt) / 1000 / 60;
         
         let simulatedStatus = order.status || order.orderStatus || 'Placed';
         
         if (simulatedStatus !== 'Cancelled' && simulatedStatus !== 'delivered') {
            if (diffMinutes >= STAGE_DELIVERED_MIN) {
               simulatedStatus = 'Delivered';
            } else if (diffMinutes >= STAGE_DELIVERY_MIN) {
               simulatedStatus = 'Out for Delivery';
            } else if (diffMinutes >= STAGE_PACKED_MIN) {
               simulatedStatus = 'Packed';
            }
         }
         
         return { ...order, status: simulatedStatus, _progressMins: diffMinutes };
      });
      
      setOrders(unique);
    } catch (e) {
      console.error('Load orders error:', e);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => loadOrders(), 30000);
    return () => clearInterval(interval);
  }, [user]);

  const addLocalOrder = async (orderData) => {
    const newOrder = {
       ...orderData,
       id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
       createdAt: new Date().toISOString(),
       status: 'Placed',
    };
    
    const key = getOrdersKey();
    setOrders(prev => [newOrder, ...prev]);
    
    try {
      const stored = await AsyncStorage.getItem(key);
      const existing = stored ? JSON.parse(stored) : [];
      await AsyncStorage.setItem(key, JSON.stringify([newOrder, ...existing]));
    } catch (e) {}
    
    return newOrder;
  };

  const cancelOrder = async (orderId) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
    const key = getOrdersKey();
    try {
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        let existing = JSON.parse(stored);
        existing = existing.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o);
        await AsyncStorage.setItem(key, JSON.stringify(existing));
      }
    } catch (e) {}
  };

  return (
    <OrdersContext.Provider value={{ orders, loadOrders, addLocalOrder, cancelOrder }}>
      {children}
    </OrdersContext.Provider>
  );
};
