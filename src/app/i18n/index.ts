import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';

/**
 * Lazy-init the i18next instance once at module load. Falls back to English
 * for any unsupported locale; new languages slot in by adding a JSON file
 * under ./locales and registering it here.
 *
 * The locale comes from expo-localization (the device-set language). If you
 * later add a Settings → Language picker, call `i18n.changeLanguage(code)`.
 */
const locales = getLocales();
const detected = locales[0]?.languageCode ?? 'en';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3', // Hermes lacks Intl.PluralRules in some configs
    resources: {
      en: { translation: en },
    },
    lng: detected,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })
  .catch(() => {
    /* failed init means we silently render the fallback resource */
  });

export default i18n;
