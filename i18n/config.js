import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ta from './locales/ta.json';
import hi from './locales/hi.json';
import te from './locales/te.json';
import kn from './locales/kn.json';
import ml from './locales/ml.json';

const resources = {
  en: { translation: en },
  ta: { translation: ta },
  hi: { translation: hi },
  te: { translation: te },
  kn: { translation: kn },
  ml: { translation: ml },
};

const isClient = typeof window !== 'undefined';

const instance = i18n.createInstance();

if (isClient) {
  try {
    const detectorModule = require('i18next-browser-languagedetector');
    const detector = detectorModule.default || detectorModule;
    instance.use(detector);
  } catch (e) {
    console.warn('LanguageDetector failed to load:', e);
  }
}

instance
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: isClient ? undefined : 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: isClient ? {
      order: ['localStorage', 'cookie', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage'],
    } : undefined,
  });

export default instance;
