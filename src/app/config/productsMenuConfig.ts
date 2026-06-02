import type { CountryId } from "@/app/state/demoTypes";
import type { ProductBannerColorFamily } from "@/app/config/productBannerVariants";
import productCardAccountImage from "../../../screenshots/account.png";
import productCardCardsImage from "../../../screenshots/cards.png";
import productCardInsuranceImage from "../../../screenshots/insurance.png";
import productCardInvestmentsImage from "../../../screenshots/investments.png";
import productCardMortgagesImage from "../../../screenshots/mortgages.png";

export type ProductsMenuTab = "banking" | "shopsmart";
export type ProductsCardId =
  | "account"
  | "cards"
  | "mortgages-loans"
  | "insurance"
  | "investments-savings"
  | "market-hedging"
  | "shopsmart"
  | "partner-offers"
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
  colorFamily?: ProductBannerColorFamily;
  lightVersion?: boolean;
}

export interface ProductsCard {
  id: ProductsCardId;
  title: string;
  background: string;
  illustration: ProductsCardIllustration;
  imageSrc?: string;
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
  {
    id: "account",
    title: "Account",
    background: "var(--uc-product-blue-deep)",
    illustration: "flowers",
    imageSrc: productCardAccountImage,
  },
  {
    id: "cards",
    title: "Cards",
    background: "var(--uc-red-card)",
    illustration: "bag",
    imageSrc: productCardCardsImage,
  },
  {
    id: "mortgages-loans",
    title: "Mortgages and\nloans",
    background: "var(--uc-product-mauve)",
    illustration: "pillow",
    imageSrc: productCardMortgagesImage,
  },
  {
    id: "insurance",
    title: "Insurance",
    background: "var(--uc-product-blue)",
    illustration: "umbrella",
    imageSrc: productCardInsuranceImage,
  },
  {
    id: "investments-savings",
    title: "Investments\nand savings",
    background: "var(--uc-product-slate)",
    illustration: "branch",
    imageSrc: productCardInvestmentsImage,
  },
];

const SHOPSMART_PRODUCTS: readonly ProductsCard[] = [
  { id: "account", title: "Electronics", background: "var(--uc-product-blue-deep)", illustration: "bag" },
  { id: "cards", title: "Travel", background: "var(--uc-red-card)", illustration: "arrow" },
  { id: "mortgages-loans", title: "Home and\nliving", background: "var(--uc-product-mauve)", illustration: "pillow" },
  { id: "insurance", title: "Fashion", background: "var(--uc-product-blue)", illustration: "flowers" },
];

const ADDITIONAL_SERVICES_PRODUCTS: readonly ProductsCard[] = [
  {
    id: "additional-services",
    title: "Additional\nservices",
    background: "var(--uc-neutral-750)",
    illustration: "arrow",
  },
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
    otherSolutions: [],
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

function withOfferOverrides(
  baseConfig: ProductsMenuConfig,
  overrides: {
    offers?: readonly ProductsOffer[];
    shopSmartOffers?: readonly ProductsOffer[];
  },
): ProductsMenuConfig {
  return {
    ...baseConfig,
    offers: overrides.offers ?? baseConfig.offers,
    shopSmartOffers: overrides.shopSmartOffers ?? baseConfig.shopSmartOffers,
  };
}

function withAdditionalServices(baseConfig: ProductsMenuConfig): ProductsMenuConfig {
  return {
    ...baseConfig,
    otherSolutions: ADDITIONAL_SERVICES_PRODUCTS,
  };
}

const RO_PRODUCTS_MENU = withOfferOverrides(createProductsMenuConfig(true), {
  offers: [
    {
      id: "ro-offer-1",
      title: "Premium current\naccount offer",
      description: "Enjoy zero monthly fee\nand smart everyday\nbanking benefits.",
      colorFamily: "green",
      lightVersion: false,
    },
    {
      id: "ro-offer-2",
      title: "Home loan with\nbetter terms",
      description: "Refinance your mortgage\nand keep your monthly\nbudget more relaxed.",
      colorFamily: "blue",
      lightVersion: true,
    },
    {
      id: "ro-offer-3",
      title: "Travel insurance\nfor summer plans",
      description: "Add extra peace of mind\nfor holidays, city breaks,\nand family escapes.",
      colorFamily: "yellow",
      lightVersion: false,
    },
  ],
  shopSmartOffers: [
    {
      id: "ro-shopsmart-offer-1",
      title: "Shop smarter with\nyour card",
      description: "Unlock partner deals\nand extra value on\neveryday purchases.",
      colorFamily: "yellow",
      lightVersion: true,
    },
    {
      id: "ro-shopsmart-offer-2",
      title: "Weekend city deals\nfor card holders",
      description: "Save on dining, tickets,\nand quick getaways with\nselected partners.",
      colorFamily: "pink",
      lightVersion: true,
    },
  ],
});

const CZ_PRODUCTS_MENU = withAdditionalServices(withOfferOverrides(createProductsMenuConfig(true), {
  offers: [
    {
      id: "cz-offer-1",
      title: "Current account\nfor your plans",
      description: "Keep daily banking\nsimple with flexible\ndigital servicing.",
      colorFamily: "blue",
      lightVersion: false,
    },
    {
      id: "cz-offer-2",
      title: "Savings that grow\nwith every month",
      description: "Put extra money aside\nand build your reserve\nwith more confidence.",
      colorFamily: "green",
      lightVersion: true,
    },
    {
      id: "cz-offer-3",
      title: "Mortgage support\nfor your next move",
      description: "Explore financing options\nfor renovations, upgrades,\nor a new home chapter.",
      colorFamily: "grey",
      lightVersion: false,
    },
  ],
  shopSmartOffers: [
    {
      id: "cz-shopsmart-offer-1",
      title: "Travel offers for\nweekend escapes",
      description: "Save more on flights,\nstays, and curated city\nbreak experiences.",
      colorFamily: "orange",
      lightVersion: true,
    },
    {
      id: "cz-shopsmart-offer-2",
      title: "Smart tech picks\nfor everyday life",
      description: "Use card-linked offers on\nwearables, headphones,\nand digital essentials.",
      colorFamily: "blue",
      lightVersion: false,
    },
  ],
}));

const SK_PRODUCTS_MENU = withAdditionalServices(withOfferOverrides(createProductsMenuConfig(true), {
  offers: [
    {
      id: "sk-offer-1",
      title: "Cards and accounts\nmade lighter",
      description: "Choose simple banking\npackages designed for\nyour everyday rhythm.",
      colorFamily: "red",
      lightVersion: false,
    },
    {
      id: "sk-offer-2",
      title: "Refinance your loan\nwith less pressure",
      description: "Explore smoother\ninstallments and a more\ncomfortable repayment plan.",
      colorFamily: "pink",
      lightVersion: true,
    },
    {
      id: "sk-offer-3",
      title: "Insurance cover\nfor daily confidence",
      description: "Protect travel, family,\nand key life moments with\nclear everyday options.",
      colorFamily: "green",
      lightVersion: true,
    },
  ],
  shopSmartOffers: [
    {
      id: "sk-shopsmart-offer-1",
      title: "Smart shopping,\nextra card perks",
      description: "Activate offers that fit\nyour lifestyle and daily\nspending habits.",
      colorFamily: "red",
      lightVersion: true,
    },
    {
      id: "sk-shopsmart-offer-2",
      title: "Fashion and beauty\nbenefits in one place",
      description: "Get more from your card\non style, wellness, and\nseasonal shopping moments.",
      colorFamily: "orange",
      lightVersion: true,
    },
  ],
}));

const HU_PRODUCTS_MENU = withOfferOverrides(createProductsMenuConfig(true), {
  offers: [
    {
      id: "hu-offer-1",
      title: "Flexible banking\nfor busy days",
      description: "Manage your salary,\npayments, and savings\nin one easy setup.",
      colorFamily: "orange",
      lightVersion: false,
    },
    {
      id: "hu-offer-2",
      title: "Insurance that\ntravels with you",
      description: "Stay covered with\nsimple protection for\nfamily and daily life.",
      colorFamily: "grey",
      lightVersion: true,
    },
    {
      id: "hu-offer-3",
      title: "Savings pockets\nfor future plans",
      description: "Create room for travel,\nhome goals, or family\nmilestones with more ease.",
      colorFamily: "green",
      lightVersion: false,
    },
  ],
  shopSmartOffers: [
    {
      id: "hu-shopsmart-offer-1",
      title: "Better offers for\neveryday shopping",
      description: "Use your card for more\nvalue on fashion, tech,\nand home essentials.",
      colorFamily: "pink",
      lightVersion: false,
    },
    {
      id: "hu-shopsmart-offer-2",
      title: "Dining rewards\nfor city evenings",
      description: "Enjoy more value at\nselected restaurants, cafes,\nand lifestyle partners.",
      colorFamily: "yellow",
      lightVersion: true,
    },
  ],
});

const RS_PRODUCTS_MENU = withOfferOverrides(createProductsMenuConfig(false), {
  offers: [
    {
      id: "rs-offer-1",
      title: "Accounts that keep\nyou moving",
      description: "Open a practical setup\nfor salary, transfers,\nand daily payments.",
      colorFamily: "blue",
      lightVersion: true,
    },
    {
      id: "rs-offer-2",
      title: "Cash loan support\nfor big moments",
      description: "Finance home upgrades\nor personal plans with\nclear monthly steps.",
      colorFamily: "red",
      lightVersion: false,
    },
    {
      id: "rs-offer-3",
      title: "Card benefits for\nmore everyday freedom",
      description: "Choose practical card\nfeatures for purchases,\ntravel, and digital use.",
      colorFamily: "yellow",
      lightVersion: false,
    },
  ],
});

const BA_PRODUCTS_MENU = withOfferOverrides(createProductsMenuConfig(false), {
  offers: [
    {
      id: "ba-offer-1",
      title: "Everyday banking\nwith extra clarity",
      description: "Combine account,\ncard, and digital access\nin one calm experience.",
      colorFamily: "grey",
      lightVersion: false,
    },
    {
      id: "ba-offer-2",
      title: "Savings goals for\nfuture milestones",
      description: "Build a reserve for\ntravel, family plans,\nor unexpected moments.",
      colorFamily: "green",
      lightVersion: true,
    },
    {
      id: "ba-offer-3",
      title: "Insurance and loans\nthat fit real life",
      description: "Support bigger plans with\nprotection and financing\nshaped for daily needs.",
      colorFamily: "blue",
      lightVersion: true,
    },
  ],
});

const SI_PRODUCTS_MENU = withOfferOverrides(createProductsMenuConfig(false), {
  offers: [],
});

const SI_PRODUCTS_MENU_DIRECT: ProductsMenuConfig = {
  ...SI_PRODUCTS_MENU,
  productsTitle: "",
  products: BANKING_PRODUCTS.filter((product) => product.id !== "insurance"),
};

export const PRODUCTS_MENU_CONFIG: Record<CountryId, ProductsMenuConfig> = {
  RO: RO_PRODUCTS_MENU,
  CZ: CZ_PRODUCTS_MENU,
  SK: SK_PRODUCTS_MENU,
  HU: HU_PRODUCTS_MENU,
  RS: RS_PRODUCTS_MENU,
  BA: BA_PRODUCTS_MENU,
  SI: SI_PRODUCTS_MENU_DIRECT,
};

export function getProductsMenuForCountry(country: CountryId): ProductsMenuConfig {
  return PRODUCTS_MENU_CONFIG[country];
}
