export const PFM_ICON_SOURCE = "screenshots/PFM-icons.svg";

export type PfmCategoryName =
  | "Taxes and Penalties"
  | "Income"
  | "Utilities"
  | "Exclude from budget"
  | "Shopping"
  | "Insurance"
  | "Groceries"
  | "Home"
  | "Education"
  | "Lifestyle"
  | "Transportation"
  | "Leisure time"
  | "Healthcare"
  | "Investments"
  | "Children"
  | "Wallet"
  | "Transfers"
  | "Finance"
  | "Uncategorized";

export interface PfmCategoryDefinition {
  name: PfmCategoryName;
  colorVar: string;
  fallbackInitial: string;
}

export interface PfmCategoryGroupDefinition {
  id: string;
  label: string;
  category: PfmCategoryName;
  iconCategory: PfmCategoryName;
  subcategories: readonly string[];
}

export interface PfmCategorySelection {
  groupId: string;
  groupLabel: string;
  category: PfmCategoryName;
  subcategory: string;
}

const UNCATEGORIZED_CATEGORY: PfmCategoryDefinition = {
  name: "Uncategorized",
  colorVar: "--uc-pfm-uncategorized",
  fallbackInitial: "?",
};

export const PFM_CATEGORIES: PfmCategoryDefinition[] = [
  { name: "Taxes and Penalties", colorVar: "--uc-pfm-taxes-penalties", fallbackInitial: "T" },
  { name: "Income", colorVar: "--uc-pfm-income", fallbackInitial: "I" },
  { name: "Utilities", colorVar: "--uc-pfm-utilities", fallbackInitial: "U" },
  { name: "Exclude from budget", colorVar: "--uc-pfm-exclude-budget", fallbackInitial: "E" },
  { name: "Shopping", colorVar: "--uc-pfm-shopping", fallbackInitial: "S" },
  { name: "Insurance", colorVar: "--uc-pfm-insurance", fallbackInitial: "I" },
  { name: "Groceries", colorVar: "--uc-pfm-groceries", fallbackInitial: "G" },
  { name: "Home", colorVar: "--uc-pfm-home", fallbackInitial: "H" },
  { name: "Education", colorVar: "--uc-pfm-education", fallbackInitial: "E" },
  { name: "Lifestyle", colorVar: "--uc-pfm-lifestyle", fallbackInitial: "L" },
  { name: "Transportation", colorVar: "--uc-pfm-transportation", fallbackInitial: "T" },
  { name: "Leisure time", colorVar: "--uc-pfm-leisure-time", fallbackInitial: "L" },
  { name: "Healthcare", colorVar: "--uc-pfm-healthcare", fallbackInitial: "H" },
  { name: "Investments", colorVar: "--uc-pfm-investments", fallbackInitial: "I" },
  { name: "Children", colorVar: "--uc-pfm-children", fallbackInitial: "C" },
  { name: "Wallet", colorVar: "--uc-pfm-wallet", fallbackInitial: "W" },
  { name: "Transfers", colorVar: "--uc-pfm-transfers", fallbackInitial: "T" },
  { name: "Finance", colorVar: "--uc-pfm-finance", fallbackInitial: "F" },
  UNCATEGORIZED_CATEGORY,
];

export const PFM_CATEGORY_GROUPS = [
  {
    id: "household",
    label: "HOUSEHOLD",
    category: "Home",
    iconCategory: "Home",
    subcategories: [
      "HOME SERVICES",
      "RENT",
      "FURNITURE",
      "BUILDING & GARDEN",
      "HOME SECURITY",
      "HOME IMPROVEMENTS & REPAIRS",
      "PETS",
      "COMMUNAL WASTE",
      "VETERINARY SERVICES",
      "ELECTRONICS & APPLIANCES",
      "HOME (OTHER)",
    ],
  },
  {
    id: "utilities",
    label: "UTILITIES",
    category: "Utilities",
    iconCategory: "Utilities",
    subcategories: ["WATER & SEWERAGE", "ELECTRICITY", "GAS", "TV, PHONE & INTERNET", "UTILITIES (OTHER)"],
  },
  {
    id: "cars-transportation",
    label: "CARS & TRANSPORTATION",
    category: "Transportation",
    iconCategory: "Transportation",
    subcategories: [
      "PUBLIC TRANSPORT",
      "PARKING",
      "GAS & FUEL",
      "MAINTENANCE & PARTS",
      "TOLL ROADS",
      "CAR CLEANING",
      "TAXI",
      "RENTAL",
      "CARS & TRANSPORTATION (OTHER)",
    ],
  },
  {
    id: "children",
    label: "CHILDREN",
    category: "Children",
    iconCategory: "Children",
    subcategories: [
      "SCHOOL FEES",
      "CHILDREN'S CLOTHING",
      "CHILDREN'S TOYS",
      "ALLOWANCE & POCKET MONEY",
      "BABYSITTING",
      "KIDS ACTIVITIES",
      "SAVINGS FOR CHILDREN",
      "CHILDCARE PRODUCTS",
      "MEDICAL CARE FOR CHILDREN",
      "CHILDREN (OTHER)",
    ],
  },
  {
    id: "health-beauty",
    label: "HEALTH & BEAUTY",
    category: "Healthcare",
    iconCategory: "Healthcare",
    subcategories: [
      "PHARMACY",
      "DOCTOR",
      "PERSONAL CARE",
      "COSMETICS & HAIR",
      "WELLNESS & SPA",
      "EYE CARE",
      "DENTIST",
      "HEALTH & BEAUTY (OTHER)",
    ],
  },
  {
    id: "shopping",
    label: "SHOPPING",
    category: "Shopping",
    iconCategory: "Shopping",
    subcategories: [
      "SUBSCRIPTIONS & DIGITAL MEDIA",
      "CLOTHES & SHOES",
      "DRY CLEANING & CLOTHING REPAIRS",
      "BOOKS, MUSIC, VIDEO GAMES",
      "ALCOHOL",
      "TOBACCO",
      "GIFTS",
      "ELECTRONICS & COMPUTERS",
      "JEWELLERY & ACCESSORIES",
      "SHOPPING (OTHER)",
    ],
  },
  {
    id: "leisure",
    label: "LEISURE",
    category: "Lifestyle",
    iconCategory: "Lifestyle",
    subcategories: [
      "FAST FOOD",
      "MUSIC & MOVIES",
      "GYM",
      "RESTAURANTS & CAFES",
      "CULTURE & ART",
      "LOTTERIES & BETS",
      "HOBBIES",
      "SPORTS",
      "LEISURE (OTHER)",
    ],
  },
  {
    id: "education",
    label: "EDUCATION",
    category: "Education",
    iconCategory: "Education",
    subcategories: ["STUDENT FEES / TAXES", "TUITION & COURSES", "SCHOOL BOOKS & STATIONERY", "EDUCATION (OTHER)"],
  },
  {
    id: "vacation-travel",
    label: "VACATION & TRAVEL",
    category: "Leisure time",
    iconCategory: "Leisure time",
    subcategories: [
      "HOTELS & ACCOMMODATION",
      "SKIING & WINTER SPORTS",
      "TRAVEL AGENCY",
      "PLANES, TRAINS, FERRY",
      "VACATION & TRAVEL (OTHER)",
    ],
  },
  {
    id: "investments-savings",
    label: "INVESTMENTS & SAVINGS",
    category: "Investments",
    iconCategory: "Investments",
    subcategories: [
      "SAVINGS PLAN",
      "RETIREMENT PLAN",
      "CRYPTOCURRENCIES",
      "INVESTMENT FUNDS",
      "STOCKS & BONDS",
      "TERM DEPOSIT",
      "INVESTMENTS & SAVINGS (OTHER)",
    ],
  },
  {
    id: "uncategorized-expenses",
    label: "UNCATEGORIZED EXPENSES",
    category: "Uncategorized",
    iconCategory: "Uncategorized",
    subcategories: ["UNCATEGORIZED EXPENSES (OTHER)"],
  },
  {
    id: "groceries",
    label: "GROCERIES",
    category: "Groceries",
    iconCategory: "Groceries",
    subcategories: ["GROCERIES"],
  },
  {
    id: "exclude-budget",
    label: "EXCLUDE FROM BUDGET",
    category: "Exclude from budget",
    iconCategory: "Exclude from budget",
    subcategories: ["REIMBURSABLE & REIMBURSED", "EXCLUDE FROM BUDGET (OTHER)"],
  },
  {
    id: "insurance",
    label: "INSURANCE",
    category: "Insurance",
    iconCategory: "Insurance",
    subcategories: ["HOME INSURANCE", "AUTO INSURANCE", "LIFE & HEALTH INSURANCE", "MEDICAL INSURANCE", "INSURANCE (OTHER)"],
  },
  {
    id: "financial",
    label: "FINANCIAL",
    category: "Finance",
    iconCategory: "Finance",
    subcategories: ["DONATIONS", "MORTGAGE", "LEASING", "BANK FEES", "LOANS", "CREDIT CARDS", "FINANCIAL (OTHER)"],
  },
  {
    id: "transfers",
    label: "TRANSFERS",
    category: "Transfers",
    iconCategory: "Transfers",
    subcategories: ["TRANSFERS BETWEEN OWN ACCOUNTS", "DOMESTIC TRANSACTIONS", "INTERNATIONAL TRANSACTIONS", "TRANSFERS (OTHER)"],
  },
  {
    id: "taxes-fines",
    label: "TAXES & FINES",
    category: "Taxes and Penalties",
    iconCategory: "Taxes and Penalties",
    subcategories: ["FINES", "TAX PAYMENT", "TAXES & FINES (OTHER)"],
  },
  {
    id: "wallet",
    label: "WALLET",
    category: "Wallet",
    iconCategory: "Wallet",
    subcategories: ["ATM WITHDRAWAL", "CASH WITHDRAWAL"],
  },
] as const satisfies readonly PfmCategoryGroupDefinition[];

const normalizeCategoryKey = (value: string) => value.trim().toLowerCase();

const PFM_CATEGORY_BY_NAME = new Map(PFM_CATEGORIES.map((category) => [category.name, category]));
const PFM_CATEGORY_NAME_BY_KEY = new Map(
  PFM_CATEGORIES.map((category) => [normalizeCategoryKey(category.name), category.name]),
);

const CATEGORY_ALIASES: Record<string, PfmCategoryName> = {
  Card: "Wallet",
  "Cars and transportation": "Transportation",
  Savings: "Investments",
  Spending: "Uncategorized",
  Fines: "Taxes and Penalties",
  Tax: "Taxes and Penalties",
  Taxes: "Taxes and Penalties",
  "Taxes and fines": "Taxes and Penalties",
  Leisure: "Leisure time",
  Exclude: "Exclude from budget",
  Excluded: "Exclude from budget",
  Finacial: "Finance",
  Financial: "Finance",
  "Health care": "Healthcare",
  "Leisure personal care": "Lifestyle",
  "School and education": "Education",
  "Transport and utility": "Leisure time",
  "Uncategorized expenses": "Uncategorized",
  ATM: "Wallet",
  FX: "Transfers",
  Internal: "Transfers",
};

const CATEGORY_ALIAS_BY_KEY = new Map(
  Object.entries(CATEGORY_ALIASES).map(([alias, category]) => [normalizeCategoryKey(alias), category]),
);

export function normalizePfmCategory(category?: string | null): PfmCategoryName {
  const trimmed = category?.trim();

  if (!trimmed) {
    return "Uncategorized";
  }

  // Map legacy categories directly
  const upperVal = trimmed.toUpperCase();
  if (upperVal === "ATM" || upperVal === "CASH") {
    return "Wallet";
  }
  if (upperVal === "FX" || upperVal === "INTERNAL") {
    return "Transfers";
  }

  if (PFM_CATEGORY_BY_NAME.has(trimmed as PfmCategoryName)) {
    return trimmed as PfmCategoryName;
  }

  const normalizedKey = normalizeCategoryKey(trimmed);

  return PFM_CATEGORY_NAME_BY_KEY.get(normalizedKey) ?? CATEGORY_ALIAS_BY_KEY.get(normalizedKey) ?? "Uncategorized";
}

export function getPfmCategory(category?: string | null): PfmCategoryDefinition {
  return PFM_CATEGORY_BY_NAME.get(normalizePfmCategory(category)) ?? UNCATEGORIZED_CATEGORY;
}

export function isInternalTransferCategory(category?: string | null): boolean {
  return normalizeCategoryKey(category ?? "") === "internal";
}

const SUBCATEGORY_ALIASES: Record<string, readonly [string, string]> = {
  "rent and housing": ["household", "RENT"],
  supermarket: ["groceries", "GROCERIES"],
  restaurants: ["leisure", "RESTAURANTS & CAFES"],
  "coffee shop": ["leisure", "RESTAURANTS & CAFES"],
  "utility bill": ["utilities", "UTILITIES (OTHER)"],
  "incoming transfer": ["transfers", "DOMESTIC TRANSACTIONS"],
  "medical care": ["health-beauty", "DOCTOR"],
  "insurance premium": ["insurance", "INSURANCE (OTHER)"],
  "policy payment": ["insurance", "INSURANCE (OTHER)"],
  "school fee": ["education", "STUDENT FEES / TAXES"],
  childcare: ["children", "CHILDCARE PRODUCTS"],
  "child expenses": ["children", "CHILDREN (OTHER)"],
  "fuel and transport": ["cars-transportation", "GAS & FUEL"],
  "public transport": ["cars-transportation", "PUBLIC TRANSPORT"],
  "online purchase": ["shopping", "SHOPPING (OTHER)"],
  "retail purchase": ["shopping", "SHOPPING (OTHER)"],
  subscriptions: ["shopping", "SUBSCRIPTIONS & DIGITAL MEDIA"],
  "taxes and fees": ["taxes-fines", "TAX PAYMENT"],
  "local tax": ["taxes-fines", "TAX PAYMENT"],
  "cash withdrawal": ["wallet", "CASH WITHDRAWAL"],
  "broker transfer": ["investments-savings", "INVESTMENTS & SAVINGS (OTHER)"],
  "investment plan": ["investments-savings", "SAVINGS PLAN"],
  "bank fees": ["financial", "BANK FEES"],
  "currency exchange": ["transfers", "TRANSFERS (OTHER)"],
  "own account transfer": ["transfers", "TRANSFERS BETWEEN OWN ACCOUNTS"],
  "savings transfer": ["transfers", "TRANSFERS BETWEEN OWN ACCOUNTS"],
  "term deposit transfer": ["transfers", "TRANSFERS BETWEEN OWN ACCOUNTS"],
  "excluded payment": ["exclude-budget", "EXCLUDE FROM BUDGET (OTHER)"],
  "needs category": ["uncategorized-expenses", "UNCATEGORIZED EXPENSES (OTHER)"],
  courses: ["education", "TUITION & COURSES"],
  "loan repayment": ["financial", "LOANS"],
  interest: ["financial", "FINANCIAL (OTHER)"],
};

export function getPfmCategorySelection(
  category?: string | null,
  subcategory?: string | null,
): PfmCategorySelection {
  const normalizedSubcategory = subcategory?.trim().toLocaleLowerCase() ?? "";
  const exactGroup = PFM_CATEGORY_GROUPS.find((group) =>
    group.subcategories.some((candidate) => candidate.toLocaleLowerCase() === normalizedSubcategory),
  );
  const exactSubcategory = exactGroup?.subcategories.find(
    (candidate) => candidate.toLocaleLowerCase() === normalizedSubcategory,
  );

  if (exactGroup && exactSubcategory) {
    return {
      groupId: exactGroup.id,
      groupLabel: exactGroup.label,
      category: exactGroup.category,
      subcategory: exactSubcategory,
    };
  }

  const alias = SUBCATEGORY_ALIASES[normalizedSubcategory];
  const aliasGroup = alias ? PFM_CATEGORY_GROUPS.find((group) => group.id === alias[0]) : undefined;
  if (alias && aliasGroup) {
    return {
      groupId: aliasGroup.id,
      groupLabel: aliasGroup.label,
      category: aliasGroup.category,
      subcategory: alias[1],
    };
  }

  const canonicalCategory = normalizePfmCategory(category);
  const categoryGroup = PFM_CATEGORY_GROUPS.find((group) => group.category === canonicalCategory)
    ?? PFM_CATEGORY_GROUPS.find((group) => group.id === "uncategorized-expenses")!;

  return {
    groupId: categoryGroup.id,
    groupLabel: categoryGroup.label,
    category: categoryGroup.category,
    subcategory: subcategory?.trim().toLocaleUpperCase() || categoryGroup.subcategories[0],
  };
}
