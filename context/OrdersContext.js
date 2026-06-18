"use client";
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';
import { pushOrderToAdminStore } from '@/lib/admin/customerOrderStore';

const OrdersContext = createContext();

export const useOrders = () => useContext(OrdersContext);

const ORDERS_PREFIX = 'nearmart_orders_';

// ─── Real-world order lifecycle time thresholds (in minutes) ───
// These define how long each stage lasts after the order is placed.
// Once elapsed time exceeds a threshold, the order auto-progresses.
const ORDER_LIFECYCLE = {
  placed:           0,    // 0 min  – order just placed
  confirmed:        2,    // 2 min  – store confirms the order
  preparing:        5,    // 5 min  – kitchen/store starts preparing
  packed:          15,    // 15 min – order is packed and ready
  out_for_delivery: 20,   // 20 min – rider picks up, out for delivery
  delivered:       45,    // 45 min – delivered to customer
};

// Cancellation window: orders can only be cancelled within this many minutes
const CANCEL_WINDOW_MINUTES = 5;

/**
 * Given an order's creation timestamp, calculate what the real-world status
 * should be right now based on elapsed time.
 * Returns null if the order has a terminal status (delivered/cancelled) already.
 */
const computeRealisticStatus = (order) => {
  const currentStatus = (order.orderStatus || order.status || '').toLowerCase();

  // Terminal statuses — never auto-progress these
  if (['delivered', 'cancelled'].includes(currentStatus)) {
    return null;
  }

  const placedAt = new Date(order.createdAt || order.placedAt || 0);
  const now = new Date();
  const elapsedMinutes = (now - placedAt) / (1000 * 60);

  // Walk backwards through the lifecycle to find the highest threshold crossed
  if (elapsedMinutes >= ORDER_LIFECYCLE.delivered) return 'delivered';
  if (elapsedMinutes >= ORDER_LIFECYCLE.out_for_delivery) return 'out_for_delivery';
  if (elapsedMinutes >= ORDER_LIFECYCLE.packed) return 'packed';
  if (elapsedMinutes >= ORDER_LIFECYCLE.preparing) return 'preparing';
  if (elapsedMinutes >= ORDER_LIFECYCLE.confirmed) return 'confirmed';
  return 'placed';
};

/**
 * Apply realistic status to an array of orders based on elapsed time.
 * This ensures old orders don't stay stuck at "preparing" forever.
 */
const applyRealisticStatuses = (ordersArray) => {
  return ordersArray.map(order => {
    const realisticStatus = computeRealisticStatus(order);
    if (realisticStatus === null) return order; // Already terminal, keep as-is

    const currentStatus = (order.orderStatus || order.status || '').toLowerCase();
    if (currentStatus !== realisticStatus) {
      // Status needs to be updated based on elapsed time
      return {
        ...order,
        status: realisticStatus,
        orderStatus: realisticStatus,
      };
    }
    return order;
  });
};

/**
 * Check whether an order is still within the cancellation window.
 */
export const isOrderCancellable = (order) => {
  const currentStatus = (order.orderStatus || order.status || '').toLowerCase();
  
  // Can't cancel terminal orders
  if (['delivered', 'cancelled'].includes(currentStatus)) return false;

  const placedAt = new Date(order.createdAt || order.placedAt || 0);
  const now = new Date();
  const elapsedMinutes = (now - placedAt) / (1000 * 60);

  // Only allow cancellation within the first N minutes
  return elapsedMinutes <= CANCEL_WINDOW_MINUTES;
};

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();
  const ordersRef = useRef(orders);
  ordersRef.current = orders;
  
  const getOrdersKey = () => user ? `${ORDERS_PREFIX}${user._id || user.id}` : null;

  /**
   * Persist orders to localStorage so they survive page reloads.
   */
  const persistToStorage = (key, ordersArray) => {
    try {
      localStorage.setItem(key, JSON.stringify(ordersArray));
    } catch (e) {}
  };

  const loadOrders = async () => {
    if (!user) {
      setOrders([]);
      return;
    }

    try {
      let backendOrders = [];
      if (!user.isGuest) {
        backendOrders = await api.getMyOrders() || [];
      }
      
      // Always merge local web orders so they are never lost
      const key = getOrdersKey();
      let localOrders = [];
      if (key) {
        const stored = localStorage.getItem(key);
        if (stored) localOrders = JSON.parse(stored);
      }

      // Merge backend and local orders, preventing duplicates
      // Local orders take priority (they contain cancellation overrides)
      const mergedMap = new Map();
      backendOrders.forEach(bo => {
        const id = bo.id || bo._id;
        mergedMap.set(id, bo);
      });
      localOrders.forEach(lo => {
        const id = lo.id || lo._id;
        mergedMap.set(id, lo); // local overrides backend
      });
      
      let combined = Array.from(mergedMap.values());

      // ── KEY: Apply time-based status progression ──
      combined = applyRealisticStatuses(combined);
      
      // Sort newest first
      combined.sort((a, b) => new Date(b.createdAt || b.placedAt || 0) - new Date(a.createdAt || a.placedAt || 0));
      
      setOrders(combined);

      // Persist updated statuses so they stick
      if (key) {
        persistToStorage(key, combined);
      }
    } catch (e) {
      // Fallback
      const key = getOrdersKey();
      if (key) {
        const stored = localStorage.getItem(key);
        if (stored) {
          let parsed = JSON.parse(stored);
          parsed = applyRealisticStatuses(parsed);
          setOrders(parsed);
          persistToStorage(key, parsed);
        }
      }
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadOrders();
    // Poll every 30s to progress order statuses in real time
    const interval = setInterval(() => {
      loadOrders();
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const addLocalOrder = async (orderData) => {
    const newOrder = {
       createdAt: new Date().toISOString(),
       status: 'placed',
       orderStatus: 'placed',
       ...orderData,
       id: orderData.id || orderData._id || 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase()
    };
    
    const key = getOrdersKey();
    if (!key) return null;

    setOrders(prev => [newOrder, ...prev]);
    
    try {
      const stored = localStorage.getItem(key);
      const existing = stored ? JSON.parse(stored) : [];
      localStorage.setItem(key, JSON.stringify([newOrder, ...existing]));
    } catch (e) {}

    // Also push to the shared admin-visible order store
    try {
      pushOrderToAdminStore(newOrder);
    } catch (e) {
      console.warn('[OrdersContext] Failed to sync to admin store:', e);
    }
    
    return newOrder;
  };

  const cancelOrder = async (orderId) => {
    // Find the order to check if it's still cancellable
    const order = ordersRef.current.find(o => o.id === orderId || o._id === orderId);
    if (order && !isOrderCancellable(order)) {
      throw new Error('This order can no longer be cancelled. The cancellation window (5 minutes) has passed.');
    }

    // 1. Update state immediately
    setOrders(prev => prev.map(o => (o.id === orderId || o._id === orderId) ? { ...o, status: 'cancelled', orderStatus: 'cancelled' } : o));
    
    // 2. Persist to localStorage
    const key = getOrdersKey();
    if (key) {
      try {
        const stored = localStorage.getItem(key);
        let existing = stored ? JSON.parse(stored) : [];
        
        const localIndex = existing.findIndex(o => o.id === orderId || o._id === orderId);
        
        if (localIndex >= 0) {
          existing[localIndex].status = 'cancelled';
          existing[localIndex].orderStatus = 'cancelled';
        } else {
          if (order) {
            existing.push({ ...order, status: 'cancelled', orderStatus: 'cancelled' });
          }
        }
        
        localStorage.setItem(key, JSON.stringify(existing));
      } catch (err) {}
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId || o._id === orderId ? { ...o, status: newStatus, orderStatus: newStatus } : o));
    const key = getOrdersKey();
    if (!key) return;
    try {
      const stored = localStorage.getItem(key);
      let existing = stored ? JSON.parse(stored) : [];
      
      const localIndex = existing.findIndex(o => o.id === orderId || o._id === orderId);
      
      if (localIndex >= 0) {
        existing[localIndex].status = newStatus;
        existing[localIndex].orderStatus = newStatus;
      } else {
        const orderToOverride = ordersRef.current.find(o => o.id === orderId || o._id === orderId);
        if (orderToOverride) {
          existing.push({ ...orderToOverride, status: newStatus, orderStatus: newStatus });
        }
      }
      
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {}
  };

  return (
    <OrdersContext.Provider value={{ orders, loadOrders, addLocalOrder, cancelOrder, updateOrderStatus, isOrderCancellable }}>
      {children}
    </OrdersContext.Provider>
  );
};
