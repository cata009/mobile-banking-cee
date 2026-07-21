import type { CountryId } from "@/app/state/demoTypes";
import type { ProductBannerColorFamily } from "@/app/config/productBannerVariants";
import productCardAccountImage from "../../../screenshots/account.png";
import productCardCardsImage from "../../../screenshots/cards.png";
import productCardInsuranceImage from "../../../screenshots/insurance.png";
import productCardInvestmentsImage from "../../../screenshots/investments.png";
import productCardMortgagesImage from "../../../screenshots/mortgages.png";
import shopsmartEnglishHomeImage from "@/assets/shopsmart/shopsmart-english-home.png";
import shopsmartLentiamoImage from "@/assets/shopsmart/shopsmart-lentiamo.png";
import shopsmartValentinoImage from "@/assets/shopsmart/shopsmart-valentino.png";

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
  /** Short one-line note shown under the description in the compact card variant only. */
  caption?: string;
  colorFamily?: ProductBannerColorFamily;
  lightVersion?: boolean;
}

export interface ShopSmartSummary {
  activatedOffers: number;
  totalSavedLabel: string;
  totalSavedAmount: string;
}

export interface ShopSmartOfferCard {
  id: string;
  merchant: string;
  title: string;
  statusText: string;
  imageSrc: string;
  pillLabel?: string;
  pillTone?: "teal" | "white";
  tagLabel?: string;
  distance?: string;
  trailingIcon?: "website" | "partners";
}

export interface ProductsCard {
  id: ProductsCardId;
  title: string;
  background: string;
  illustration: ProductsCardIllustration;
  imageSrc?: string;
  translationKey?: string | null;
}

export interface ProductCardSheetOption {
  id: string;
  title: string;
}

export interface ProductCardSheetConfig {
  title?: string;
  options: readonly ProductCardSheetOption[];
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
  shopSmartSummary: ShopSmartSummary;
  shopSmartOfferCards: readonly ShopSmartOfferCard[];
}

const DEFAULT_PRODUCT_CARD_SHEET: ProductCardSheetConfig = {
  options: [
    { id: "term-deposit", title: "Term deposit" },
    { id: "saving-account", title: "Saving account" },
    { id: "mutual-funds", title: "Mutual funds" },
  ],
};

const PRODUCT_CARD_SHEETS: Partial<Record<ProductsCardId, ProductCardSheetConfig>> = {
  account: {
    options: [
      { id: "current-account", title: "Current account" },
      { id: "overdraft", title: "Overdraft" },
    ],
  },
  cards: {
    options: [
      { id: "debit-card", title: "Debit card" },
      { id: "credit-card", title: "Credit card" },
      { id: "virtual-card", title: "Virtual card" },
    ],
  },
  "mortgages-loans": {
    title: "Borrowing",
    options: [
      { id: "mortgage-loan", title: "Mortgage loan" },
      { id: "personal-loan", title: "Personal loan" },
    ],
  },
  insurance: {
    title: "Insurances",
    options: [
      { id: "travel-insurance", title: "Travel insurance" },
      { id: "home-insurance", title: "Home insurance" },
      { id: "car-insurance", title: "Car Insurance (My Car)" },
      { id: "life-insurance", title: "Life insurance" },
    ],
  },
  "investments-savings": {
    title: "Saving and investing",
    options: DEFAULT_PRODUCT_CARD_SHEET.options,
  },
  "additional-services": {
    options: [
      { id: "branch-appointment", title: "Branch appointment" },
      { id: "digital-activity-record", title: "Digital activity record" },
      { id: "my-applications", title: "My applications" },
      { id: "service-requests", title: "Service requests" },
    ],
  },
};

const RO_PRODUCT_CARD_SHEETS: Partial<Record<ProductsCardId, ProductCardSheetConfig>> = {
  account: {
    options: [
      { id: "current-account", title: "Current account" },
      { id: "overdraft", title: "Overdraft" },
    ],
  },
  cards: {
    options: [
      { id: "debit-card", title: "Debit card" },
      { id: "credit-card-consumer-financing", title: "Credit card UniCredit Consumer Financing" },
      { id: "virtual-card", title: "Virtual card" },
    ],
  },
  "mortgages-loans": {
    title: "Borrowing",
    options: [
      { id: "personal-loan", title: "Personal loan" },
      { id: "mortgage-loan", title: "Mortgage loan" },
    ],
  },
  insurance: {
    title: "Insurances",
    options: [
      { id: "genius-protect", title: "Genius Protect" },
      { id: "home-insurance", title: "Home insurance" },
      { id: "travel", title: "Travel" },
      { id: "my-car", title: "My Car" },
      { id: "umbrella", title: "Umbrella" },
      { id: "start-invest", title: "Start invest" },
    ],
  },
  "investments-savings": {
    title: "Saving and investing",
    options: [
      { id: "term-deposit", title: "Term deposit" },
      { id: "saving-account", title: "Saving account" },
      { id: "round-up", title: "Round Up" },
      { id: "mutual-funds", title: "Mutual funds" },
    ],
  },
};

const COUNTRY_PRODUCT_CARD_SHEETS: Partial<Record<CountryId, Partial<Record<ProductsCardId, ProductCardSheetConfig>>>> = {
  RO: RO_PRODUCT_CARD_SHEETS,
};

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

const RO_BANKING_PRODUCT_ORDER: readonly ProductsCardId[] = [
  "account",
  "cards",
  "mortgages-loans",
  "investments-savings",
  "insurance",
];

const RO_BANKING_PRODUCTS: readonly ProductsCard[] = RO_BANKING_PRODUCT_ORDER
  .map((productId) => BANKING_PRODUCTS.find((product) => product.id === productId))
  .filter((product): product is ProductsCard => Boolean(product));

const SHOPSMART_PRODUCTS: readonly ProductsCard[] = [
  { id: "account", title: "Electronics", background: "var(--uc-product-blue-deep)", illustration: "bag" },
  { id: "cards", title: "Travel", background: "var(--uc-red-card)", illustration: "arrow" },
  { id: "mortgages-loans", title: "Home and\nliving", background: "var(--uc-product-mauve)", illustration: "pillow" },
  { id: "insurance", title: "Fashion", background: "var(--uc-product-blue)", illustration: "flowers" },
];

export const DEFAULT_SHOPSMART_SUMMARY: ShopSmartSummary = {
  activatedOffers: 4,
  totalSavedLabel: "Total saved",
  totalSavedAmount: "0,00 RON",
};

export const DEFAULT_SHOPSMART_OFFER_CARDS: readonly ShopSmartOfferCard[] = [
  {
    id: "shopsmart-valentino",
    merchant: "Valentino.ro",
    title: "Up to 10% cashback peste\n500 de Lei",
    statusText: "Until 31-December-2025",
    imageSrc: shopsmartValentinoImage,
    pillLabel: "Active",
    pillTone: "white",
    trailingIcon: "website",
  },
  {
    id: "shopsmart-lentiamo",
    merchant: "Lentiamo.ro",
    title: "50.00 RON peste 500 de Lei",
    statusText: "Until 31-December-2025",
    imageSrc: shopsmartLentiamoImage,
    pillLabel: "Active",
    pillTone: "white",
    trailingIcon: "website",
  },
  {
    id: "shopsmart-english-home",
    merchant: "English home",
    title: "10% cashback peste 100 de Lei",
    statusText: "Until 31-December-2025",
    imageSrc: shopsmartEnglishHomeImage,
    pillLabel: "Activate",
    pillTone: "teal",
    distance: "2,69 km",
    trailingIcon: "partners",
  },
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
    shopSmartSummary: DEFAULT_SHOPSMART_SUMMARY,
    shopSmartOfferCards: DEFAULT_SHOPSMART_OFFER_CARDS,
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

const RO_PRODUCTS_MENU = {
  ...withOfferOverrides(createProductsMenuConfig(true), {
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
  }),
  products: RO_BANKING_PRODUCTS,
};

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

const BA_DIRECT_PRODUCTS: readonly ProductsCard[] = BANKING_PRODUCTS
  .filter((product) => product.id !== "insurance")
  .map((product) => {
    if (product.id === "account") return { ...product, title: "Accounts", translationKey: null };
    if (product.id === "mortgages-loans") return { ...product, title: "Loans", translationKey: null };
    if (product.id === "investments-savings") return { ...product, title: "Savings", translationKey: null };
    return { ...product, translationKey: null };
  });

const BA_PRODUCTS_MENU_DIRECT: ProductsMenuConfig = {
  ...createProductsMenuConfig(false),
  offers: [],
  productsTitle: "",
  products: BA_DIRECT_PRODUCTS,
};

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
  BA: BA_PRODUCTS_MENU_DIRECT,
  BA_BL: BA_PRODUCTS_MENU_DIRECT,
  SI: SI_PRODUCTS_MENU_DIRECT,
};

export function getProductsMenuForCountry(country: CountryId): ProductsMenuConfig {
  return PRODUCTS_MENU_CONFIG[country];
}

export function getProductCardSheetConfig(cardId: ProductsCardId, country?: CountryId): ProductCardSheetConfig {
  const countrySheet = country ? COUNTRY_PRODUCT_CARD_SHEETS[country]?.[cardId] : undefined;
  return countrySheet ?? PRODUCT_CARD_SHEETS[cardId] ?? DEFAULT_PRODUCT_CARD_SHEET;
}
