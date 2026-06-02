/**
 * More Cards Configuration
 * Defines which More section cards are available for each country
 */

import type { CountryId } from '@/app/state/demoTypes';

export type MoreCardType = 
  | 'contacts'
  | 'documents'
  | 'settings'
  | 'gdpr-consent'
  | 'third-party-consent'
  | 'digital-activities'
  | 'my-requests'
  | 'tutorial';

/**
 * Configuration mapping for More cards per country
 * Cards are listed in display order (left to right, top to bottom)
 */
export const MORE_CARDS_CONFIG: Record<CountryId, MoreCardType[]> = {
  // Romania - 5 cards
  RO: [
    'contacts',
    'documents',
    'settings',
    'gdpr-consent',
    'tutorial',
  ],

  // Slovenia - 6 cards
  SI: [
    'contacts',
    'documents',
    'settings',
    'gdpr-consent',
    'third-party-consent',
    'my-requests',
  ],

  // Czech Republic - 7 cards
  CZ: [
    'contacts',
    'documents',
    'settings',
    'third-party-consent',
    'digital-activities',
    'my-requests',
    'tutorial',
  ],

  // Slovakia - 7 cards
  SK: [
    'contacts',
    'documents',
    'settings',
    'third-party-consent',
    'digital-activities',
    'my-requests',
    'tutorial',
  ],

  // Bosnia - 3 cards
  BA: [
    'contacts',
    'documents',
    'settings',
  ],

  // Bosnia Banja Luka - duplicate of Bosnia
  BA_BL: [
    'contacts',
    'documents',
    'settings',
  ],

  // Hungary - 5 cards
  HU: [
    'contacts',
    'documents',
    'settings',
    'third-party-consent',
    'tutorial',
  ],

  // Serbia - 5 cards
  RS: [
    'contacts',
    'documents',
    'settings',
    'third-party-consent',
    'my-requests',
  ],
};

/**
 * Helper function to get More cards for a specific country
 */
export function getMoreCardsForCountry(country: CountryId): MoreCardType[] {
  return MORE_CARDS_CONFIG[country] || [];
}
