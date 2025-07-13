import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from './locales/en/common.json';
import heCommon from './locales/he/common.json';
import enAuth from './locales/en/auth.json';
import heAuth from './locales/he/auth.json';
import enDashboard from './locales/en/dashboard.json';
import heDashboard from './locales/he/dashboard.json';
import enLanding from './locales/en/landing.json';
import heLanding from './locales/he/landing.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    landing: enLanding,
  },
  he: {
    common: heCommon,
    auth: heAuth,
    dashboard: heDashboard,
    landing: heLanding,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: 'en', // default language
    debug: false,

    interpolation: {
      escapeValue: false, // react already safes from xss
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
  });

export default i18n;