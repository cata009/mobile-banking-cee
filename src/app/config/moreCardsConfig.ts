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
    'third-party-consent',
    'my-requests',
    'tutorial',
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

  // Bosnia - 5 cards
  BA: [
    'contacts',
    'documents',
    'settings',
    'tutorial',
    'my-requests',
  ],

  // Bosnia Banja Luka - follows Bosnia card order
  BA_BL: [
    'contacts',
    'documents',
    'settings',
    'tutorial',
    'my-requests',
  ],

  // Hungary - 6 cards
  HU: [
    'contacts',
    'documents',
    'settings',
    'third-party-consent',
    'tutorial',
    'my-requests',
  ],

  // Serbia - 5 cards
  RS: [
    'contacts',
    'documents',
    'settings',
    'third-party-consent',
    'my-requests',
    'tutorial',
  ],
};

/**
 * Helper function to get More cards for a specific country
 */
export function getMoreCardsForCountry(country: CountryId): MoreCardType[] {
  return MORE_CARDS_CONFIG[country] || [];
}
