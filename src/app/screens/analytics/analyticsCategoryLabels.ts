import type { PfmCategoryName } from "@/data/pfmCategories";

export function getAnalyticsCategoryDisplayLabel(
  category: PfmCategoryName | string,
  t: (key: string, fallback?: string) => string,
) {
  const labels: Record<string, string> = {
    Finance: "FINANCIAL",
    Shopping: "SHOPPING",
    Healthcare: "HEALTH & BEAUTY",
    Uncategorized: "UNCATEGORIZED EXPENSES",
    Home: "HOUSEHOLD",
    Groceries: "GROCERIES",
    Transportation: "CARS & TRANSPORTATION",
    "Leisure time": "LEISURE",
    "Taxes and Penalties": "TAXES & FINES",
    Income: "INCOME",
    Utilities: "UTILITIES",
    Insurance: "INSURANCE",
    Education: "SCHOOL & EDUCATION",
    Children: "CHILDREN",
    Wallet: "WALLET",
    Transfers: "TRANSFERS",
    Investments: "INVESTMENTS",
    "Exclude from budget": "EXCLUDED",
  };

  return t(`runtime.analytics.categories.${category}`, labels[category] ?? category.toUpperCase());
}
