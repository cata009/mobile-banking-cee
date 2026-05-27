/**
 * Language by Country Registry
 * Maps each CEE country to its local language
 */

import type { CountryId } from "@/app/state/demoTypes";

/**
 * Supported application languages
 * - en: English (universal fallback)
 * - ro: Română (Romania)
 * - sr: Srpski (Serbia)
 * - hu: Magyar (Hungary)
 * - bs: Bosanski (Bosnia and Herzegovina)
 * - sk: Slovenčina (Slovakia)
 * - sl: Slovenščina (Slovenia)
 * - cs: Čeština (Czech Republic)
 */
export type AppLanguage = "en" | "ro" | "sr" | "hu" | "bs" | "sk" | "sl" | "cs";

/**
 * Local language mapping for each country
 * Each country has EN + its local language
 */
export const LOCAL_LANGUAGE_BY_COUNTRY: Record<CountryId, AppLanguage> = {
  RO: "ro", // România → Română
  RS: "sr", // Srbija → Srpski
  HU: "hu", // Magyarország → Magyar
  BA: "bs", // Bosna i Hercegovina → Bosanski
  SK: "sk", // Slovensko → Slovenčina
  SI: "sl", // Slovenija → Slovenščina
  CZ: "cs", // Česká republika → Čeština
};

/**
 * Get available languages for a specific country
 * Always returns English + local language
 * 
 * @param country - Country code
 * @returns Array with [local language, English] (local first for better UX)
 * 
 * @example
 * ```ts
 * getAvailableLanguages("RO") // ["ro", "en"]
 * getAvailableLanguages("CZ") // ["cs", "en"]
 * ```
 */
export function getAvailableLanguages(country: CountryId): AppLanguage[] {
  const localLanguage = LOCAL_LANGUAGE_BY_COUNTRY[country];
  
  // Return local language first, then English
  // This provides better UX as users see their language at the top
  return [localLanguage, "en"];
}

/**
 * Get display name for a language code
 * Uses native language names for better recognition
 * 
 * @param language - Language code
 * @returns Display name in native language
 * 
 * @example
 * ```ts
 * getLanguageDisplayName("ro") // "Română"
 * getLanguageDisplayName("en") // "English"
 * ```
 */
export function getLanguageDisplayName(language: AppLanguage): string {
  const displayNames: Record<AppLanguage, string> = {
    en: "English",
    ro: "Română",
    sr: "Srpski",
    hu: "Magyar",
    bs: "Bosanski",
    sk: "Slovenčina",
    sl: "Slovenščina",
    cs: "Čeština",
  };
  
  return displayNames[language];
}

/**
 * Get country flag emoji for language selector UI
 * 
 * @param language - Language code
 * @returns Flag emoji
 * 
 * @example
 * ```ts
 * getLanguageFlag("ro") // "🇷🇴"
 * getLanguageFlag("en") // "🇬🇧"
 * ```
 */
export function getLanguageFlag(language: AppLanguage): string {
  const flags: Record<AppLanguage, string> = {
    en: "🇬🇧",
    ro: "🇷🇴",
    sr: "🇷🇸",
    hu: "🇭🇺",
    bs: "🇧🇦",
    sk: "🇸🇰",
    sl: "🇸🇮",
    cs: "🇨🇿",
  };
  
  return flags[language];
}
