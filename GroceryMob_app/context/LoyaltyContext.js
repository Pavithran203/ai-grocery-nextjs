import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const LoyaltyContext = createContext();

export const useLoyalty = () => useContext(LoyaltyContext);

const LOYALTY_COINS_PREFIX = '@freshkart_coins_';
const LOYALTY_HISTORY_PREFIX = '@freshkart_coins_history_';

export const LoyaltyProvider = ({ children }) => {
  const { user } = useAuth();
  const [coins, setCoins] = useState(0);
  const [history, setHistory] = useState([]);
  const coinsRef = React.useRef(0);

  const getCoinsKey = () => user ? `${LOYALTY_COINS_PREFIX}${user.uid || user._id || user.id}` : null;
  const getHistoryKey = () => user ? `${LOYALTY_HISTORY_PREFIX}${user.uid || user._id || user.id}` : null;

  // Keep ref in sync with state
  React.useEffect(() => {
    coinsRef.current = coins;
  }, [coins]);

  useEffect(() => {
    const loadLoyaltyData = async () => {
      const coinsKey = getCoinsKey();
      const historyKey = getHistoryKey();

      if (!coinsKey || !historyKey) {
        setCoins(0);
        setHistory([]);
        coinsRef.current = 0;
        return;
      }

      try {
        const storedCoins = await AsyncStorage.getItem(coinsKey);
        if (storedCoins !== null) {
          const parsed = parseInt(storedCoins, 10);
          setCoins(parsed);
          coinsRef.current = parsed;
        } else {
          setCoins(0);
          coinsRef.current = 0;
        }

        const storedHistory = await AsyncStorage.getItem(historyKey);
        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
        } else {
          setHistory([]);
        }
      } catch (error) {
        console.error("Failed to load loyalty data", error);
      }
    };
    loadLoyaltyData();
  }, [user]);

  const addCoins = async (amount, desc = 'Earned from order') => {
    const coinsKey = getCoinsKey();
    const historyKey = getHistoryKey();
    if (!coinsKey || !historyKey) return;

    const currentCoins = coinsRef.current;
    const newTotal = currentCoins + amount;
    const newEntry = {
      id: Math.random().toString(36).substring(7),
      type: 'earn',
      amount,
      desc,
      date: new Date().toISOString(),
    };

    coinsRef.current = newTotal;
    setCoins(newTotal);
    setHistory(prev => [newEntry, ...prev]);

    try {
      await AsyncStorage.setItem(coinsKey, newTotal.toString());
      const currentHistory = await AsyncStorage.getItem(historyKey);
      const parsed = currentHistory ? JSON.parse(currentHistory) : [];
      await AsyncStorage.setItem(historyKey, JSON.stringify([newEntry, ...parsed]));
    } catch (e) {
      console.error("Failed to save loyalty data", e);
    }
  };

  const redeemCoins = async (amount, desc = 'Redeemed for discount') => {
    const coinsKey = getCoinsKey();
    const historyKey = getHistoryKey();
    if (!coinsKey || !historyKey) return false;

    const currentCoins = coinsRef.current;
    if (currentCoins < amount) return false;

    const newTotal = currentCoins - amount;
    const newEntry = {
      id: Math.random().toString(36).substring(7),
      type: 'redeem',
      amount,
      desc,
      date: new Date().toISOString(),
    };

    coinsRef.current = newTotal;
    setCoins(newTotal);
    setHistory(prev => [newEntry, ...prev]);

    try {
      await AsyncStorage.setItem(coinsKey, newTotal.toString());
      const currentHistory = await AsyncStorage.getItem(historyKey);
      const parsed = currentHistory ? JSON.parse(currentHistory) : [];
      await AsyncStorage.setItem(historyKey, JSON.stringify([newEntry, ...parsed]));
      return true;
    } catch (e) {
      console.error("Failed to save loyalty data", e);
      return false;
    }
  };

  return (
    <LoyaltyContext.Provider value={{ coins, history, addCoins, redeemCoins }}>
      {children}
    </LoyaltyContext.Provider>
  );
};

