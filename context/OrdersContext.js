"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';

const OrdersContext = createContext();

export const useOrders = () => useContext(OrdersContext);

const ORDERS_PREFIX = 'freshkart_orders_';

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();
  
  const getOrdersKey = () => user ? `${ORDERS_PREFIX}${user._id || user.id}` : null;

  const loadOrders = async () => {
    if (!user) {
      setOrders([]);
      return;
    }

    try {
      if (!user.isGuest) {
        // Fetch real orders from backend
        const fetchedOrders = await api.getMyOrders();
        setOrders(fetchedOrders || []);
      } else {
        // Fallback to local storage for guests
        const key = getOrdersKey();
        if (key) {
          const stored = localStorage.getItem(key);
          if (stored) {
            setOrders(JSON.parse(stored));
          }
        }
      }
    } catch (e) {
      console.error('Failed to load orders:', e);
      // Fallback
      const key = getOrdersKey();
      if (key) {
        const stored = localStorage.getItem(key);
        if (stored) setOrders(JSON.parse(stored));
      }
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadOrders();
    const interval = setInterval(() => {
      loadOrders();
    }, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, [user]);

  const addLocalOrder = async (orderData) => {
    const newOrder = {
       ...orderData,
       id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
       createdAt: new Date().toISOString(),
       status: 'placed',
       orderStatus: 'placed'
    };
    
    const key = getOrdersKey();
    if (!key) return null;

    setOrders(prev => [newOrder, ...prev]);
    
    try {
      const stored = localStorage.getItem(key);
      const existing = stored ? JSON.parse(stored) : [];
      localStorage.setItem(key, JSON.stringify([newOrder, ...existing]));
    } catch (e) {}
    
    return newOrder;
  };

  const cancelOrder = async (orderId) => {
    try {
      if (!user || user.isGuest) throw new Error("Guest");
      // Optional: Add backend cancel order API here if needed
      // await api.cancelOrder(orderId);
      loadOrders();
    } catch (e) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled', orderStatus: 'cancelled' } : o));
      const key = getOrdersKey();
      if (!key) return;
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          let existing = JSON.parse(stored);
          existing = existing.map(o => o.id === orderId ? { ...o, status: 'cancelled', orderStatus: 'cancelled' } : o);
          localStorage.setItem(key, JSON.stringify(existing));
        }
      } catch (err) {}
    }
  };

  return (
    <OrdersContext.Provider value={{ orders, loadOrders, addLocalOrder, cancelOrder }}>
      {children}
    </OrdersContext.Provider>
  );
};
