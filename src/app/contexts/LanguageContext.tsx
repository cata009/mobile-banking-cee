import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useDemo } from '@/app/state/demoStore';
import { getTranslations } from '@/translations';
import type { AppLanguage } from '@/app/registry/languageByCountry';
import { getAvailableLanguages, LOCAL_LANGUAGE_BY_COUNTRY } from '@/app/registry/languageByCountry';
import type { TranslationKeys } from '@/translations/types';

export type Language = AppLanguage;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translations: TranslationKeys | null; // Add raw translations access
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { country } = useDemo();
  const [language, setLanguage] = useState<Language>('en');

  // Reset to EN when country changes (not local language)
  useEffect(() => {
    setLanguage('en');
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
  const t = useCallback((key: string): string => {
    if (!translations) {
      console.warn(`[LanguageContext] No translations found for ${country}/${language}`);
      return key;
    }

    // Split key by dots: 'preLogin.welcome' → ['preLogin', 'welcome']
    const keys = key.split('.');
    
    // Navigate through nested object
    let value: any = translations;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Key not found - return the key itself as fallback
        console.warn(`[LanguageContext] Translation key not found: ${key} for ${country}/${language}`);
        return key;
      }
    }

    // Return the final string value
    return typeof value === 'string' ? value : key;
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
      t: (key: string) => key,
      translations: null,
    };
  }
  return context;
}