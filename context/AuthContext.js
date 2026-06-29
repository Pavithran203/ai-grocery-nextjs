"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, setAuthToken } from '@/services/api';
import { 
  deriveMasterKey, 
  generateRandomSalt, 
  arrayBufferToBase64, 
  base64ToArrayBuffer,
  generateDeliveryKeyPair,
  exportPublicKey,
  wrapPrivateKey,
  unwrapPrivateKey
} from '@/services/e2ee';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [masterKey, setMasterKey] = useState(null);
  const [deliveryPrivateKey, setDeliveryPrivateKey] = useState(null);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const router = useRouter();

  // Load saved auth and keys on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('nearmart_token') || sessionStorage.getItem('nearmart_token');
    const savedUser = localStorage.getItem('nearmart_user') || sessionStorage.getItem('nearmart_user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setAuthToken(savedToken);

        // Load E2EE key from sessionStorage if present
        const sessionKeyBase64 = sessionStorage.getItem('nearmart_session_key');
        if (sessionKeyBase64) {
          crypto.subtle.importKey(
            'raw',
            base64ToArrayBuffer(sessionKeyBase64),
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey']
          ).then(key => {
            setMasterKey(key);

            // If delivery agent, unwrap and load their RSA private key
            if (parsedUser.role === 'delivery') {
              const wrappedPrivateKey = localStorage.getItem(`nearmart_delivery_private_key_wrapped_${parsedUser._id}`);
              const wrappedPrivateKeyIv = localStorage.getItem(`nearmart_delivery_private_key_iv_${parsedUser._id}`);
              if (wrappedPrivateKey && wrappedPrivateKeyIv) {
                unwrapPrivateKey(wrappedPrivateKey, wrappedPrivateKeyIv, key)
                  .then(privKey => setDeliveryPrivateKey(privKey))
                  .catch(err => console.error('Failed to unwrap private key:', err));
              }
            }
          }).catch(err => console.error('Failed to import master key:', err));
        }
      } catch (e) {
        localStorage.removeItem('nearmart_token');
        localStorage.removeItem('nearmart_user');
        sessionStorage.removeItem('nearmart_token');
        sessionStorage.removeItem('nearmart_user');
      }
    }
    setLoading(false);
  }, []);

  // Register
  const register = async (name, email, password, phone = '') => {
    try {
      const salt = generateRandomSalt();
      const key = await deriveMasterKey(password, salt);
      const rawKey = await crypto.subtle.exportKey('raw', key);
      const keyBase64 = arrayBufferToBase64(rawKey);

      const data = await api.register({ 
        name, 
        email, 
        password, 
        phone,
        encryptionSalt: salt
      });

      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        setAuthToken(data.token);
        setMasterKey(key);
        sessionStorage.setItem('nearmart_session_key', keyBase64);
        localStorage.setItem('nearmart_token', data.token);
        localStorage.setItem('nearmart_user', JSON.stringify(data.user));

        // Reset loyalty coins to 0 for a brand new register
        const userId = data.user?._id || data.user?.id;
        if (userId) {
          localStorage.setItem(`nearmart_coins_${userId}`, '0');
          localStorage.setItem(`nearmart_coins_history_${userId}`, '[]');
        }

        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Registration failed' };
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const data = await api.login(email, password);
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        setAuthToken(data.token);
        localStorage.setItem('nearmart_token', data.token);
        localStorage.setItem('nearmart_user', JSON.stringify(data.user));

        // Get or generate user encryption salt
        let salt = data.user.encryptionSalt;
        if (!salt) {
          salt = generateRandomSalt();
          const updatedUser = await api.updateProfile({ encryptionSalt: salt });
          data.user.encryptionSalt = salt;
          localStorage.setItem('nearmart_user', JSON.stringify(data.user));
        }

        // Derive master key
        const key = await deriveMasterKey(password, salt);
        setMasterKey(key);

        const rawKey = await crypto.subtle.exportKey('raw', key);
        sessionStorage.setItem('nearmart_session_key', arrayBufferToBase64(rawKey));

        // If delivery role, generate or load RSA-OAEP keypair
        if (data.user.role === 'delivery') {
          let wrappedPrivKey = localStorage.getItem(`nearmart_delivery_private_key_wrapped_${data.user._id}`);
          let wrappedPrivKeyIv = localStorage.getItem(`nearmart_delivery_private_key_iv_${data.user._id}`);

          if (!wrappedPrivKey || !wrappedPrivKeyIv) {
            const keyPair = await generateDeliveryKeyPair();
            const pubKeyBase64 = await exportPublicKey(keyPair.publicKey);
            
            // Sync public key to backend
            await api.updateProfile({ rsaPublicKey: pubKeyBase64 });
            data.user.rsaPublicKey = pubKeyBase64;
            localStorage.setItem('nearmart_user', JSON.stringify(data.user));

            // Wrap and save private key locally
            const wrapResult = await wrapPrivateKey(keyPair.privateKey, key);
            localStorage.setItem(`nearmart_delivery_private_key_wrapped_${data.user._id}`, wrapResult.ciphertext);
            localStorage.setItem(`nearmart_delivery_private_key_iv_${data.user._id}`, wrapResult.iv);

            setDeliveryPrivateKey(keyPair.privateKey);
          } else {
            // Unwrap existing private key
            const privKey = await unwrapPrivateKey(wrappedPrivKey, wrappedPrivKeyIv, key);
            setDeliveryPrivateKey(privKey);
          }
        }

        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Invalid credentials' };
    } catch (err) {
      return { success: false, message: err.message || 'Invalid credentials' };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    setMasterKey(null);
    setDeliveryPrivateKey(null);
    localStorage.removeItem('nearmart_token');
    localStorage.removeItem('nearmart_user');
    localStorage.removeItem('nearmart-admin-session');
    sessionStorage.removeItem('nearmart_token');
    sessionStorage.removeItem('nearmart_user');
    sessionStorage.removeItem('nearmart_session_key');
    router.push('/');
  };

  // Get current user from API
  const fetchMe = async () => {
    if (!token) return;
    try {
      const userData = await api.getMe();
      if (userData) {
        setUser(userData);
        localStorage.setItem('nearmart_user', JSON.stringify(userData));
      }
    } catch (err) {
      // Failed to fetch user, might be token expired
      if (err.message.includes('token') || err.message.includes('Unauthorized')) {
        logout();
      }
    }
  };

  // Update Profile
  const updateProfile = async (updates) => {
    try {
      const updatedUser = await api.updateProfile(updates);
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('nearmart_user', JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      }
      return { success: false, message: 'Failed to update profile' };
    } catch (err) {
      return { success: false, message: err.message || 'Failed to update profile' };
    }
  };

  // Guest Login Mock (optional, kept for UX continuity)
  const continueAsGuest = () => {
    const guestId = 'guest_' + Date.now();
    const guestUser = { name: 'Guest User', isGuest: true, _id: guestId };
    const guestToken = 'demo-token-' + guestId;
    
    setUser(guestUser);
    setToken(guestToken);
    setAuthToken(guestToken);
    sessionStorage.setItem('nearmart_user', JSON.stringify(guestUser));
    sessionStorage.setItem('nearmart_token', guestToken);
    return { success: true };
  };

  const loginWithOtp = async (phone, otp, name = '', email = '') => {
    // Completely wipe out any old "Guest User" session before proceeding
    localStorage.removeItem('nearmart_user');
    localStorage.removeItem('nearmart_token');
    sessionStorage.removeItem('nearmart_user');
    sessionStorage.removeItem('nearmart_token');

    if (name) {
      // If they provided a name, create a real account for them
      const userEmail = email || `user_${phone || Date.now()}@nearmart.com`;
      const password = 'DemoPassword123!'; // Mock password since they used OTP
      
      // Try to register
      const regRes = await register(name, userEmail, password, phone);
      if (regRes.success) {
        // Force the user object to have the name they just typed, even if the backend returns a fallback
        const updatedUser = { ...regRes.user, name, phone };
        setUser(updatedUser);
        localStorage.setItem('nearmart_user', JSON.stringify(updatedUser));

        // Reset loyalty coins to 0 for a brand new signup!
        const userId = updatedUser._id || updatedUser.id;
        if (userId) {
          localStorage.setItem(`nearmart_coins_${userId}`, '0');
          localStorage.setItem(`nearmart_coins_history_${userId}`, '[]');
        }

        return { success: true };
      }
      
      // If email/phone exists, try login
      const logRes = await login(userEmail, password);
      if (logRes.success) {
        // Force the user object to have the name they just typed
        const updatedUser = { ...logRes.user, name, phone };
        setUser(updatedUser);
        localStorage.setItem('nearmart_user', JSON.stringify(updatedUser));

        // Reset loyalty coins to 0 for a brand new profile setup!
        const userId = updatedUser._id || updatedUser.id;
        if (userId) {
          localStorage.setItem(`nearmart_coins_${userId}`, '0');
          localStorage.setItem(`nearmart_coins_history_${userId}`, '[]');
        }

        return { success: true };
      }
    }

    // Fallback if absolutely no name provided or everything failed
    return continueAsGuest();
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated,
      masterKey,
      deliveryPrivateKey,
      login,
      register,
      signup: register,
      updateProfile,
      loginWithOtp,
      continueAsGuest,
      logout,
      fetchMe,
      isLoginModalOpen,
      setLoginModalOpen,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
