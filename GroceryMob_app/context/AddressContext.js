import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const AddressContext = createContext();

export const useAddress = () => useContext(AddressContext);

const STORAGE_KEY = '@freshkart_addresses';

export const AddressProvider = ({ children }) => {
  const { user, updateProfile } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [defaultAddressId, setDefaultAddressId] = useState(null);

  // Sync addresses with User state from AuthContext
  useEffect(() => {
    if (user) {
      const userAddresses = (user.addresses || []).map(a => ({ ...a, id: a._id || a.id }));
      setAddresses(userAddresses);
      const def = userAddresses.find(a => a.isDefault);
      setDefaultAddressId(def ? def.id : (userAddresses.length > 0 ? userAddresses[0].id : null));
    } else {
      // Load guest addresses from local storage if not logged in
      const loadGuestAddresses = async () => {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setAddresses(parsed.addresses || []);
          setDefaultAddressId(parsed.defaultAddressId || null);
        } else {
          setAddresses([]);
          setDefaultAddressId(null);
        }
      };
      loadGuestAddresses();
    }
  }, [user]);

  const persistGuest = async (addrs, defId) => {
    if (!user || user.isGuest) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ addresses: addrs, defaultAddressId: defId }));
    }
  };

  const addAddress = async (addr) => {
    if (user && !user.isGuest) {
      try {
        const updatedAddresses = await api.addAddress(addr);
        const mapped = updatedAddresses.map(a => ({ ...a, id: a._id || a.id }));
        setAddresses(mapped);
      } catch (e) {
        console.error('Failed to add address to server', e);
      }
    } else {
      const newAddr = { ...addr, id: Date.now().toString() };
      const updated = [...addresses, newAddr];
      const newDefaultId = addresses.length === 0 ? newAddr.id : defaultAddressId;
      setAddresses(updated);
      setDefaultAddressId(newDefaultId);
      persistGuest(updated, newDefaultId);
    }
  };

  const editAddress = async (id, updatedAddr) => {
    // For now, simplicity: if logged in, we replace all addresses or just add/edit locally and sync
    // In a real app we'd have a specific PUT /addresses/:id
    const updated = addresses.map(a => a.id === id ? { ...a, ...updatedAddr } : a);
    setAddresses(updated);
    
    if (user && !user.isGuest) {
       // Sync entire array back to user profile (simplified)
       await updateProfile({ addresses: updated });
    } else {
       persistGuest(updated, defaultAddressId);
    }
  };

  const deleteAddress = async (id) => {
    if (user && !user.isGuest) {
      try {
        const updatedAddresses = await api.deleteAddress(id);
        const mapped = updatedAddresses.map(a => ({ ...a, id: a._id || a.id }));
        setAddresses(mapped);
      } catch (e) {
        console.error('Failed to delete address', e);
      }
    } else {
      const updated = addresses.filter(a => a.id !== id);
      let newDefault = defaultAddressId;
      if (defaultAddressId === id) {
        newDefault = updated.length > 0 ? updated[0].id : null;
      }
      setAddresses(updated);
      setDefaultAddressId(newDefault);
      persistGuest(updated, newDefault);
    }
  };

  const selectDefaultAddress = async (id) => {
    setDefaultAddressId(id);
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }));
    setAddresses(updated);
    
    if (user && !user.isGuest) {
      await updateProfile({ addresses: updated });
    } else {
      persistGuest(updated, id);
    }
  };

  const getDefaultAddress = () => {
    return addresses.find(a => a.id === defaultAddressId) || addresses[0] || null;
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return [addr.line1, addr.line2, addr.city, addr.pincode].filter(Boolean).join(', ');
  };

  return (
    <AddressContext.Provider value={{
      addresses,
      defaultAddressId,
      addAddress,
      editAddress,
      deleteAddress,
      selectDefaultAddress,
      getDefaultAddress,
      formatAddress,
    }}>
      {children}
    </AddressContext.Provider>
  );
};
