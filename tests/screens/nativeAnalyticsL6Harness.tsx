import {
  asyncNativeReady,
  loadNativeDemoModuleForWebTest,
  resetNativeWebRendererDiagnostics,
} from '../helpers/nativeWebRenderer';
import type { NativeDemoModule } from '@/features/demo-native/contracts';
import type { ProductCounts } from '@/app/state/demoTypes';
import type { Product } from '@/data/products';

/** Domain helper delegates module loading and browser APIs to the shared L6 harness. */
export async function loadActualNativeAnalyticsModule(): Promise<NativeDemoModule> {
  return loadNativeDemoModuleForWebTest();
}

export function productCountsForNative(products: readonly Product[]): ProductCounts {
  const count = (type: Product['type']) =>
    products.filter(product => product.type === type).length;
  return {
    accounts: count('current_account'),
    debitCards: count('debit_card'),
    creditCards: count('credit_card'),
    mealCards: count('meal_card'),
    deposits: count('term_deposit'),
    savingsAccounts: count('saving_account'),
    loans: count('loan'),
    mortgages: count('mortgage'),
    investments: count('investment_account'),
  };
}

export async function waitForNativeAnalyticsScreen(container: HTMLElement) {
  await asyncNativeReady(container);
}

export function resetNativeAnalyticsRenderer() {
  resetNativeWebRendererDiagnostics();
}
