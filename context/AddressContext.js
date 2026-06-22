"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';

const AddressContext = createContext();

export const useAddress = () => useContext(AddressContext);

const STORAGE_KEY_PREFIX = 'nearmart_addresses_';

export const AddressProvider = ({ children }) => {
  const [addresses, setAddresses] = useState([]);
  const [defaultAddressId, setDefaultAddressId] = useState(null);
  const { user } = useAuth();

  const getStorageKey = () => user ? `${STORAGE_KEY_PREFIX}${user._id || user.id}` : null;

  // Load from backend or localStorage on mount/user change
  useEffect(() => {
    const load = async () => {
      try {
        if (user && !user.isGuest) {
          // In a fully integrated flow, addresses are usually sent along with user object
          // or we fetch them from api.getMe(). The backend /auth/me returns them.
          const me = await api.getMe();
          if (me && me.addresses) {
            setAddresses(me.addresses);
            if (me.addresses.length > 0 && !defaultAddressId) {
               setDefaultAddressId(me.addresses[0]._id || me.addresses[0].id);
            }
            return;
          }
        }
        
        // Fallback for guest or offline
        const key = getStorageKey();
        if (!key) {
          setAddresses([]);
          setDefaultAddressId(null);
          return;
        }

        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          setAddresses(parsed.addresses || []);
          setDefaultAddressId(parsed.defaultAddressId || null);
        } else {
          setAddresses([]);
          setDefaultAddressId(null);
        }
      } catch (e) {
        // Suppress network fetch errors since the dummy backend isn't running
        // Fallback to local storage
        const key = getStorageKey();
        if (key) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored);
            setAddresses(parsed.addresses || []);
            setDefaultAddressId(parsed.defaultAddressId || null);
          }
        }
      }
    };
    load();
  }, [user]);

  // Save to localStorage for guests
  const persistLocal = (addrs, defId) => {
    const key = getStorageKey();
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify({ addresses: addrs, defaultAddressId: defId }));
    } catch (e) {
      console.error('AddressContext save error:', e);
    }
  };

  const addAddress = async (addr) => {
    try {
      if (user && !user.isGuest) {
        const updatedAddresses = await api.addAddress(addr);
        if (updatedAddresses) {
          setAddresses(updatedAddresses);
          const newId = updatedAddresses[updatedAddresses.length - 1]._id || updatedAddresses[updatedAddresses.length - 1].id;
          if (updatedAddresses.length === 1) setDefaultAddressId(newId);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to save address to backend', e);
    }

    // Fallback/Guest
    const newAddr = { ...addr, id: Date.now().toString() };
    const updated = [...addresses, newAddr];
    const newDefaultId = addresses.length === 0 ? newAddr.id : defaultAddressId;
    setAddresses(updated);
    setDefaultAddressId(newDefaultId);
    persistLocal(updated, newDefaultId);
  };

  const updateAddress = (id, updatedAddr) => {
    // Backend doesn't have an explicit updateAddress endpoint in our api.js right now
    // So we just update local state or user profile. For now, mimic local update.
    const updated = addresses.map(a => (a.id === id || a._id === id) ? { ...a, ...updatedAddr } : a);
    setAddresses(updated);
    persistLocal(updated, defaultAddressId);
  };

  const removeAddress = async (id) => {
    try {
      if (user && !user.isGuest) {
        const updatedAddresses = await api.deleteAddress(id);
        if (updatedAddresses) {
          setAddresses(updatedAddresses);
          if (defaultAddressId === id) {
            setDefaultAddressId(updatedAddresses.length > 0 ? (updatedAddresses[0]._id || updatedAddresses[0].id) : null);
          }
          return;
        }
      }
    } catch (e) {
      console.error("Failed to delete address from backend", e);
    }

    // Fallback/Guest
    const updated = addresses.filter(a => a.id !== id && a._id !== id);
    let newDefault = defaultAddressId;
    if (defaultAddressId === id) {
      newDefault = updated.length > 0 ? (updated[0].id || updated[0]._id) : null;
    }
    setAddresses(updated);
    setDefaultAddressId(newDefault);
    persistLocal(updated, newDefault);
  };

  const setDefaultAddress = (id) => {
    setDefaultAddressId(id);
    persistLocal(addresses, id);
  };

  const getDefaultAddress = () => {
    return addresses.find(a => (a.id === defaultAddressId || a._id === defaultAddressId)) || addresses[0] || null;
  };

  const formatAddress = (addr) => {
    if (!addr) return 'No address set';
    return [addr.line1, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ');
  };

  return (
    <AddressContext.Provider value={{
      addresses,
      defaultAddressId,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
      getDefaultAddress,
      formatAddress,
    }}>
      {children}
    </AddressContext.Provider>
  );
};
