// Client Component
"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const LoyaltyContext = createContext(null);

export const useLoyalty = () => {
  const context = useContext(LoyaltyContext);
  if (!context) {
    throw new Error('useLoyalty must be used within a <LoyaltyProvider>');
  }
  return context;
};

const LOYALTY_COINS_KEY = 'freshkart_coins';
const LOYALTY_HISTORY_KEY = 'freshkart_coins_history';

export const LoyaltyProvider = ({ children }) => {
  const { t } = useTranslation();
  const [coins, setCoins] = useState(0);
  const [history, setHistory] = useState([]);
  const coinsRef = React.useRef(0);

  React.useEffect(() => {
    coinsRef.current = coins;
  }, [coins]);

  useEffect(() => {
    try {
      const storedCoins = localStorage.getItem(LOYALTY_COINS_KEY);
      if (storedCoins !== null) {
        const parsed = parseInt(storedCoins, 10);
        if (!isNaN(parsed)) {
          setCoins(parsed);
          coinsRef.current = parsed;
        }
      }

      const storedHistory = localStorage.getItem(LOYALTY_HISTORY_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to load loyalty data", error);
    }
  }, []);

  const persistData = useCallback((newTotal, newHistory) => {
    try {
      localStorage.setItem(LOYALTY_COINS_KEY, newTotal.toString());
      localStorage.setItem(LOYALTY_HISTORY_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error("Failed to save loyalty data", e);
    }
  }, []);

  const addCoins = useCallback((amount, desc) => {
    const finalDesc = desc || t('loyalty.earnedFromOrder');
    const currentCoins = coinsRef.current;
    const newTotal = currentCoins + amount;
    const newEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
      type: 'earn',
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
