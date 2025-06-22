import { ui, defaultLang } from './ui';

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui[typeof defaultLang], ...args: any[]) {
    const translation = ui[lang]?.[key] || ui[defaultLang][key];
    if (typeof translation === 'function') {
      return translation(...args);
    }
    return translation;
  }
}