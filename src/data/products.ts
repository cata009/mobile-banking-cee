// Product Types
export type Currency = 'CZK' | 'EUR' | 'USD' | 'GBP' | 'RON' | 'BAM' | 'HUF' | 'RSD';

export type ProductType = 
  | 'current_account'
  | 'debit_card'
  | 'credit_card'
  | 'meal_card'
  | 'saving_account'
  | 'term_deposit'
  | 'loan'
  | 'mortgage'
  | 'investment_account';

export type CardType = 'Standard' | 'Gold' | 'Platinum' | 'Classic';

export interface BaseProduct {
  id: string;
  type: ProductType;
  name: string;
  accountNumber: string;
  balance: number;
  currency: Currency;
}

export interface CurrentAccount extends BaseProduct {
  type: 'current_account';
  iban: string;
}

export interface DebitCard extends BaseProduct {
  type: 'debit_card';
  cardType: CardType;
  cardNumber: string;
  expiryDate: string;
  cardHolderName?: string;
  securityCode?: string;
  linkedAccountId: string;
}

export interface CreditCard extends BaseProduct {
  type: 'credit_card';
  cardType: CardType;
  cardNumber: string;
  expiryDate: string;
  cardHolderName?: string;
  securityCode?: string;
  creditLimit: number;
  availableCredit: number;
}

export interface MealCard extends BaseProduct {
  type: 'meal_card';
  cardType: CardType;
  cardNumber: string;
  expiryDate: string;
  linkedAccountId: string;
}

export interface SavingAccount extends BaseProduct {
  type: 'saving_account';
  interestRate: number;
  iban: string;
}

export interface TermDeposit extends BaseProduct {
  type: 'term_deposit';
  interestRate: number;
  maturityDate: string;
  initialDeposit: number;
}

export interface Loan extends BaseProduct {
  type: 'loan';
  loanAmount: number;
  remainingAmount: number;
  interestRate: number;
  monthlyPayment: number;
  endDate: string;
}

export interface Mortgage extends BaseProduct {
  type: 'mortgage';
  propertyValue: number;
  loanAmount: number;
  remainingAmount: number;
  interestRate: number;
  monthlyPayment: number;
  endDate: string;
}

export interface InvestmentAccount extends BaseProduct {
  type: 'investment_account';
  portfolioValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
}

export type Product = 
  | CurrentAccount 
  | DebitCard 
  | CreditCard 
  | MealCard
  | SavingAccount 
  | TermDeposit 
  | Loan 
  | Mortgage 
  | InvestmentAccount;

export const ACCOUNT_DETAIL_PRODUCT_TYPES: ProductType[] = [
  'current_account',
  'saving_account',
  'term_deposit',
  'loan',
  'mortgage'
];

export function isAccountDetailProduct(product: Product): boolean {
  return ACCOUNT_DETAIL_PRODUCT_TYPES.includes(product.type);
}

// Mock Database
export const mockProducts: Product[] = [
  // Accounts
  {
    id: 'acc-1',
    type: 'current_account',
    name: 'Primary Account',
    accountNumber: '1234567890123456',
    balance: 2850.50,
    currency: 'CZK'
  },
  {
    id: 'acc-2',
    type: 'current_account',
    name: 'Primary Account 2',
    accountNumber: '2345678901234567',
    balance: 2052.36,
    currency: 'CZK'
  },

  // Cards
  {
    id: 'card-2',
    type: 'credit_card',
    name: 'Credit Card',
    accountNumber: '5173500087654321',
    balance: 3200,
    currency: 'CZK',
    cardType: 'Standard',
    cardNumber: '5173500087654321',
    expiryDate: '12/29',
    cardHolderName: 'PETER JAGODIĆ',
    securityCode: '990',
    creditLimit: 10000,
    availableCredit: 3200
  },
  {
    id: 'card-1',
    type: 'debit_card',
    name: 'Debit Card',
    accountNumber: '5173400012345678',
    balance: 0,
    currency: 'CZK',
    cardType: 'Gold',
    cardNumber: '5173400012345678',
    expiryDate: '12/29',
    cardHolderName: 'PETER JAGODIĆ',
    securityCode: '214',
    linkedAccountId: 'acc-1'
  },
  {
    id: 'card-3',
    type: 'debit_card',
    name: 'Debit Card Plus',
    accountNumber: '5173400012345699',
    balance: 0,
    currency: 'CZK',
    cardType: 'Standard',
    cardNumber: '5173400012345699',
    expiryDate: '12/29',
    cardHolderName: 'PETER JAGODIĆ',
    securityCode: '782',
    linkedAccountId: 'acc-2'
  },

  // Savings and Term Deposits
  {
    id: 'sav-1',
    type: 'saving_account',
    name: 'Emergency Fund',
    accountNumber: '5678901234567890',
    balance: 15000.00,
    currency: 'CZK'
  },
  {
    id: 'term-1',
    type: 'term_deposit',
    name: '12-Month Term Deposit',
    accountNumber: '4567890123456789',
    balance: 8500.00,
    currency: 'EUR'
  },

  // Loans and Mortgages
  {
    id: 'loan-1',
    type: 'loan',
    name: 'Personal Loan',
    accountNumber: '5678901234567890',
    balance: -45000.00,
    currency: 'CZK'
  },
  {
    id: 'mort-1',
    type: 'mortgage',
    name: 'Home Mortgage',
    accountNumber: '6789012345678901',
    balance: -2850000.00,
    currency: 'CZK'
  },

  // Investments
  {
    id: 'inv-1',
    type: 'investment_account',
    name: 'Investment Portfolio',
    accountNumber: '7890123456789012',
    balance: 42500.00,
    currency: 'CZK',
    portfolioValue: 42500.00,
    totalGainLoss: 728.45,
    totalGainLossPercentage: 1.74
  }
];

// Category Grouping
export type CategoryKey = 
  | 'accounts' 
  | 'cards' 
  | 'savings_deposits' 
  | 'mortgages_loans' 
  | 'investments';

export interface ProductCategory {
  key: CategoryKey;
  title: string;
  products: Product[];
}

export function getProductsByCategory(): ProductCategory[] {
  return [
    {
      key: 'accounts',
      title: 'Accounts',
      products: mockProducts.filter(p => p.type === 'current_account')
    },
    {
      key: 'cards',
      title: 'Cards',
      products: mockProducts.filter(p => 
        p.type === 'debit_card' || p.type === 'credit_card' || p.type === 'meal_card'
      )
    },
    {
      key: 'savings_deposits',
      title: 'Savings',
      products: mockProducts.filter(p => 
        p.type === 'saving_account' || p.type === 'term_deposit'
      )
    },
    {
      key: 'mortgages_loans',
      title: 'Loans',
      products: mockProducts.filter(p => 
        p.type === 'loan' || p.type === 'mortgage'
      )
    },
    {
      key: 'investments',
      title: 'Investment',
      products: mockProducts.filter(p => p.type === 'investment_account')
    }
  ];
}

// Utility functions
export function getProductById(id: string): Product | undefined {
  return mockProducts.find(p => p.id === id);
}

export function formatAmount(amount: number, currency: Currency): {
  integer: string;
  decimals: string;
  currency: string;
} {
  const absAmount = Math.abs(amount);
  const integer = Math.floor(absAmount).toLocaleString('cs-CZ');
  const decimals = (absAmount % 1).toFixed(2).substring(1);
  
  return {
    integer,
    decimals,
    currency
  };
}

export function getProductIcon(product: Product): string {
  // Return icon identifiers that can be used to render appropriate SVGs
  switch (product.type) {
    case 'current_account':
      return 'account';
    case 'debit_card':
      return 'debit_card';
    case 'credit_card':
      return 'credit_card';
    case 'saving_account':
      return 'savings';
    case 'term_deposit':
      return 'term_deposit';
    case 'loan':
      return 'loan';
    case 'mortgage':
      return 'mortgage';
    case 'investment_account':
      return 'investment';
    default:
      return 'account';
  }
}
