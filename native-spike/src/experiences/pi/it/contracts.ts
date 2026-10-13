import type { ProductCounts } from '@/app/state/demoTypes';
import type {
  SearchEntry,
  SearchTarget,
} from '@/features/search/mobileFirstSearch';

/** Native-only entry state is separate from the canonical searchable destination contract. */
export type ItalyNativeIntent =
  | { kind: 'operations' }
  | {
      kind: 'category-hub';
      category: Extract<SearchTarget, { kind: 'category' }>['category'];
    }
  | {
      kind: 'account-action';
      accountNumber: string;
      action: 'settings' | 'share' | 'frequent' | 'transfer';
    }
  | {
      kind: 'card-action';
      cardId: string;
      action: 'pin' | 'management' | 'installments';
    }
  | { kind: 'loan-action'; loanId?: string; view: string }
  | { kind: 'insurance-action'; view: 'catalogue' };

/** Native compositions receive navigation and global state; domain policies remain canonical. */
export interface ItalyNativeChrome {
  backgroundColor: string;
  navigationBackgroundColor?: string;
  barStyle: 'light-content' | 'dark-content';
}
export interface ItalyNativeScreenProps {
  target: SearchTarget;
  productCounts: ProductCounts;
  amountsHidden: boolean;
  onBack: () => void;
  onNavigate: (target: SearchTarget) => void;
  onProfile: () => void;
  onChanged: () => void;
  onAmountsToggle?: () => void;
  intent?: ItalyNativeIntent;
  onIntent?: (intent: ItalyNativeIntent) => void;
  isActive?: boolean;
  searchEntry?: SearchEntry;
  onSearch?: () => void;
  bankAdvisorKind?: 'branch' | 'remote' | 'private' | 'cfe';
  onChromeChange?: (chrome?: ItalyNativeChrome) => void;
  screenTopInset?: number;
}
export interface ItalyNativeHomeProps {
  productCounts: ProductCounts;
  amountsHidden: boolean;
  onNavigate: (target: SearchTarget) => void;
  onSearch: () => void;
  onProfile: () => void;
  onAmountsToggle: () => void;
  onIntent?: (intent: ItalyNativeIntent) => void;
  initialCategory?: Extract<SearchTarget, { kind: 'category' }>['category'];
}
export const DEFAULT_ITALY_COUNTS: ProductCounts = {
  accounts: 2,
  debitCards: 2,
  creditCards: 1,
  mealCards: 0,
  deposits: 1,
  savingsAccounts: 1,
  loans: 1,
  mortgages: 1,
  investments: 1,
};
