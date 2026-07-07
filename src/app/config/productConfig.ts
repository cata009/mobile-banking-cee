/**
 * Product Configuration per Country
 * Defines products for ProductAccordion component
 */

export interface Product {
  id: string;
  title: string;
  description: string;
}

export type CountryProducts = {
  [key: string]: Product[];
};

// Lorem ipsum text (max 3 lines)
const LOREM_SHORT = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

export const COUNTRY_PRODUCTS: CountryProducts = {
  // Serbia - 3 products
  RS: [
    {
      id: "account",
      title: "Open an account",
      description: LOREM_SHORT,
    },
    {
      id: "loans",
      title: "Loans",
      description: LOREM_SHORT,
    },
    {
      id: "cards",
      title: "Cards",
      description: LOREM_SHORT,
    },
  ],
  
  // Hungary - 2 products
  HU: [
    {
      id: "account",
      title: "Open an account",
      description: LOREM_SHORT,
    },
    {
      id: "cash-loan",
      title: "Cash Loan application",
      description: LOREM_SHORT,
    },
  ],
  
  // Czech Republic - 2 products
  CZ: [
    {
      id: "accounts",
      title: "Accounts",
      description: LOREM_SHORT,
    },
    {
      id: "loans",
      title: "Loans",
      description: LOREM_SHORT,
    },
  ],
  
  // Slovakia - 2 products
  SK: [
    {
      id: "accounts",
      title: "Accounts",
      description: LOREM_SHORT,
    },
    {
      id: "loans",
      title: "Loans",
      description: LOREM_SHORT,
    },
  ],
  
  // Bosnia - 4 products
  BA: [
    {
      id: "account",
      title: "Open an account",
      description: LOREM_SHORT,
    },
    {
      id: "loans",
      title: "Loans",
      description: LOREM_SHORT,
    },
    {
      id: "credit-cards",
      title: "Credit cards",
      description: LOREM_SHORT,
    },
  ],

  // Bosnia Banja Luka - duplicate of Bosnia
  BA_BL: [
    {
      id: "account",
      title: "Open an account",
      description: LOREM_SHORT,
    },
    {
      id: "loans",
      title: "Loans",
      description: LOREM_SHORT,
    },
    {
      id: "credit-cards",
      title: "Credit cards",
      description: LOREM_SHORT,
    },
  ],
  
  // Romania - 2 products
  RO: [
    {
      id: "account",
      title: "Open an account",
      description: LOREM_SHORT,
    },
    {
      id: "loans",
      title: "Loans",
      description: LOREM_SHORT,
    },
  ],
  
  // Slovenia - 3 products
  SI: [
    {
      id: "account",
      title: "Open an account",
      description: LOREM_SHORT,
    },
    {
      id: "loans",
      title: "Loans",
      description: LOREM_SHORT,
    },
    {
      id: "cards",
      title: "Cards",
      description: LOREM_SHORT,
    },
  ],
};

/**
 * Get products for a specific country
 * Returns empty array if country not found
 */
export function getProductsForCountry(countryCode: string): Product[] {
  return COUNTRY_PRODUCTS[countryCode] || [];
}

/**
 * Check if country has product accordion
 */
export function hasProductAccordion(countryCode: string): boolean {
  return countryCode in COUNTRY_PRODUCTS;
}
