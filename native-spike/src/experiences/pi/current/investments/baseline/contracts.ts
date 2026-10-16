import type {
  InvestmentDistributionItem,
  InvestmentPeriodId,
  InvestmentPortfolioTabId,
  InvestmentSecurity,
  InvestmentSortId,
} from '@/app/config/investmentsPortfolioConfig';
import type { CurrentScreenProps } from '../../contracts';
import type { createCurrentInvestmentSnapshot } from '../model';

export type BaselineInvestmentSnapshot = ReturnType<
  typeof createCurrentInvestmentSnapshot
>;

export interface BaselineInvestmentOverviewState {
  tabId: InvestmentPortfolioTabId;
  periodId: InvestmentPeriodId;
  sortId: InvestmentSortId;
}

export interface BaselineInvestmentOverviewProps {
  host: CurrentScreenProps;
  snapshot: Pick<BaselineInvestmentSnapshot, 'securities' | 'performance'>;
  state: BaselineInvestmentOverviewState;
  onStateChange: (patch: Partial<BaselineInvestmentOverviewState>) => void;
  onOpenSecurity: (id: string) => void;
  onOpenDistribution: (
    tab: Exclude<InvestmentPortfolioTabId, 'performance'>,
    item: InvestmentDistributionItem,
  ) => void;
  onOpenCatalog: () => void;
  onOpenHistory: () => void;
  onOpenApprovals: () => void;
}

export interface BaselineInvestmentDistributionProps {
  host: CurrentScreenProps;
  item: InvestmentDistributionItem;
  tab: Exclude<InvestmentPortfolioTabId, 'performance'>;
  securities: readonly InvestmentSecurity[];
  onBack: () => void;
}
