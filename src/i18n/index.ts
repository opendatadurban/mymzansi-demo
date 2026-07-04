/**
 * i18n bootstrap: three languages, device-locale detection, persisted choice.
 *
 * On first launch we pick the best match for the device locale; after that we
 * honour the user's explicit choice, stored in AsyncStorage (non-sensitive).
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en';
import zu from './locales/zu';
import af from './locales/af';

export const LANGUAGE_STORAGE_KEY = 'mymzansi.language';

export type LanguageCode = 'en' | 'zu' | 'af';

export const SUPPORTED_LANGUAGES: { code: LanguageCode; endonym: string; english: string }[] = [
  { code: 'en', endonym: 'English', english: 'English' },
  { code: 'zu', endonym: 'isiZulu', english: 'Zulu' },
  { code: 'af', endonym: 'Afrikaans', english: 'Afrikaans' },
];

const resources = {
  en: { translation: en },
  zu: { translation: zu },
  af: { translation: af },
};

function isSupported(code: string): code is LanguageCode {
  return SUPPORTED_LANGUAGES.some((l) => l.code === code);
}

/** Best language for this launch: saved choice → device locale → English. */
async function resolveInitialLanguage(): Promise<LanguageCode> {
  const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved && isSupported(saved)) return saved;
  const device = getLocales()[0]?.languageCode ?? 'en';
  return isSupported(device) ? device : 'en';
}

let initialised = false;

export async function initI18n(): Promise<typeof i18n> {
  if (initialised) return i18n;
  const lng = await resolveInitialLanguage();
  // eslint-disable-next-line import/no-named-as-default-member -- i18n default export is the singleton instance
  await i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    returnNull: false,
    // Hermes lacks full Intl.PluralRules; our copy uses no ICU plurals anyway.
    compatibilityJSON: 'v3',
  });
  initialised = true;
  return i18n;
}

export async function changeLanguage(code: LanguageCode): Promise<void> {
  // eslint-disable-next-line import/no-named-as-default-member -- i18n default export is the singleton instance
  await i18n.changeLanguage(code);
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, code);
}

export default i18n;
