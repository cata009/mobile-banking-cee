import {
  buildInvestmentSecurities,
  buildInvestmentSecurityCatalog,
  buildInvestmentHistoryTransactions,
  buildInvestmentHistoryOrders,
  calculateInvestmentPortfolioPerformance,
  getInvestmentProducts,
} from '@/app/config/investmentsPortfolioConfig';
import type { CurrentAccount } from '@/data/products';
import { buildInvestmentSecurityAccountOptions } from '@/features/investments/portfolio/securityAccounts';
import type { NativeInvestmentPresentation } from '@/features/demo-native/contracts';
import { createCurrentProducts, currentFeature } from '../context';
import type { CurrentContext } from '../contracts';

type CurrentInvestmentSnapshotContext = Pick<
  CurrentContext,
  'country' | 'release' | 'productCounts' | 'bankingScenario'
> & Partial<Pick<CurrentContext, 'scenario' | 'activeFeatures'>>;

export function createCurrentInvestmentSnapshot(
  context: CurrentInvestmentSnapshotContext,
  presentation: NativeInvestmentPresentation = {},
) {
  const roboAdvisorEnabled =
    presentation.roboAdvisorEnabled ??
    currentFeature(
      {
        country: context.country,
        release: context.release,
        scenario: context.scenario ?? 'active',
        activeFeatures: context.activeFeatures,
      },
      'fx_czRoboAdvisor',
    );
  const showBottomNavigation = presentation.showBottomNavigation ?? false;
  const { products } = createCurrentProducts(context);
  const securities = buildInvestmentSecurities(
    getInvestmentProducts(products),
    context.country,
  );
  const catalog = buildInvestmentSecurityCatalog(securities, context.country, {
    includeRoboGoals: roboAdvisorEnabled,
  });
  return {
    products,
    securities,
    catalog,
    performance: calculateInvestmentPortfolioPerformance(securities),
    securityAccounts: buildInvestmentSecurityAccountOptions(securities),
    accounts: products.filter(
      (product): product is CurrentAccount =>
        product.type === 'current_account',
    ),
    transactions: buildInvestmentHistoryTransactions(
      securities,
      context.country,
      { includeCzRoboHistoricalTransactions: showBottomNavigation },
    ),
    orders: buildInvestmentHistoryOrders(securities, context.country),
  };
}
