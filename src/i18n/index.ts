import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import it from './locales/it.json';
import pt from './locales/pt.json';
import nl from './locales/nl.json';
import ru from './locales/ru.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import ar from './locales/ar.json';
import hi from './locales/hi.json';
import bn from './locales/bn.json';
import tr from './locales/tr.json';

// Map language display names to i18n locale codes
export const LANGUAGE_MAP: Record<string, string> = {
  'English': 'en',
  'Spanish': 'es',
  'French': 'fr',
  'German': 'de',
  'Italian': 'it',
  'Portuguese': 'pt',
  'Dutch': 'nl',
  'Russian': 'ru',
  'Chinese (Mandarin)': 'zh',
  'Japanese': 'ja',
  'Korean': 'ko',
  'Arabic': 'ar',
  'Hindi': 'hi',
  'Bengali': 'bn',
  'Turkish': 'tr',
};

// Reverse map: locale code -> display name
export const LOCALE_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(LANGUAGE_MAP).map(([name, code]) => [code, name])
);

// Map country/location to default language
export const LOCATION_TO_LANGUAGE: Record<string, string> = {
  'United States of America': 'en',
  'United Kingdom': 'en',
  'Canada': 'en',
  'Australia': 'en',
  'New Zealand': 'en',
  'Ireland': 'en',
  'Singapore': 'en',
  'South Africa': 'en',
  'Nigeria': 'en',
  'Kenya': 'en',
  'Philippines': 'en',
  'Spain': 'es',
  'Mexico': 'es',
  'Argentina': 'es',
  'Chile': 'es',
  'Colombia': 'es',
  'Peru': 'es',
  'France': 'fr',
  'Belgium': 'fr',
  'Germany': 'de',
  'Austria': 'de',
  'Switzerland': 'de',
  'Italy': 'it',
  'Brazil': 'pt',
  'Portugal': 'pt',
  'Netherlands': 'nl',
  'Russia': 'ru',
  'China': 'zh',
  'Japan': 'ja',
  'South Korea': 'ko',
  'Saudi Arabia': 'ar',
  'United Arab Emirates': 'ar',
  'Egypt': 'ar',
  'India': 'hi',
  'Turkey': 'tr',
  'Thailand': 'en',
  'Vietnam': 'en',
  'Malaysia': 'en',
  'Indonesia': 'en',
  'Israel': 'en',
  'Sweden': 'en',
  'Norway': 'en',
  'Denmark': 'en',
  'Finland': 'en',
  'Poland': 'en',
  'Greece': 'en',
};

// Get saved language or default
const savedLanguage = localStorage.getItem('displayLanguage') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
      it: { translation: it },
      pt: { translation: pt },
      nl: { translation: nl },
      ru: { translation: ru },
      zh: { translation: zh },
      ja: { translation: ja },
      ko: { translation: ko },
      ar: { translation: ar },
      hi: { translation: hi },
      bn: { translation: bn },
      tr: { translation: tr },
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

// Set default language based on user's profile location (called once on first login)
export function setDefaultLanguageFromLocation(location?: string) {
  // Only set if user hasn't explicitly chosen a language yet
  if (localStorage.getItem('displayLanguage')) return;
  
  if (location) {
    // Try exact match first
    let locale = LOCATION_TO_LANGUAGE[location];
    
    // Try partial match (e.g. "Paris, France" -> "France")
    if (!locale) {
      for (const [country, lang] of Object.entries(LOCATION_TO_LANGUAGE)) {
        if (location.toLowerCase().includes(country.toLowerCase())) {
          locale = lang;
          break;
        }
      }
    }
    
    if (locale && locale !== 'en') {
      i18n.changeLanguage(locale);
      localStorage.setItem('displayLanguage', locale);
    }
  }
}

export default i18n;
