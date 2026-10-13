import { useSyncExternalStore } from 'react';
import { CZ_TRANSLATIONS } from '@/translations/CZ';
import {
  APP_2027_THEMES,
  type HomeTheme,
} from '@/features/products/evoAppearance';

export type CzechLanguage = 'en' | 'cs';
export type CzechAppearance = 'light' | 'dark' | 'system';
export const themeChoices = APP_2027_THEMES;
export type { HomeTheme };
const listeners = new Set<() => void>();
let snapshot = {
  language: 'en' as CzechLanguage,
  appearance: 'light' as CzechAppearance,
  homeTheme: 'standard' as HomeTheme,
};
function persist(key: string, value: string) {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    /* Keep the current session draft when native storage is unavailable. */
  }
}
export const czechPreferences = {
  getSnapshot: () => snapshot,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  synchronize(values: {
    language?: CzechLanguage;
    mode?: CzechAppearance;
    homeTheme?: string;
  }) {
    const homeTheme = themeChoices.some(item => item.id === values.homeTheme)
      ? (values.homeTheme as HomeTheme)
      : snapshot.homeTheme;
    const next = {
      language: values.language ?? snapshot.language,
      appearance: values.mode ?? snapshot.appearance,
      homeTheme,
    };
    if (
      next.language === snapshot.language &&
      next.appearance === snapshot.appearance &&
      next.homeTheme === snapshot.homeTheme
    )
      return;
    snapshot = next;
    listeners.forEach(listener => listener());
  },
  hydrate() {
    const read = (key: string) => {
      try {
        return globalThis.localStorage?.getItem(key);
      } catch {
        return null;
      }
    };
    const language = read('native-cz-language-v1'),
      appearance = read('app-2027-appearance-mode'),
      homeTheme = read('app-2027-home-theme');
    snapshot = {
      language: language === 'cs' ? 'cs' : 'en',
      appearance:
        appearance === 'dark' || appearance === 'system' ? appearance : 'light',
      homeTheme: themeChoices.some(item => item.id === homeTheme)
        ? (homeTheme as HomeTheme)
        : 'standard',
    };
    listeners.forEach(listener => listener());
  },
  setLanguage(language: CzechLanguage) {
    snapshot = { ...snapshot, language };
    persist('native-cz-language-v1', language);
    listeners.forEach(listener => listener());
  },
  setAppearance(appearance: CzechAppearance) {
    snapshot = { ...snapshot, appearance };
    persist('app-2027-appearance-mode', appearance);
    listeners.forEach(listener => listener());
  },
  applyTheme(homeTheme: HomeTheme) {
    snapshot = { ...snapshot, homeTheme };
    persist('app-2027-home-theme', homeTheme);
    listeners.forEach(listener => listener());
  },
  reset() {
    snapshot = { language: 'en', appearance: 'light', homeTheme: 'standard' };
    listeners.forEach(listener => listener());
  },
};
export function useCzechPreferences() {
  return useSyncExternalStore(
    czechPreferences.subscribe,
    czechPreferences.getSnapshot,
    czechPreferences.getSnapshot,
  );
}
export function translateCzech(
  key: string,
  fallback = key,
  language = snapshot.language,
): string {
  let value: unknown = CZ_TRANSLATIONS[language];
  for (const part of key.split('.')) {
    if (
      !value ||
      typeof value !== 'object' ||
      !Object.prototype.hasOwnProperty.call(value, part)
    )
      return fallback;
    value = (value as Record<string, unknown>)[part];
  }
  return typeof value === 'string' ? value : fallback;
}
export function useCzechTranslation() {
  const { language } = useCzechPreferences();
  return (key: string, fallback?: string) =>
    translateCzech(key, fallback, language);
}
