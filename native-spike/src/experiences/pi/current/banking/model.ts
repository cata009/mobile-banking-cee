import { createCurrentProducts } from '../context';
import { isCurrentDomesticPaymentDraftValid } from '@/features/accounts-payments/currentPaymentPolicy';
import {
  getAccountTransactionProfileIndex,
  getAccountTransactions,
  getCardTransactions,
  type AccountTransaction,
} from '@/data/accountDetails';
import { getCountryConfig } from '@/app/registry/countryConfig';
import {
  isAccountDetailProduct,
  type CreditCard,
  type DebitCard,
  type Product,
} from '@/data/products';
import {
  createTemplateDomesticPaymentDraft,
  type DomesticPaymentDraft,
} from '@/data/paymentFlow';
import { getCzechPaymentBankName } from '@/data/czechDomesticAccount';
import { applyCreditLimitOverride } from '@/features/cards/credit-limit/model';
import type {
  BankingScenarioId,
  BankingActionId,
  CountryId,
  ReleaseId,
  DemoState,
} from '@/app/state/demoTypes';
import { resolveBankingScenario } from '@/app/platform/banking/bankingScenarioRegistry';
import {
  isPIProductScenarioId,
  resolveProductDataAuthority,
} from '@/app/platform/banking/productDataAuthority';
import type { PaymentTemplateSelection } from '@/data/paymentTemplates';
import type { CurrentContext, CurrentScreenProps } from '../contracts';
import type { NativeBankingPresentation } from '@/features/demo-native/bankingPresentation';

export type BankingCard = DebitCard | CreditCard;
export interface OwnedTransaction {
  transaction: AccountTransaction;
  product: Product;
}
/** Source Payments' entitlement and holding policy, resolved from the same demo axes. */
export function disabledBankingActions(
  context: Pick<
    CurrentContext,
    'country' | 'release' | 'scenario' | 'productCounts'
  > & { bankingScenario?: BankingScenarioId },
) {
  const bankingScenario = context.bankingScenario ?? 'retail-single-account';
  const state: DemoState = {
    product: 'PI',
    country: context.country,
    designSystem: 'current',
    baseline: 'baseline-current',
    release: context.release,
    scenario: context.scenario,
    bankingScenario,
    productCounts: context.productCounts,
    amountsHidden: false,
    themeMode: 'light',
    flagsByContext: {},
  };
  const holdings = isPIProductScenarioId(bankingScenario)
    ? resolveProductDataAuthority(bankingScenario, context.productCounts)
        .resolvedHoldings
    : undefined;
  return new Map<BankingActionId, string>(
    resolveBankingScenario(state, holdings).disabledActions.map(action => [
      action.action,
      action.reason,
    ]),
  );
}
export function bankingProducts(
  context: Pick<CurrentContext, 'country' | 'release' | 'productCounts'> & {
    creditLimitOverrides?: Readonly<Record<string, number>>;
    bankingPresentation?: NativeBankingPresentation;
    virtualCards?: CurrentContext['virtualCards'];
  },
) {
  const { categories } = createCurrentProducts(context);
  const products = categories.flatMap(category => category.products);
  return {
    categories,
    products,
    accounts: products.filter(isAccountDetailProduct),
    currentAccounts: products.filter(
      product => product.type === 'current_account',
    ),
    cards: products
      .filter(
        (product): product is BankingCard =>
          product.type === 'debit_card' || product.type === 'credit_card',
      )
      .map(card =>
        card.type === 'credit_card'
          ? applyCreditLimitOverride(
              card,
              context.creditLimitOverrides?.[card.id],
            )
          : card,
      ),
  };
}
export function productTransactions(
  context: Pick<CurrentContext, 'country' | 'release' | 'productCounts'>,
  product: Product,
): AccountTransaction[] {
  if ('virtual' in product && product.virtual === true) return [];
  const data = bankingProducts(context);
  const currency = getCountryConfig(context.country).currency;
  if (product.type === 'debit_card' || product.type === 'credit_card') {
    const linkedIndex =
      product.type === 'debit_card'
        ? Math.max(
            0,
            data.currentAccounts.findIndex(
              account => account.id === product.linkedAccountId,
            ),
          )
        : 0;
    return getCardTransactions(context.country, product, currency, linkedIndex);
  }
  return getAccountTransactions(
    context.country,
    getAccountTransactionProfileIndex(
      product,
      Math.max(
        0,
        data.accounts.findIndex(account => account.id === product.id),
      ),
    ),
    currency,
  );
}
export function allAccountTransactions(
  context: Pick<CurrentContext, 'country' | 'release' | 'productCounts'>,
): OwnedTransaction[] {
  return bankingProducts(context)
    .currentAccounts.flatMap(product =>
      productTransactions(context, product).map(transaction => ({
        transaction,
        product,
      })),
    )
    .sort(
      (a, b) =>
        b.transaction.monthKey.localeCompare(a.transaction.monthKey) ||
        Number(b.transaction.day) - Number(a.transaction.day),
    );
}
/** The current baseline form's validation is preserved; Czech bank/account checks stay canonical. */
export function paymentDraftValid(
  country: CountryId,
  release: ReleaseId,
  draft: DomesticPaymentDraft,
): boolean {
  return isCurrentDomesticPaymentDraftValid(country, release, draft);
}
export function paymentTemplateDraft(
  selection: PaymentTemplateSelection,
  country: CountryId,
  release: ReleaseId,
  product?: Product | null,
): DomesticPaymentDraft {
  const draft = createTemplateDomesticPaymentDraft(selection, country, product);
  if (country !== 'CZ' || release !== 'release-current') return draft;
  const parts = selection.accountNumber.match(/^CZ\d{2}BACX(\d{6})(\d{6})$/);
  return {
    ...draft,
    ...(parts ? { prefix: parts[1]!, accountNumber: parts[2]! } : {}),
    bankName: getCzechPaymentBankName(selection.bankCode) ?? '',
  };
}
export function accountActions(product: Product) {
  const base = [
    {
      id: 'details',
      icon: 'account-details',
      key: 'details',
      label: 'Details',
      active: true,
    },
    {
      id: 'options',
      icon: 'account-options',
      key: 'options',
      label: 'Options',
      active: true,
    },
    {
      id: 'add-money',
      icon: 'add-money',
      key: 'addMoney',
      label: 'Add money',
      active: false,
    },
    {
      id: 'mcash',
      icon: 'mcash',
      key: 'internalTransfer',
      label: 'Internal transfer',
      active: false,
    },
  ];
  if (product.type === 'saving_account')
    return base.filter(action => action.id !== 'add-money');
  if (product.type === 'term_deposit')
    return base
      .filter(action => action.id !== 'options')
      .map(action =>
        action.id === 'add-money'
          ? { ...action, key: 'openTermDeposit', label: 'Open term deposit' }
          : action.id === 'mcash'
            ? {
                ...action,
                key: 'closeTermDeposit',
                label: 'Close term deposit',
              }
            : action,
      );
  if (product.type === 'loan' || product.type === 'mortgage')
    return base
      .filter(action => action.id === 'details' || action.id === 'mcash')
      .map(action =>
        action.id === 'mcash'
          ? { ...action, key: 'reimbursement', label: 'Reimbursement' }
          : action,
      );
  return base;
}
export function copy(
  host: Pick<CurrentScreenProps, 't'>,
  key: string,
  fallback: string,
): string {
  const value = host.t(key);
  return value === key ? fallback : value;
}
