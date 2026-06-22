// Client Component
"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';

const LoyaltyContext = createContext(null);

export const useLoyalty = () => {
  const context = useContext(LoyaltyContext);
  if (!context) {
    throw new Error('useLoyalty must be used within a <LoyaltyProvider>');
  }
  return context;
};

const LOYALTY_COINS_PREFIX = 'nearmart_coins_';
const LOYALTY_HISTORY_PREFIX = 'nearmart_coins_history_';

export const LoyaltyProvider = ({ children }) => {
  const { t } = useTranslation();
  const { user } = useAuth(); // Import user to scope the cache
  const [coins, setCoins] = useState(0);
  const [history, setHistory] = useState([]);
  const coinsRef = React.useRef(0);

  // Dynamic keys based on user ID or 'guest'
  const getCoinsKey = () => user ? `${LOYALTY_COINS_PREFIX}${user._id || user.id}` : null;
  const getHistoryKey = () => user ? `${LOYALTY_HISTORY_PREFIX}${user._id || user.id}` : null;

  React.useEffect(() => {
    coinsRef.current = coins;
  }, [coins]);

  useEffect(() => {
    const coinsKey = getCoinsKey();
    const historyKey = getHistoryKey();

    if (!coinsKey || !historyKey) {
      setCoins(0);
      setHistory([]);
      coinsRef.current = 0;
      return;
    }

    try {
      const storedCoins = localStorage.getItem(coinsKey);
      if (storedCoins !== null) {
        const parsed = parseInt(storedCoins, 10);
        if (!isNaN(parsed)) {
          setCoins(parsed);
          coinsRef.current = parsed;
        }
      } else {
        setCoins(0);
        coinsRef.current = 0;
      }

      const storedHistory = localStorage.getItem(historyKey);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error("Failed to load loyalty data", error);
    }
  }, [user]);

  const persistData = useCallback((newTotal, newHistory) => {
    const coinsKey = getCoinsKey();
    const historyKey = getHistoryKey();
    if (!coinsKey || !historyKey) return;

    try {
      localStorage.setItem(coinsKey, newTotal.toString());
      localStorage.setItem(historyKey, JSON.stringify(newHistory));
    } catch (e) {
      console.error("Failed to save loyalty data", e);
    }
  }, [user]);

  const addCoins = useCallback((amount, desc, orderId) => {
    const finalDesc = desc || t('loyalty.earnedFromOrder');
    
    setHistory(prev => {
      if (orderId && prev.some(item => item.orderId === orderId)) {
        console.log(`[Loyalty] Order ${orderId} already credited. Skipping.`);
        return prev;
      }
      
      const currentCoins = coinsRef.current;
      const newTotal = currentCoins + amount;
      coinsRef.current = newTotal;
      setCoins(newTotal);

      const newEntry = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
        type: 'earn',
        amount,
        desc: finalDesc,
        date: new Date().toISOString(),
        orderId,
      };

      const updated = [newEntry, ...prev];
      persistData(newTotal, updated);
      return updated;
    });
  }, [persistData, t]);

  const redeemCoins = useCallback((amount, desc) => {
    const finalDesc = desc || t('loyalty.redeemedForDiscount');
    const currentCoins = coinsRef.current;
    if (currentCoins < amount) return false;

    const newTotal = currentCoins - amount;
    const newEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
      type: 'redeem',
      amount,
      desc: finalDesc,
      date: new Date().toISOString(),
    };

    coinsRef.current = newTotal;
    setCoins(newTotal);
    setHistory(prev => {
      const updated = [newEntry, ...prev];
      persistData(newTotal, updated);
      return updated;
    });

    return true;
  }, [persistData, t]);

  return (
    <LoyaltyContext.Provider value={{ coins, history, addCoins, redeemCoins }}>
      {children}
    </LoyaltyContext.Provider>
  );
};
