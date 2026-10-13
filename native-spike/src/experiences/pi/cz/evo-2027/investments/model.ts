import { deriveProductCategories } from '@/features/products/selectors';
import {
  buildInvestmentChartPoints,
  buildInvestmentSecurities,
  buildInvestmentSecurityCatalog,
  buildInvestmentHistoryTransactions,
  buildInvestmentHistoryOrders,
  calculateInvestmentPortfolioPerformance,
  getInvestmentProducts,
} from '@/app/config/investmentsPortfolioConfig';
import type { ProductCounts } from '@/app/state/demoTypes';
import type { CurrentAccount } from '@/data/products';

/** Experience composition selects CZ/current/Evo parameters; Source owns financial policies. */
export function createCzInvestmentSnapshot(productCounts: ProductCounts) {
  const products = deriveProductCategories({
    country: 'CZ',
    release: 'release-future-evo-2027',
    resolvedProductCounts: productCounts,
  }).flatMap(category => category.products);
  const securities = buildInvestmentSecurities(
    getInvestmentProducts(products),
    'CZ',
  );
  const catalog = buildInvestmentSecurityCatalog(securities, 'CZ', {
    includeRoboGoals: true,
  });
  const performance = calculateInvestmentPortfolioPerformance(securities);
  return {
    products,
    securities,
    catalog,
    approvalCatalog: buildInvestmentSecurityCatalog(securities, 'CZ'),
    performance,
    accounts: products.filter(
      (product): product is CurrentAccount =>
        product.type === 'current_account',
    ),
    transactions: buildInvestmentHistoryTransactions(securities, 'CZ', {
      includeCzRoboHistoricalTransactions: true,
    }),
    orders: buildInvestmentHistoryOrders(securities, 'CZ'),
    chart: buildInvestmentChartPoints(performance.totalValue, '3y'),
  };
}
export type CzInvestmentSnapshot = ReturnType<
  typeof createCzInvestmentSnapshot
>;
