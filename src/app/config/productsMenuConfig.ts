import type { CountryId } from "@/app/state/demoTypes";

export type ProductsMenuTab = "banking" | "shopsmart";
export type ProductsCardId =
  | "account"
  | "cards"
  | "mortgages-loans"
  | "insurance"
  | "investments-savings"
  | "additional-services";

export type ProductsCardIllustration =
  | "flowers"
  | "bag"
  | "pillow"
  | "umbrella"
  | "branch"
  | "arrow";

export interface ProductsOffer {
  id: string;
  title: string;
  description: string;
}

export interface ProductsCard {
  id: ProductsCardId;
  title: string;
  background: string;
  illustration: ProductsCardIllustration;
}

export interface ProductsMenuConfig {
  title: string;
  hasShopSmartTab: boolean;
  bankingTabLabel: string;
  shopSmartTabLabel: string;
  offersTitle: string;
  offers: readonly ProductsOffer[];
  productsTitle: string;
  products: readonly ProductsCard[];
  otherSolutionsTitle: string;
  otherSolutions: readonly ProductsCard[];
  shopSmartTitle: string;
  shopSmartOffers: readonly ProductsOffer[];
  shopSmartProducts: readonly ProductsCard[];
}

const BANKING_PRODUCTS: readonly ProductsCard[] = [
  { id: "account", title: "Account", background: "var(--uc-product-blue-deep)", illustration: "flowers" },
  { id: "cards", title: "Cards", background: "var(--uc-red-card)", illustration: "bag" },
  { id: "mortgages-loans", title: "Mortgages and\nloans", background: "var(--uc-product-mauve)", illustration: "pillow" },
  { id: "insurance", title: "Insurance", background: "var(--uc-product-blue)", illustration: "umbrella" },
  { id: "investments-savings", title: "Investments\nand savings", background: "var(--uc-product-slate)", illustration: "branch" },
];

const SHOPSMART_PRODUCTS: readonly ProductsCard[] = [
  { id: "account", title: "Electronics", background: "var(--uc-product-blue-deep)", illustration: "bag" },
  { id: "cards", title: "Travel", background: "var(--uc-red-card)", illustration: "arrow" },
  { id: "mortgages-loans", title: "Home and\nliving", background: "var(--uc-product-mauve)", illustration: "pillow" },
  { id: "insurance", title: "Fashion", background: "var(--uc-product-blue)", illustration: "flowers" },
];

function createProductsMenuConfig(hasShopSmartTab: boolean): ProductsMenuConfig {
  return {
    title: "Products",
    hasShopSmartTab,
    bankingTabLabel: "Banking",
    shopSmartTabLabel: "ShopSmart",
    offersTitle: "OFFERS FOR YOU",
    offers: [
      {
        id: "offer-1",
        title: "Premium current\naccount offer",
        description: "Enjoy zero monthly fee\nand smart everyday\nbanking benefits.",
      },
      {
        id: "offer-2",
        title: "Refinance with\nbetter rates",
        description: "Move your loan and get\nmore flexible monthly\ninstallments.",
      },
    ],
    productsTitle: "OUR PRODUCTS",
    products: BANKING_PRODUCTS,
    otherSolutionsTitle: "OTHER SOLUTIONS FOR YOU",
    otherSolutions: [
      {
        id: "additional-services",
        title: "Additional\nservices",
        background: "var(--uc-neutral-750)",
        illustration: "arrow",
      },
    ],
    shopSmartTitle: "SHOPSMART",
    shopSmartOffers: [
      {
        id: "shopsmart-offer-1",
        title: "Shop smarter with\nyour card",
        description: "Get exclusive partner\ndeals and extra value\nwith every payment.",
      },
    ],
    shopSmartProducts: SHOPSMART_PRODUCTS,
  };
}

export const PRODUCTS_MENU_CONFIG: Record<CountryId, ProductsMenuConfig> = {
  RO: createProductsMenuConfig(true),
  CZ: createProductsMenuConfig(true),
  SK: createProductsMenuConfig(true),
  HU: createProductsMenuConfig(true),
  RS: createProductsMenuConfig(false),
  BA: createProductsMenuConfig(false),
  SI: createProductsMenuConfig(false),
};

export function getProductsMenuForCountry(country: CountryId): ProductsMenuConfig {
  return PRODUCTS_MENU_CONFIG[country];
}
