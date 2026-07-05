/**
 * Co-Apping Availability Utility
 * 
 * Co-Apping is a LOCAL feature available ONLY for:
 * - CZ (Czech Republic / Cehia)
 * - SK (Slovakia / Slovacia)
 * 
 * For all other countries (RO, HU, RS, BA, BA_BL, SI), this feature is completely REMOVED:
 * - No "START CO-APPING SESSION" button in Other menu
 * - No Co-Apping Session screen
 * - No Floating Co-Apping button on Homepage
 * - No green border (ShareScreenGlow) effect
 * - No Terminate Session popup
 * 
 * This ensures clean code without unused Co-Apping components for unsupported countries.
 */

import type { CountryId } from "@/app/state/demoTypes";

/**
 * Countries where Co-Apping feature is available
 */
const CO_APPING_COUNTRIES: CountryId[] = ["CZ", "SK"];

/**
 * Check if Co-Apping feature is available for the given country
 * 
 * @param country - The country code to check
 * @returns true if Co-Apping is available, false otherwise
 */
export function isCoAppingAvailable(country: CountryId): boolean {
  return CO_APPING_COUNTRIES.includes(country);
}

/**
 * Get a list of countries where Co-Apping is available
 * 
 * @returns Array of country codes where Co-Apping is available
 */
export function getCoAppingCountries(): CountryId[] {
  return [...CO_APPING_COUNTRIES];
}
