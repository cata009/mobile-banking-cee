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
  { name: "Uncategorized", colorVar: "--uc-pfm-uncategorized", fallbackInitial: "?" },
];

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
  return PFM_CATEGORY_BY_NAME.get(normalizePfmCategory(category)) ?? PFM_CATEGORIES[PFM_CATEGORIES.length - 1];
}
