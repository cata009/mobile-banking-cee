import type { CurrentScreenProps } from '../../../contracts';
import type {
  InvestmentCatalogSecurity,
  InvestmentHistoryOrder,
  InvestmentHistoryTransaction,
} from '@/app/config/investmentsPortfolioConfig';
import type { CurrentAccount, Currency } from '@/data/products';
import type { CoAppingInvestmentBuyDraft } from '@/features/investments/orders/buyOrder';
export interface BaselineInvestmentFlowHost {
  host: CurrentScreenProps;
  onBack(): void;
}
export interface BaselineInstrumentProps extends BaselineInvestmentFlowHost {
  security: InvestmentCatalogSecurity;
  onHistory(filterByTitle: string): void;
  onBuy(): void;
  onSell(): void;
}
export interface BaselineBuyProps extends BaselineInvestmentFlowHost {
  security: InvestmentCatalogSecurity;
  accounts: readonly CurrentAccount[];
  securityAccounts?: readonly { id: string; name: string; currency: string }[];
  initialDraft?: CoAppingInvestmentBuyDraft | null;
  onComplete(): void;
}
export interface BaselineSellExecution {
  quantity: number;
  amount: number;
  currency: InvestmentCatalogSecurity['instrumentCurrency'];
}
export interface BaselineSellProps extends BaselineInvestmentFlowHost {
  security: InvestmentCatalogSecurity;
  accounts: readonly CurrentAccount[];
  onComplete(execution: BaselineSellExecution): void;
}
export interface BaselineHistoryProps extends BaselineInvestmentFlowHost {
  transactions: readonly InvestmentHistoryTransaction[];
  orders: readonly InvestmentHistoryOrder[];
  currencies?: readonly Currency[];
  initialTab?: 'transactions' | 'orders';
  filterByTitle?: string | null;
}
export interface BaselinePendingOrdersProps extends BaselineInvestmentFlowHost {
  catalog: readonly InvestmentCatalogSecurity[];
  account?: CurrentAccount;
}
