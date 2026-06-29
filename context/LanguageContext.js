"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import i18n from '@/i18n/config';

const LanguageContext = createContext();

const LABEL_TO_CODE = {
  EN: 'en',
  தமிழ்: 'ta',
  తెలుగు: 'te',
  ಕನ್ನಡ: 'kn',
  മലയാളം: 'ml',
  हिंदी: 'hi',
  हिन्दी: 'hi',
};

const CODE_TO_LABEL = {
  en: 'EN',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
  hi: 'हिंदी',
};

const normalizeLanguage = (value) => {
  if (!value) return 'EN';
  if (CODE_TO_LABEL[value]) return CODE_TO_LABEL[value];
  if (LABEL_TO_CODE[value]) return value;
  return 'EN';
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('EN');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('nearmart_language') || localStorage.getItem('i18nextLng') || 'en';
    const normalized = normalizeLanguage(savedLanguage);
    setLanguage(normalized);
    void i18n.changeLanguage(LABEL_TO_CODE[normalized] || 'en');
  }, []);

  useEffect(() => {
    const syncLanguage = (lng) => {
      const normalized = normalizeLanguage(lng);
      setLanguage(normalized);
      localStorage.setItem('nearmart_language', normalized);
      localStorage.setItem('i18nextLng', LABEL_TO_CODE[normalized] || 'en');
      document.documentElement.lang = LABEL_TO_CODE[normalized] || 'en';
    };

    syncLanguage(i18n.language || 'en');
    i18n.on('languageChanged', syncLanguage);

    return () => {
      i18n.off('languageChanged', syncLanguage);
    };
  }, []);

  useEffect(() => {
    const titles = {
      EN: 'NearMart - AI Grocery Delivery',
      தமிழ்: 'நியர்மார்ட் - AI மளிகை டெலிவரி',
      తెలుగు: 'నియర్‌మార్ట్ - AI గ్రోసరీ డెలివరీ',
      ಕನ್ನಡ: 'ನಿಯರ್‌ಮಾರ್ಟ್ - AI ದಿನಸಿ ವಿತರಣೆ',
      മലയാളം: 'നിയർമാർട്ട് - AI ഗ്രോസറി ഡെലിവറി',
      हिंदी: 'नियरमार्ट - AI किराना डिलीवरी',
      हिन्दी: 'नियरमार्ट - AI किराना डिलीवरी',
    };
    document.title = titles[language] || titles.EN;
  }, [language]);

  const changeLanguage = (newLang) => {
    const normalized = normalizeLanguage(newLang);
    setLanguage(normalized);
    localStorage.setItem('nearmart_language', normalized);
    localStorage.setItem('i18nextLng', LABEL_TO_CODE[normalized] || 'en');
    document.documentElement.lang = LABEL_TO_CODE[normalized] || 'en';
    void i18n.changeLanguage(LABEL_TO_CODE[normalized] || 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
