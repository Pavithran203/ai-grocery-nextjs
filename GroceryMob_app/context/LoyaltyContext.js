import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoyaltyContext = createContext();

export const useLoyalty = () => useContext(LoyaltyContext);

const LOYALTY_COINS_KEY = '@freshkart_coins';
const LOYALTY_HISTORY_KEY = '@freshkart_coins_history';

export const LoyaltyProvider = ({ children }) => {
  const [coins, setCoins] = useState(0);
  const [history, setHistory] = useState([]);
  const coinsRef = React.useRef(0);

  // Keep ref in sync with state
  React.useEffect(() => {
    coinsRef.current = coins;
  }, [coins]);

  useEffect(() => {
    const loadLoyaltyData = async () => {
      try {
        const storedCoins = await AsyncStorage.getItem(LOYALTY_COINS_KEY);
        if (storedCoins !== null) {
          const parsed = parseInt(storedCoins, 10);
          setCoins(parsed);
          coinsRef.current = parsed;
        }

        const storedHistory = await AsyncStorage.getItem(LOYALTY_HISTORY_KEY);
        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
        }
      } catch (error) {
        console.error("Failed to load loyalty data", error);
      }
    };
    loadLoyaltyData();
  }, []);

  const addCoins = async (amount, desc = 'Earned from order') => {
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
      await AsyncStorage.setItem(LOYALTY_COINS_KEY, newTotal.toString());
      const currentHistory = await AsyncStorage.getItem(LOYALTY_HISTORY_KEY);
      const parsed = currentHistory ? JSON.parse(currentHistory) : [];
      await AsyncStorage.setItem(LOYALTY_HISTORY_KEY, JSON.stringify([newEntry, ...parsed]));
    } catch (e) {
      console.error("Failed to save loyalty data", e);
    }
  };

  const redeemCoins = async (amount, desc = 'Redeemed for discount') => {
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
      await AsyncStorage.setItem(LOYALTY_COINS_KEY, newTotal.toString());
      const currentHistory = await AsyncStorage.getItem(LOYALTY_HISTORY_KEY);
      const parsed = currentHistory ? JSON.parse(currentHistory) : [];
      await AsyncStorage.setItem(LOYALTY_HISTORY_KEY, JSON.stringify([newEntry, ...parsed]));
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
