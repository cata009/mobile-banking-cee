import { ReactNode } from 'react';
import { 
  Product, 
  getProductsByCategory,
  formatAmount 
} from '@/data/products';
import svgPaths from '@/imports/svg-wan58807zo';
import { useDemo } from '@/app/state/demoStore';
import { convertCurrency, getCountryCurrency, roundMoney } from '@/data/exchangeRates';

export function useProducts() {
  const { country } = useDemo();
  const localCurrency = getCountryCurrency(country);
  
  // Get base categories and convert all products to local currency
  const categories = getProductsByCategory().map(category => ({
    ...category,
    products: category.products.map(product => ({
      ...product,
      // Convert balance to local currency
      balance: roundMoney(convertCurrency(product.balance, product.currency, localCurrency)),
      // Update currency to local
      currency: localCurrency
    }))
  }));

  const getProductIcon = (product: Product): ReactNode => {
    switch (product.type) {
      case 'current_account':
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d={svgPaths.p30b125f0} fill="#007A91" />
          </svg>
        );
      
      case 'debit_card':
      case 'credit_card':
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
            <path d="M7 19V26H26V19H28V26C28 27.1046 27.1046 28 26 28H7C5.89543 28 5 27.1046 5 26V19H7ZM24 24H9V4H24V24ZM11 22H22V6H11V22Z" fill="#007A91"/>
            <path d="M24 24H9V4H24V24ZM15.8467 9.07715L15.8477 16.0908L14.3926 14.6641C13.7715 14.0545 12.7636 14.0543 12.1426 14.6641L16.6426 19.0771L21.1426 14.6641C20.5215 14.0545 19.5136 14.0543 18.8926 14.6641L17.4385 16.0908V9.07715H15.8467Z" fill="#007A91"/>
          </svg>
        );
      
      case 'loan':
      case 'mortgage':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M21.0544 21.0763L16.5699 16.6087C17.2676 15.535 17.1471 14.0869 16.2036 13.1469C15.1176 12.0656 13.3584 12.0656 12.2718 13.1469C11.1877 14.2275 11.1877 15.9812 12.2731 17.0637C13.1978 17.9844 14.6088 18.1125 15.6778 17.4644L18.3731 20.1494L16.9684 21.5487C16.7519 21.7644 16.7525 22.1125 16.9684 22.3269L17.9828 23.3387C18.1993 23.5537 18.5481 23.5538 18.7645 23.3381L20.1686 21.9381L20.1786 21.9487C20.4208 22.1881 20.8141 22.1881 21.0551 21.9481C21.2966 21.7081 21.296 21.3162 21.0544 21.0763ZM25 12.875V21.6575C25 24.0556 23.0489 26 20.6416 26H11.8584C9.45114 26 7.5 24.0556 7.5 21.6575V12.875L16.3266 6L25 12.875ZM15.4175 13.9294C16.0693 14.5794 16.0681 15.6306 15.4169 16.2794C14.7656 16.9288 13.7104 16.9288 13.0592 16.28C12.4073 15.6313 12.4067 14.5794 13.0579 13.9294C13.7091 13.28 14.7669 13.2812 15.4175 13.9294Z" fill="#007A91"/>
          </svg>
        );
      
      case 'investment_account':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
            <g transform="translate(7, 7)">
              <path d="M4.5 13.5C4.5 15.9851 2.48513 18 0 18V13.5C0 11.0149 2.01487 9 4.5 9V13.5ZM11.25 13.5C11.25 15.9851 9.23512 18 6.75 18V7.875C6.75 5.38987 8.76488 3.375 11.25 3.375V13.5ZM18 13.5C18 15.9851 15.9851 18 13.5 18V4.5C13.5 2.01487 15.5149 0 18 0V13.5Z" fill="#007A91"/>
            </g>
          </svg>
        );
      
      default:
        return (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d={svgPaths.p30b125f0} fill="#007A91" />
          </svg>
        );
    }
  };

  const formatProductAmount = (product: Product) => {
    return formatAmount(product.balance, product.currency);
  };

  const getProductDisplayNumber = (product: Product): string => {
    if (product.type === 'debit_card' || product.type === 'credit_card') {
      return product.accountNumber; // Already masked
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
      return sum + product.balance;
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
