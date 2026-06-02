/**
 * Centralized Translation System
 * 
 * Strategy 2: Per-Country Translations
 * Each country has its own folder with local language + English translations
 * English text may vary between countries (e.g., "Activate App" vs "Activate mBank")
 */

import { CZ_TRANSLATIONS } from './CZ';
import { SK_TRANSLATIONS } from './SK';
import { RO_TRANSLATIONS } from './RO';
import { RS_TRANSLATIONS } from './RS';
import { HU_TRANSLATIONS } from './HU';
import { BA_TRANSLATIONS } from './BA';
import { SI_TRANSLATIONS } from './SI';
import type { Country } from '@/app/state/demoTypes';
import type { AppLanguage } from '@/app/registry/languageByCountry';

/**
 * Master translation object
 * Maps Country → Language → Translations
 */
export const TRANSLATIONS = {
  CZ: CZ_TRANSLATIONS,
  SK: SK_TRANSLATIONS,
  RO: RO_TRANSLATIONS,
  RS: RS_TRANSLATIONS,
  HU: HU_TRANSLATIONS,
  BA: BA_TRANSLATIONS,
  BA_BL: BA_TRANSLATIONS,
  SI: SI_TRANSLATIONS,
} as const;

/**
 * Type helper for available countries
 */
export type CountryCode = keyof typeof TRANSLATIONS;

/**
 * Get translations for a specific country and language
 * 
 * @param country - Country code (CZ, SK, RO, RS, HU, BA, BA_BL, SI)
 * @param language - Language code (en, cs, sk, ro, sr, hu, bs, sl)
 * @returns Translation object or null if not found
 * 
 * @example
 * ```ts
 * const translations = getTranslations('CZ', 'cs');
 * console.log(translations.preLogin.welcome); // "Vítejte"
 * ```
 */
export function getTranslations(country: Country, language: AppLanguage) {
  const countryTranslations = TRANSLATIONS[country];
  if (!countryTranslations) {
    console.warn(`[Translations] No translations found for country: ${country}`);
    return null;
  }

  const languageTranslations = countryTranslations[language as keyof typeof countryTranslations];
  if (!languageTranslations) {
    console.warn(`[Translations] No translations found for ${country}/${language}`);
    return null;
  }

  return languageTranslations;
}

/**
 * Check if a country-language combination has translations
 * 
 * @param country - Country code
 * @param language - Language code
 * @returns true if translations exist
 */
export function hasTranslations(country: Country, language: AppLanguage): boolean {
  return getTranslations(country, language) !== null;
}

// Re-export types
export type { TranslationKeys, TranslationKey } from './types';
