import { deriveProductCategories } from '@/features/products/selectors';
import { createProductFormatters } from '@/features/products/formatters';
import type { ProductCounts } from '@/app/state/demoTypes';
import {
  buildInvestmentSecurities,
  calculateInvestmentPortfolioPerformance,
} from '@/app/config/investmentsPortfolioConfig';

export type HomeTab = 'accounts' | 'savings' | 'credits' | 'insurance';
export const HOME_TABS = [
  { value: 'accounts', label: 'Accounts' },
  { value: 'savings', label: 'Savings' },
  { value: 'credits', label: 'Credits' },
  { value: 'insurance', label: 'Insurances' },
] as const;
export function createHomeProducts(productCounts: ProductCounts) {
  const categories = deriveProductCategories({
    country: 'CZ',
    release: 'release-future-evo-2027',
    resolvedProductCounts: productCounts,
  });
  const products = categories.flatMap(c => c.products);
  return {
    categories,
    products,
    portfolioPerformance: calculateInvestmentPortfolioPerformance(
      buildInvestmentSecurities(
        products.filter(product => product.type === 'investment_account'),
        'CZ',
      ),
    ),
    ...createProductFormatters(categories, 'CZ', 'release-future-evo-2027'),
  };
}
let activeHomeTab: HomeTab = 'accounts';
export function readHomeTab(tab?: string): HomeTab {
  return HOME_TABS.find(t => t.value === tab)?.value ?? activeHomeTab;
}
export function rememberHomeTab(tab: HomeTab) {
  activeHomeTab = tab;
}
