import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './en.json';
import ptBR from './pt-BR.json';
import es from './es.json';

const resources = {
  en: { translation: en },
  'pt-BR': { translation: ptBR },
  es: { translation: es },
};

const deviceLocale = Localization.getLocales()[0]?.languageTag ?? 'en';
const supportedLocales = ['en', 'pt-BR', 'es'];
const defaultLocale = supportedLocales.find((l) => deviceLocale.startsWith(l.split('-')[0])) ?? 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLocale,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
export { supportedLocales };
