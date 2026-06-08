import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../localization/en.json';
import ta from '../localization/ta.json';
import te from '../localization/te.json';
import kn from '../localization/kn.json';
import ml from '../localization/ml.json';

const translations = { en, ta, te, kn, ml };

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const storedLang = await AsyncStorage.getItem('groceryAppLang');
        if (storedLang && translations[storedLang]) {
          setLanguage(storedLang);
        }
      } catch (error) {
        console.error("Failed to load language", error);
      } finally {
        setLoading(false);
      }
    };
    loadLanguage();
  }, []);

  const changeLanguage = async (newLang) => {
    if (translations[newLang]) {
      try {
        await AsyncStorage.setItem('groceryAppLang', newLang);
        setLanguage(newLang);
      } catch (error) {
        console.error("Failed to save language", error);
      }
    }
  };

  const t = (key) => {
    if (!key) return '';
    
    const currentTranslations = translations[language] || translations['en'];
    
    // 1. Direct lookup
    if (currentTranslations[key]) return currentTranslations[key];

    // 2. Normalized lookup (trim)
    const trimmedKey = key.trim();
    if (currentTranslations[trimmedKey]) return currentTranslations[trimmedKey];

    // 3. Case-insensitive lookup
    const lowerKey = trimmedKey.toLowerCase();
    const ciMatch = Object.keys(currentTranslations).find(
      k => k.toLowerCase() === lowerKey
    );
    if (ciMatch) return currentTranslations[ciMatch];

    // 4. Fallback to English (recursive-ish)
    if (language !== 'en') {
      const enTranslations = translations['en'];
      if (enTranslations[key]) return enTranslations[key];
      if (enTranslations[trimmedKey]) return enTranslations[trimmedKey];
      const ciEnMatch = Object.keys(enTranslations).find(
        k => k.toLowerCase() === lowerKey
      );
      if (ciEnMatch) return enTranslations[ciEnMatch];
    }

    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, loadingLanguage: loading }}>
      {children}
    </LanguageContext.Provider>
  );
};
