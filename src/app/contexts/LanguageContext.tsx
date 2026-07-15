import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useCountry } from '@/app/state/demoStore';
import { getTranslations } from '@/translations';
import type { AppLanguage } from '@/app/registry/languageByCountry';
import type { TranslationKeys } from '@/translations/types';

export type Language = AppLanguage;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  translations: TranslationKeys | null; // Add raw translations access
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function isUnknownRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function LanguageProvider({
  children,
  initialLanguage,
}: {
  children: ReactNode;
  /** Optional language restored from a shared deep link. */
  initialLanguage?: Language;
}) {
  const country = useCountry();
  const [language, setLanguage] = useState<Language>(initialLanguage ?? 'en');
  const prevCountryRef = useRef(country);

  // Reset to EN only when the user actually switches country — comparing against
  // the previous country (rather than a "first mount" flag) keeps a language
  // restored from a shared deep link intact, and is robust under StrictMode's
  // double-invoked effects.
  useEffect(() => {
    if (prevCountryRef.current !== country) {
      prevCountryRef.current = country;
      setLanguage('en');
    }
  }, [country]);

  /**
   * Get current translations object
   */
  const translations = getTranslations(country, language);

  /**
   * Translation function with dot notation support
   * Supports nested keys like: 'preLogin.welcome', 'home.quickActions.title'
   * 
   * @param key - Translation key in dot notation
   * @returns Translated string or key as fallback
   */
  const t = useCallback((key: string, fallback?: string): string => {
    if (!translations) {
      console.warn(`[LanguageContext] No translations found for ${country}/${language}`);
      return fallback ?? key;
    }

    // Split key by dots: 'preLogin.welcome' → ['preLogin', 'welcome']
    const keys = key.split('.');
    
    // Navigate through nested object
    let value: unknown = translations;
    for (const k of keys) {
      if (isUnknownRecord(value) && Object.prototype.hasOwnProperty.call(value, k)) {
        value = value[k];
      } else {
        // Key not found - return the key itself as fallback
        if (fallback === undefined) {
          console.warn(`[LanguageContext] Translation key not found: ${key} for ${country}/${language}`);
        }
        return fallback ?? key;
      }
    }

    // Return the final string value
    return typeof value === 'string' ? value : fallback ?? key;
  }, [country, language, translations]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // During React Fast Refresh or in isolated environments, return safe defaults
    return {
      language: 'en' as Language,
      setLanguage: () => {},
      t: (key: string, fallback?: string) => fallback ?? key,
      translations: null,
    };
  }
  return context;
}
