import { ReactNode } from 'react';
import {
  Product,
  ProductCategory,
  ProductType,
  getProductsByCategory,
  formatAmount
} from '@/data/products';
import svgPaths from '@/imports/svg-wan58807zo';
import { useProductData } from '@/app/state/demoStore';
import { convertCurrency, getCountryCurrency, roundMoney } from '@/data/exchangeRates';
import { formatMaskedCardNumber } from '@/app/utils/cardNumber';
import type { ProductCountKey, ProductCounts } from '@/app/state/demoTypes';

function formatProductIban(country: string, productId: string, baseNumber: string): string {
  const prefix = country === 'BA_BL' ? 'BA' : country;
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash += productId.charCodeAt(i);
  }
  const checkDigits = String((hash % 89) + 10);
  return `${prefix}${checkDigits}BACX${baseNumber}`;
}

type ProductCountDefinition = {
  key: ProductCountKey;
  categoryKey: ProductCategory["key"];
  targetType: ProductType;
  sourceTypes: ProductType[];
  fallbackType: ProductType;
  title: string;
  idPrefix: string;
  accountSeed: string;
};

const PRODUCT_COUNT_DEFINITIONS: ProductCountDefinition[] = [
  {
    key: "accounts",
    categoryKey: "accounts",
    targetType: "current_account",
    sourceTypes: ["current_account"],
    fallbackType: "current_account",
    title: "Primary Account",
    idPrefix: "acc",
    accountSeed: "1234567890123456",
  },
  {
    key: "creditCards",
    categoryKey: "cards",
    targetType: "credit_card",
    sourceTypes: ["credit_card"],
    fallbackType: "credit_card",
    title: "Credit Card",
    idPrefix: "card-credit",
    accountSeed: "5173500087654321",
  },
  {
    key: "debitCards",
    categoryKey: "cards",
    targetType: "debit_card",
    sourceTypes: ["debit_card"],
    fallbackType: "debit_card",
    title: "Debit Card",
    idPrefix: "card-debit",
    accountSeed: "5173400012345678",
  },
  {
    key: "mealCards",
    categoryKey: "cards",
    targetType: "meal_card",
    sourceTypes: ["meal_card"],
    fallbackType: "debit_card",
    title: "Meal Card",
    idPrefix: "card-meal",
    accountSeed: "5173600098765432",
  },
  {
    key: "savingsAccounts",
    categoryKey: "savings_deposits",
    targetType: "saving_account",
    sourceTypes: ["saving_account"],
    fallbackType: "saving_account",
    title: "Savings Account",
    idPrefix: "sav",
    accountSeed: "5678901234567890",
  },
  {
    key: "deposits",
    categoryKey: "savings_deposits",
    targetType: "term_deposit",
    sourceTypes: ["term_deposit"],
    fallbackType: "term_deposit",
    title: "Term Deposit",
    idPrefix: "term",
    accountSeed: "4567890123456789",
  },
  {
    key: "loans",
    categoryKey: "mortgages_loans",
    targetType: "loan",
    sourceTypes: ["loan"],
    fallbackType: "loan",
    title: "Personal Loan",
    idPrefix: "loan",
    accountSeed: "5678901234567890",
  },
  {
    key: "mortgages",
    categoryKey: "mortgages_loans",
    targetType: "mortgage",
    sourceTypes: ["mortgage"],
    fallbackType: "mortgage",
    title: "Mortgage Loan",
    idPrefix: "mort",
    accountSeed: "6789012345678901",
  },
  {
    key: "investments",
    categoryKey: "investments",
    targetType: "investment_account",
    sourceTypes: ["investment_account"],
    fallbackType: "investment_account",
    title: "Investment Portfolio",
    idPrefix: "inv",
    accountSeed: "7890123456789012",
  },
];

const CURRENT_ACCOUNT_BALANCE_FACTORS = [1, 0.72, 1.28, 0.54, 1.62];

function replaceTailDigits(seed: string, index: number): string {
  const suffix = String(index + 1).padStart(2, "0");
  return `${seed.slice(0, -2)}${suffix}`;
}

function cardSecurityCode(index: number): string {
  return String((214 + index * 137) % 1000).padStart(3, "0");
}

function productName(baseName: string, count: number, index: number): string {
  return count === 1 ? baseName : `${baseName} ${index + 1}`;
}

function sourceForDefinition(definition: ProductCountDefinition, allProducts: Product[]): Product {
  const source =
    allProducts.find((product) => definition.sourceTypes.includes(product.type)) ??
    allProducts.find((product) => product.type === definition.fallbackType) ??
    allProducts[0];

  if (!source) {
    throw new Error(`Product source invariant failed for count key "${definition.key}"`);
  }

  return source;
}

function indexedCurrentAccountBalance(baseBalance: number, index: number): number {
  const factor = CURRENT_ACCOUNT_BALANCE_FACTORS[index] ?? Math.max(0.35, 1 - index * 0.13);
  return roundMoney(baseBalance * factor);
}

function cloneProductForCount(
  definition: ProductCountDefinition,
  allProducts: Product[],
  count: number,
  index: number,
): Product {
  const source = sourceForDefinition(definition, allProducts);
  const sourceCreditCard = source.type === "credit_card" ? source : undefined;
  const accountNumber = replaceTailDigits(definition.accountSeed, index);
  const id = `${definition.idPrefix}-${index + 1}`;
  const baseProduct = {
    ...source,
    id,
    name: productName(definition.title, count, index),
    accountNumber,
  };

  switch (definition.targetType) {
    case "debit_card": {
      const product = {
        ...baseProduct,
        type: "debit_card" as const,
        linkedAccountId: `acc-${index + 1}`,
        cardType: "Standard" as const,
        cardNumber: accountNumber,
        expiryDate: "12/29",
        cardHolderName: "PETER JAGODIĆ",
        securityCode: cardSecurityCode(index),
        balance: 0,
      };
      return product;
    }
    case "meal_card": {
      const product = {
        ...baseProduct,
        type: "meal_card" as const,
        linkedAccountId: `acc-${index + 1}`,
        cardType: "Standard" as const,
        cardNumber: accountNumber,
        expiryDate: "12/29",
        cardHolderName: "PETER JAGODIĆ",
        securityCode: cardSecurityCode(index),
        balance: 0,
      };
      return product;
    }
    case "credit_card": {
      const product = {
        ...baseProduct,
        type: "credit_card" as const,
        cardType: "Standard" as const,
        cardNumber: accountNumber,
        expiryDate: "12/29",
        cardHolderName: "PETER JAGODIĆ",
        securityCode: cardSecurityCode(index),
        creditLimit: sourceCreditCard?.creditLimit ?? 5000,
        availableCredit: sourceCreditCard?.availableCredit ?? 3200,
        balance: sourceCreditCard?.availableCredit ?? 3200,
      };
      return product;
    }
    case "current_account": {
      const product = {
        ...baseProduct,
        type: "current_account" as const,
        balance: indexedCurrentAccountBalance(baseProduct.balance, index),
        iban: accountNumber,
      };
      return product;
    }
    case "saving_account": {
      const product = {
        ...baseProduct,
        type: "saving_account" as const,
        iban: accountNumber,
      };
      return product;
    }
    case "term_deposit": {
      const product = {
        ...baseProduct,
        type: "term_deposit" as const,
      };
      return product;
    }
    case "loan": {
      const product = {
        ...baseProduct,
        type: "loan" as const,
        balance: -Math.abs(baseProduct.balance || 45000),
        loanAmount: Math.abs(baseProduct.balance || 45000),
        remainingAmount: Math.abs(baseProduct.balance || 45000),
        monthlyPayment: 900,
      };
      return product;
    }
    case "mortgage": {
      const product = {
        ...baseProduct,
        type: "mortgage" as const,
        balance: -Math.abs(baseProduct.balance || 2850000),
        loanAmount: Math.abs(baseProduct.balance || 2850000),
        remainingAmount: Math.abs(baseProduct.balance || 2850000),
        propertyValue: Math.abs(baseProduct.balance || 2850000) * 1.2,
        monthlyPayment: 3500,
      };
      return product;
    }
    case "investment_account": {
      const product = {
        ...baseProduct,
        type: "investment_account" as const,
        portfolioValue: Math.abs(baseProduct.balance || 42500),
        totalGainLoss: 728.45,
        totalGainLossPercentage: 1.74,
      };
      return product;
    }
  }
}

function getDisplayBalance(product: Product): number {
  return product.type === "credit_card" ? product.availableCredit : product.balance;
}

function applyProductCounts(categories: ProductCategory[], productCounts: ProductCounts): ProductCategory[] {
  const allProducts = categories.flatMap((category) => category.products);

  return categories
    .map((category) => {
      const definitions = PRODUCT_COUNT_DEFINITIONS.filter(
        (definition) => definition.categoryKey === category.key,
      );

      if (definitions.length === 0) {
        return category;
      }

      const products = definitions.flatMap((definition) => {
        const count = productCounts[definition.key] ?? 0;
        return Array.from({ length: count }, (_, index) =>
          cloneProductForCount(definition, allProducts, count, index),
        );
      });

      return {
        ...category,
        products,
      };
    })
    .filter((category) => category.products.length > 0);
}

export function useProducts() {
  const { country, resolvedProductCounts } = useProductData();
  const localCurrency = getCountryCurrency(country);
  const countedCategories = applyProductCounts(getProductsByCategory(), resolvedProductCounts);
  const countedProducts = countedCategories.flatMap(category => category.products);
  
  // Get base categories and convert all products to local currency
  const categories = countedCategories.map(category => ({
    ...category,
    products: category.products.map(product => {
      const isCard = product.type === 'debit_card' || product.type === 'credit_card' || product.type === 'meal_card';
      const formattedAccountNumber = isCard
        ? product.accountNumber
        : formatProductIban(country, product.id, product.accountNumber);

      // Debit cards mirror the balance of their linked current account
      const linkedAccount = product.type === 'debit_card' || product.type === 'meal_card'
        ? countedProducts.find(p => p.id === product.linkedAccountId) ??
          countedProducts.find(p => p.type === 'current_account')
        : undefined;
      const sourceBalance = linkedAccount
        ? linkedAccount.balance
        : isCard && product.type !== "credit_card"
          ? 0
          : product.balance;
      const sourceCurrency = linkedAccount ? linkedAccount.currency : product.currency;
      const convertedBalance = roundMoney(convertCurrency(sourceBalance, sourceCurrency, localCurrency));

      if (product.type === "credit_card") {
        const availableCredit = roundMoney(convertCurrency(product.availableCredit, sourceCurrency, localCurrency));
        const creditLimit = roundMoney(convertCurrency(product.creditLimit, sourceCurrency, localCurrency));

        return {
          ...product,
          accountNumber: formattedAccountNumber,
          balance: availableCredit,
          availableCredit,
          creditLimit,
          currency: localCurrency
        };
      }

      return {
        ...product,
        accountNumber: formattedAccountNumber,
        // Convert balance to local currency
        balance: convertedBalance,
        // Update currency to local
        currency: localCurrency
      };
    })
  }));

  const getProductIcon = (product: Product): ReactNode => {
    switch (product.type) {
      case 'current_account':
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d={svgPaths.p30b125f0} fill="currentColor" />
          </svg>
        );
      
      case 'debit_card':
      case 'credit_card':
      case 'meal_card':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" fill="white"/>
            <rect x="13.2961" y="11.3282" width="5.40809" height="9.76779" fill="#FF5F00"/>
            <path d="M13.6395 16.2121C13.6378 14.306 14.5083 12.505 16.0002 11.3282C13.4661 9.3263 9.82683 9.61767 7.64007 11.9976C5.45331 14.3775 5.45331 18.0468 7.64007 20.4267C9.82683 22.8066 13.4661 23.0979 16.0002 21.096C14.5083 19.9192 13.6378 18.1182 13.6395 16.2121Z" fill="#EB001B"/>
            <path d="M26 16.2121C26 18.5904 24.6491 20.76 22.5208 21.7994C20.3925 22.8389 17.8605 22.5658 16.0002 21.096C17.4907 19.9181 18.3608 18.1178 18.3608 16.2121C18.3608 14.3065 17.4907 12.5062 16.0002 11.3282C17.8605 9.85851 20.3925 9.58537 22.5208 10.6248C24.6491 11.6643 26 13.8339 26 16.2121Z" fill="#F79E1B"/>
            <path d="M25.4104 20.0615V19.8615H25.4906V19.8207H25.2863V19.8615H25.3665V20.0615H25.4104Z" fill="#F79E1B"/>
            <path d="M25.807 20.0615V19.8204H25.7444L25.6723 19.9862L25.6003 19.8204H25.5376V20.0615H25.5818V19.8796L25.6494 20.0364H25.6952L25.7628 19.8792V20.0615H25.807Z" fill="#F79E1B"/>
          </svg>
        );
      
      case 'saving_account':
      case 'term_deposit':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M7 19V26H26V19H28V26C28 27.1046 27.1046 28 26 28H7C5.89543 28 5 27.1046 5 26V19H7ZM24 24H9V4H24V24ZM11 22H22V6H11V22Z" fill="currentColor"/>
            <path d="M24 24H9V4H24V24ZM15.8467 9.07715L15.8477 16.0908L14.3926 14.6641C13.7715 14.0545 12.7636 14.0543 12.1426 14.6641L16.6426 19.0771L21.1426 14.6641C20.5215 14.0545 19.5136 14.0543 18.8926 14.6641L17.4385 16.0908V9.07715H15.8467Z" fill="currentColor"/>
          </svg>
        );
      
      case 'loan':
      case 'mortgage':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M21.0544 21.0763L16.5699 16.6087C17.2676 15.535 17.1471 14.0869 16.2036 13.1469C15.1176 12.0656 13.3584 12.0656 12.2718 13.1469C11.1877 14.2275 11.1877 15.9812 12.2731 17.0637C13.1978 17.9844 14.6088 18.1125 15.6778 17.4644L18.3731 20.1494L16.9684 21.5487C16.7519 21.7644 16.7525 22.1125 16.9684 22.3269L17.9828 23.3387C18.1993 23.5537 18.5481 23.5538 18.7645 23.3381L20.1686 21.9381L20.1786 21.9487C20.4208 22.1881 20.8141 22.1881 21.0551 21.9481C21.2966 21.7081 21.296 21.3162 21.0544 21.0763ZM25 12.875V21.6575C25 24.0556 23.0489 26 20.6416 26H11.8584C9.45114 26 7.5 24.0556 7.5 21.6575V12.875L16.3266 6L25 12.875ZM15.4175 13.9294C16.0693 14.5794 16.0681 15.6306 15.4169 16.2794C14.7656 16.9288 13.7104 16.9288 13.0592 16.28C12.4073 15.6313 12.4067 14.5794 13.0579 13.9294C13.7091 13.28 14.7669 13.2812 15.4175 13.9294Z" fill="currentColor"/>
          </svg>
        );
      
      case 'investment_account':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
            <g transform="translate(7, 7)">
              <path d="M4.5 13.5C4.5 15.9851 2.48513 18 0 18V13.5C0 11.0149 2.01487 9 4.5 9V13.5ZM11.25 13.5C11.25 15.9851 9.23512 18 6.75 18V7.875C6.75 5.38987 8.76488 3.375 11.25 3.375V13.5ZM18 13.5C18 15.9851 15.9851 18 13.5 18V4.5C13.5 2.01487 15.5149 0 18 0V13.5Z" fill="currentColor"/>
            </g>
          </svg>
        );
      
      default:
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d={svgPaths.p30b125f0} fill="currentColor" />
          </svg>
        );
    }
  };

  const formatProductAmount = (product: Product) => {
    return formatAmount(getDisplayBalance(product), product.currency);
  };

  const getProductDisplayNumber = (product: Product): string => {
    if (product.type === 'debit_card' || product.type === 'credit_card' || product.type === 'meal_card') {
      return formatMaskedCardNumber(product.accountNumber);
    }
    return product.accountNumber;
  };

  // Calculate total for a list of products (all already in local currency)
  const calculateTotal = (products: Product[]): {
    integer: string;
    decimals: string;
    currency: string;
  } => {
    // Sum all products (all already converted to local currency)
    const total = products.reduce((sum, product) => {
      return sum + getDisplayBalance(product);
    }, 0);

    return formatAmount(total, localCurrency);
  };

  // Calculate Total Available: Accounts + Savings (excluding term deposits)
  const calculateTotalAvailable = (): {
    integer: string;
    decimals: string;
    currency: string;
  } => {
    const allProducts = categories.flatMap(cat => cat.products);
    
    // Sum: current_accounts + saving_accounts (NO term_deposit)
    const total = allProducts.reduce((sum, product) => {
      if (product.type === 'current_account' || product.type === 'saving_account') {
        return sum + product.balance;
      }
      return sum;
    }, 0);

    return formatAmount(total, localCurrency);
  };

  // Calculate Total Owed: Mortgages + Loans (absolute value)
  const calculateTotalOwed = (): {
    integer: string;
    decimals: string;
    currency: string;
  } => {
    const allProducts = categories.flatMap(cat => cat.products);
    
    // Sum: loans + mortgages (take absolute value since they're negative)
    const total = allProducts.reduce((sum, product) => {
      if (product.type === 'loan' || product.type === 'mortgage') {
        return sum + Math.abs(product.balance);
      }
      return sum;
    }, 0);

    return formatAmount(total, localCurrency);
  };

  return {
    categories,
    getProductIcon,
    formatProductAmount,
    getProductDisplayNumber,
    calculateTotal,
    calculateTotalAvailable,
    calculateTotalOwed
  };
}
