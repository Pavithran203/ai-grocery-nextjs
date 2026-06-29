"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';
import { encryptSymmetric, decryptSymmetric } from '@/services/e2ee';

const AddressContext = createContext();

export const useAddress = () => useContext(AddressContext);

const STORAGE_KEY_PREFIX = 'nearmart_addresses_';

export const AddressProvider = ({ children }) => {
  const [addresses, setAddresses] = useState([]);
  const [decryptedAddresses, setDecryptedAddresses] = useState([]);
  const [defaultAddressId, setDefaultAddressId] = useState(null);
  const { user, masterKey } = useAuth();

  const getStorageKey = () => user ? `${STORAGE_KEY_PREFIX}${user._id || user.id}` : null;

  // Load from backend or localStorage on mount/user change
  useEffect(() => {
    const load = async () => {
      try {
        if (user && !user.isGuest) {
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

  // Decrypt addresses reactively when masterKey is loaded
  useEffect(() => {
    const decryptAll = async () => {
      if (!addresses || addresses.length === 0) {
        setDecryptedAddresses([]);
        return;
      }
      const list = [];
      for (const addr of addresses) {
        if (addr.encryptedPayload && masterKey) {
          try {
            const decrypted = await decryptSymmetric(
              addr.encryptedPayload.ciphertext, 
              addr.encryptedPayload.iv, 
              masterKey
            );
            list.push({ ...addr, ...decrypted });
          } catch (e) {
            console.error('Failed to decrypt address:', e);
            list.push({ ...addr, isDecryptionFailed: true });
          }
        } else {
          list.push(addr);
        }
      }
      setDecryptedAddresses(list);
    };
    decryptAll();
  }, [addresses, masterKey]);

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
      if (user && !user.isGuest && masterKey) {
        const sensitiveData = {
          fullName: addr.fullName,
          phone: addr.phone,
          line1: addr.line1,
          line2: addr.line2 || '',
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode
        };
        const encrypted = await encryptSymmetric(sensitiveData, masterKey);
        const payload = {
          label: addr.label || 'Home',
          encryptedPayload: {
            ciphertext: encrypted.ciphertext,
            iv: encrypted.iv,
            algorithm: 'AES-GCM-256',
            version: '1.0'
          }
        };

        const updatedAddresses = await api.addAddress(payload);
        if (updatedAddresses) {
          setAddresses(updatedAddresses);
          const newId = updatedAddresses[updatedAddresses.length - 1]._id || updatedAddresses[updatedAddresses.length - 1].id;
          if (updatedAddresses.length === 1) setDefaultAddressId(newId);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to save address to backend with E2EE, saving locally:', e);
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
    return decryptedAddresses.find(a => (a.id === defaultAddressId || a._id === defaultAddressId)) || decryptedAddresses[0] || null;
  };

  const formatAddress = (addr) => {
    if (!addr) return 'No address set';
    if (addr.isDecryptionFailed) return '🔒 Address locked (Enter password to decrypt)';
    return [addr.line1, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ');
  };

  return (
    <AddressContext.Provider value={{
      addresses: decryptedAddresses,
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
