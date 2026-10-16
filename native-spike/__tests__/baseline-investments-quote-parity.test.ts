import React from 'react';
import Renderer, { act, type ReactTestRenderer } from 'react-test-renderer';
import { buildInvestmentBuyOrderQuote, getInvestmentBuyOrderValidation, getValidatedInitialDraft } from '@/features/investments/orders/buyOrder';
import { getInvestmentSellOrderValidation } from '@/features/investments/orders/sellOrder';
import type { InvestmentCatalogSecurity } from '@/app/config/investmentsPortfolioConfig';
import type { CurrentAccount } from '@/data/products';
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting';
import { BaselineTextField } from '../src/universal/BaselineTextField';
import { PrimaryButton as NativePrimaryButton } from '../src/universal/PrimaryButton';
import { BaselineInvestmentField } from '../src/experiences/pi/current/investments/baseline/Frame';
import { FaceIdOverlay } from '../src/experiences/pi/current/baseline/FaceIdOverlay';
import {
  BaselineInvestmentBuyOrder,
} from '../src/experiences/pi/current/investments/baseline/flows/BuyOrder';
import { BaselineInvestmentSellOrder } from '../src/experiences/pi/current/investments/baseline/flows/SellOrder';
import { createCurrentInvestmentSnapshot } from '../src/experiences/pi/current/investments/model';
import { currentTokens, createCurrentTranslator } from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';

const COUNTRIES = ['RO', 'HU', 'RS', 'SI', 'CZ', 'SK', 'BA', 'BA_BL'] as const;
const PRODUCT_COUNTS = {
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
const activeTrees: ReactTestRenderer[] = [];
type SourceRoot = { render(children: React.ReactNode): void; unmount(): void };
type SourceTree = { container: HTMLElement; root: SourceRoot };
type SourceDom = { window: Window & { close(): void } };
type SourceBuyProps = {
  security: InvestmentCatalogSecurity;
  accounts: readonly CurrentAccount[];
  securityAccounts?: readonly { id: string; name: string; currency: string }[];
  country: CurrentScreenProps['country'];
  amountsHidden: boolean;
  initialDraft?: NonNullable<Parameters<typeof getValidatedInitialDraft>[0]> | null;
  onBack: () => void;
  onComplete: () => void;
};
type SourceSellProps = {
  security: InvestmentCatalogSecurity;
  accounts: readonly CurrentAccount[];
  country: CurrentScreenProps['country'];
  amountsHidden: boolean;
  onBack: () => void;
  onComplete: (execution: {
    quantity: number;
    amount: number;
    currency: InvestmentCatalogSecurity['instrumentCurrency'];
  }) => void;
};
type SourceFireEvent = {
  change(element: HTMLElement, event: { target: { value: string } }): unknown;
  click(element: HTMLElement): unknown;
};
const activeSourceTrees: SourceTree[] = [];
let sourceDom: SourceDom;
let sourceCreateRoot: (container: HTMLElement) => SourceRoot;
let sourceAct: (callback: () => void) => void;
let sourceFireEvent: SourceFireEvent;
const priorGlobalDescriptors = new Map<string, PropertyDescriptor | undefined>();
const browserGlobalKeys = [
  'window',
  'document',
  'navigator',
  'Element',
  'HTMLElement',
  'Node',
  'Event',
  'MouseEvent',
  'MutationObserver',
  'getComputedStyle',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'IS_REACT_ACT_ENVIRONMENT',
];
const SourceReact = jest.requireActual('../../node_modules/react') as typeof React;
const SourceInvestmentBuyOrderFlow = (
  jest.requireActual('@/app/screens/investments/InvestmentBuyOrderFlow') as {
    default: React.ComponentType<SourceBuyProps>;
  }
).default;
const SourceInvestmentSellOrderFlow = (
  jest.requireActual('@/app/screens/investments/InvestmentSellOrderFlow') as {
    default: React.ComponentType<SourceSellProps>;
  }
).default;

beforeAll(() => {
  const { JSDOM } = jest.requireActual('jsdom') as {
    JSDOM: new (markup: string, options: { url: string; pretendToBeVisual: boolean }) => SourceDom;
  };
  sourceDom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost/',
    pretendToBeVisual: true,
  });
  const sourceWindow = sourceDom.window as unknown as Record<string, unknown>;
  const globalObject = globalThis as unknown as Record<string, unknown>;
  for (const key of browserGlobalKeys) {
    priorGlobalDescriptors.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value: key === 'IS_REACT_ACT_ENVIRONMENT' ? true : sourceWindow[key],
    });
  }
  globalObject.window = sourceDom.window;
  const reactDomClient = jest.requireActual('../../node_modules/react-dom/client') as {
    createRoot: (container: HTMLElement) => SourceRoot;
  };
  const sourceReactRuntime = jest.requireActual('../../node_modules/react') as {
    act: (callback: () => void) => void;
  };
  const domTesting = jest.requireActual('@testing-library/dom') as { fireEvent: SourceFireEvent };
  sourceCreateRoot = reactDomClient.createRoot;
  sourceAct = sourceReactRuntime.act;
  sourceFireEvent = domTesting.fireEvent;
});

function host(country: CurrentScreenProps['country'], amountsHidden = false): CurrentScreenProps {
  return {
    country,
    release: 'release-current',
    scenario: 'active',
    language: 'en',
    productCounts: PRODUCT_COUNTS,
    route: { screen: 'investments' },
    tokens: currentTokens(),
    t: createCurrentTranslator(country, 'en'),
    amountsHidden,
    screenTopInset: 54,
    isActive: true,
    onNavigate: jest.fn(),
    onBack: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    mode: 'light',
    onModeChange: jest.fn(),
  };
}

function mount(element: React.ReactElement) {
  let tree!: ReactTestRenderer;
  act(() => {
    tree = Renderer.create(element);
  });
  activeTrees.push(tree);
  return tree;
}

function unmountNative(tree: ReactTestRenderer) {
  const index = activeTrees.indexOf(tree);
  if (index >= 0) activeTrees.splice(index, 1);
  act(() => tree.unmount());
}

function mountSource(element: React.ReactElement): SourceTree {
  const container = sourceDom.window.document.createElement('div');
  sourceDom.window.document.body.append(container);
  const root = sourceCreateRoot(container);
  sourceAct(() => root.render(element));
  const tree = { container, root };
  activeSourceTrees.push(tree);
  return tree;
}

afterEach(() => {
  for (const tree of activeTrees.splice(0)) act(() => tree.unmount());
  for (const tree of activeSourceTrees.splice(0)) {
    sourceAct(() => tree.root.unmount());
    tree.container.remove();
  }
  jest.useRealTimers();
});

afterAll(() => {
  sourceDom.window.close();
  for (const key of browserGlobalKeys) {
    const descriptor = priorGlobalDescriptors.get(key);
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  }
});

function renderedText(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(renderedText).join(' ');
  if (value && typeof value === 'object' && 'children' in value) {
    return renderedText((value as { children?: unknown }).children);
  }
  return '';
}

function sourceTreeText(tree: SourceTree) {
  return tree.container.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

function nativeTreeText(tree: ReactTestRenderer) {
  return renderedText(tree.toJSON()).replace(/\s+/g, ' ').trim();
}

function sourceFieldValue(tree: SourceTree, label: string) {
  const field = Array.from(tree.container.querySelectorAll<HTMLElement>('[data-investment-detail-field]'))
    .find(node => node.dataset.investmentDetailField === label);
  if (!field) throw new Error(`Source flow is missing the ${label} detail field.`);
  const value = field.querySelectorAll('p')[1];
  if (!value) throw new Error(`Source flow is missing the ${label} value.`);
  return value.textContent?.trim() ?? '';
}

function nativeFieldValue(tree: ReactTestRenderer, label: string) {
  const field = tree.root
    .findAllByType(BaselineInvestmentField)
    .find(node => node.props.label === label);
  if (!field) throw new Error(`Native flow is missing the ${label} detail field.`);
  return renderedText(field.props.value).trim();
}

function sourceInput(tree: SourceTree, label: string) {
  const input = Array.from(tree.container.querySelectorAll<HTMLInputElement>('input'))
    .find(node => node.getAttribute('aria-label') === label);
  if (!input) throw new Error(`Source flow is missing the ${label} input.`);
  return input;
}

function changeSourceInput(tree: SourceTree, label: string, value: string) {
  sourceAct(() => sourceFireEvent.change(sourceInput(tree, label), { target: { value } }));
}

function nativeInput(tree: ReactTestRenderer, label: string) {
  const input = tree.root.findAllByType(BaselineTextField).find(node => node.props.label === label);
  if (!input) throw new Error(`Native flow is missing the ${label} input.`);
  return input;
}

function sourceButton(tree: SourceTree, label: string) {
  const button = Array.from(tree.container.querySelectorAll<HTMLButtonElement>('button'))
    .find(node => node.textContent?.trim() === label);
  if (!button) throw new Error(`Source flow is missing the ${label} action.`);
  return button;
}

function clickSourceButton(tree: SourceTree, label: string) {
  sourceAct(() => sourceFireEvent.click(sourceButton(tree, label)));
}

function nativeButton(tree: ReactTestRenderer, label: string) {
  const button = tree.root
    .findAllByType(NativePrimaryButton)
    .find(node => node.props.label === label);
  if (!button) throw new Error(`Native flow is missing the ${label} action.`);
  return button;
}

function acceptSourceTerms(tree: SourceTree) {
  const toggle = tree.container.querySelector<HTMLButtonElement>(
    'button[aria-label="Accept terms and conditions"]',
  );
  if (!toggle) throw new Error('Source flow is missing the terms acceptance toggle.');
  sourceAct(() => sourceFireEvent.click(toggle));
}

function acceptNativeTerms(tree: ReactTestRenderer) {
  const toggle = tree.root.findAll(node => node.props.ariaLabel === 'Accept terms and conditions')[0];
  if (!toggle) throw new Error('Native flow is missing the terms acceptance toggle.');
  act(() => toggle.props.onToggle(true));
}

function completeNativeFaceId(tree: ReactTestRenderer) {
  const overlay = tree.root.findByType(FaceIdOverlay);
  act(() => overlay.props.onComplete());
}

function buyFxFixture(country: CurrentScreenProps['country']) {
  const snapshot = createCurrentInvestmentSnapshot(host(country));
  for (const security of snapshot.catalog) {
    if (security.status !== 'active') continue;
    for (const account of snapshot.accounts) {
      if (account.currency === security.instrumentCurrency) continue;
      const canonicalQuote = buildInvestmentBuyOrderQuote(security, account, 1);
      if (
        canonicalQuote.hasSufficientBalance &&
        !getInvestmentBuyOrderValidation(canonicalQuote, account)
      ) {
        return { snapshot, security, account, quote: canonicalQuote };
      }
    }
  }
  throw new Error(`No funded foreign-currency buy example exists in the ${country} current snapshot.`);
}

function sellFxFixture(country: CurrentScreenProps['country']) {
  const snapshot = createCurrentInvestmentSnapshot(host(country));
  for (const security of snapshot.catalog) {
    if (security.status !== 'active' || !security.owned || security.quantity < 1) continue;
    for (const account of snapshot.accounts) {
      if (account.currency === security.instrumentCurrency) continue;
      const validation = getInvestmentSellOrderValidation({
        security,
        account,
        mode: 'units',
        unitsValue: '1',
        amountValue: '',
      });
      if (validation.canReview && validation.quote) return { snapshot, security, account, quote: validation.quote };
    }
  }
  throw new Error(`No foreign-currency sell example exists in the ${country} current snapshot.`);
}

function buyDraft(account: CurrentAccount, quantity = 1) {
  return {
    quantity,
    accountId: account.id,
    frequency: 'one-off' as const,
    executionTiming: 'today' as const,
  };
}

function buyPair(
  country: CurrentScreenProps['country'],
  fixture: ReturnType<typeof buyFxFixture>,
  amountsHidden: boolean,
  initialDraft: NonNullable<Parameters<typeof getValidatedInitialDraft>[0]>,
) {
  const sourceComplete = jest.fn();
  const nativeComplete = jest.fn();
  const source = mountSource(SourceReact.createElement(SourceInvestmentBuyOrderFlow, {
    security: fixture.security,
    accounts: fixture.snapshot.accounts,
    securityAccounts: fixture.snapshot.securityAccounts,
    country,
    amountsHidden,
    initialDraft,
    onBack: jest.fn(),
    onComplete: sourceComplete,
  }));
  const native = mount(React.createElement(BaselineInvestmentBuyOrder, {
    host: host(country, amountsHidden),
    security: fixture.security,
    accounts: fixture.snapshot.accounts,
    securityAccounts: fixture.snapshot.securityAccounts,
    initialDraft,
    onBack: jest.fn(),
    onComplete: nativeComplete,
  }));
  return { source, native, sourceComplete, nativeComplete };
}

describe.each(COUNTRIES)('baseline investment quote parity for %s', country => {
  const buy = buyFxFixture(country);
  const sell = sellFxFixture(country);

  it.each([false, true])('renders the same funded FX buy quote and account details (amountsHidden=%s)', amountsHidden => {
    jest.useFakeTimers({ doNotFake: ['requestAnimationFrame'] });
    const originalQuantity = buy.security.quantity;
    const draft = buyDraft(buy.account);
    expect(getValidatedInitialDraft(draft, buy.security, buy.snapshot.accounts)).toEqual(draft);
    const { source, native: initialNative, sourceComplete, nativeComplete } = buyPair(country, buy, amountsHidden, draft);
    let native = initialNative;
    const expectedMarketPrice = formatInvestmentMoney(
      buy.quote.marketPrice,
      country,
      buy.quote.productCurrency,
      amountsHidden,
    );
    const expectedProductAmount = formatInvestmentMoney(
      buy.quote.productAmount,
      country,
      buy.quote.productCurrency,
      amountsHidden,
    );
    const expectedDebit = formatInvestmentMoney(
      buy.quote.debitAmount,
      country,
      buy.quote.accountCurrency,
      amountsHidden,
    );

    expect(sourceFieldValue(source, 'Market price')).toBe(expectedMarketPrice);
    expect(nativeFieldValue(native, 'Market price')).toBe(expectedMarketPrice);
    expect(sourceFieldValue(source, 'Estimated amount')).toBe(expectedProductAmount);
    expect(nativeFieldValue(native, 'Estimated amount')).toBe(expectedProductAmount);
    expect(sourceFieldValue(source, 'Estimated debit')).toBe(expectedDebit);
    expect(nativeFieldValue(native, 'Estimated debit')).toBe(expectedDebit);
    expect(sourceFieldValue(source, 'Cash account')).toBe(nativeFieldValue(native, 'Cash account'));
    expect(sourceFieldValue(source, 'Cash account')).not.toContain(buy.account.accountNumber);

    acceptSourceTerms(source);
    clickSourceButton(source, 'Buy');
    clickSourceButton(source, 'Sign order');
    unmountNative(native);
    sourceAct(() => {
      jest.advanceTimersByTime(840);
    });
    expect(sourceTreeText(source)).toContain('Order accepted');
    clickSourceButton(source, 'Back to investments');
    expect(sourceComplete).toHaveBeenCalledTimes(1);

    native = mount(React.createElement(BaselineInvestmentBuyOrder, {
      host: host(country, amountsHidden),
      security: buy.security,
      accounts: buy.snapshot.accounts,
      securityAccounts: buy.snapshot.securityAccounts,
      initialDraft: draft,
      onBack: jest.fn(),
      onComplete: nativeComplete,
    }));
    acceptNativeTerms(native);
    act(() => nativeButton(native, 'Buy').props.onPress());
    act(() => nativeButton(native, 'Sign order').props.onPress());
    completeNativeFaceId(native);
    expect(nativeTreeText(native)).toContain('Order accepted');
    act(() => nativeButton(native, 'Back to investments').props.onPress());
    expect(nativeComplete).toHaveBeenCalledTimes(1);
    expect(buy.security.quantity).toBe(originalQuantity);
  });

  it('rejects invalid external buy drafts and keeps yesterday price-date and amount privacy in parity', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 9, 15, 12, 0, 0));
    const badDrafts = [
      buyDraft(buy.account, 0),
      { ...buyDraft(buy.account), accountId: 'external-account-not-in-snapshot' },
    ];

    for (const initialDraft of badDrafts) {
      expect(getValidatedInitialDraft(initialDraft, buy.security, buy.snapshot.accounts)).toBeNull();
      const source = mountSource(SourceReact.createElement(SourceInvestmentBuyOrderFlow, {
        security: buy.security,
        accounts: buy.snapshot.accounts,
        country,
        amountsHidden: true,
        initialDraft,
        onBack: jest.fn(),
        onComplete: jest.fn(),
      }));
      const native = mount(React.createElement(BaselineInvestmentBuyOrder, {
        host: host(country, true),
        security: buy.security,
        accounts: buy.snapshot.accounts,
        initialDraft,
        onBack: jest.fn(),
        onComplete: jest.fn(),
      }));

      expect(sourceInput(source, 'Quantity').value).toBe('1');
      expect(nativeInput(native, 'Quantity').props.value).toBe('1');
      expect(sourceFieldValue(source, 'Price updated at')).toBe('14.10.2026');
      expect(nativeFieldValue(native, 'Price updated at')).toBe('14.10.2026');
      const maskedPrice = formatInvestmentMoney(
        buy.security.marketPrice,
        country,
        buy.security.instrumentCurrency,
        true,
      );
      expect(sourceFieldValue(source, 'Market price')).toBe(maskedPrice);
      expect(nativeFieldValue(native, 'Market price')).toBe(maskedPrice);
      expect(sourceTreeText(source)).not.toContain('Review Data');
      expect(nativeTreeText(native)).not.toContain('Review Data');
    }
  });

  it('rejects a fractional buy quantity with the same validation as Source', () => {
    const source = mountSource(SourceReact.createElement(SourceInvestmentBuyOrderFlow, {
      security: buy.security,
      accounts: buy.snapshot.accounts,
      country,
      amountsHidden: false,
      onBack: jest.fn(),
      onComplete: jest.fn(),
    }));
    const native = mount(React.createElement(BaselineInvestmentBuyOrder, {
      host: host(country),
      security: buy.security,
      accounts: buy.snapshot.accounts,
      onBack: jest.fn(),
      onComplete: jest.fn(),
    }));
    changeSourceInput(source, 'Quantity', '1.5');
    act(() => nativeInput(native, 'Quantity').props.onChange('1.5'));

    expect(sourceTreeText(source)).toContain('Enter a positive whole number.');
    expect(nativeInput(native, 'Quantity').props.errorText).toBe('Enter a positive whole number.');
    expect(sourceButton(source, 'Next').disabled).toBe(true);
    expect(nativeButton(native, 'Next').props.disabled).toBe(true);
  });

  it.each([false, true])('renders the same funded FX sell quote, privacy, and masked account details (amountsHidden=%s)', amountsHidden => {
    jest.useFakeTimers({ doNotFake: ['requestAnimationFrame'] });
    const originalQuantity = sell.security.quantity;
    const accounts = [sell.account, ...sell.snapshot.accounts.filter(account => account.id !== sell.account.id)];
    const sourceComplete = jest.fn();
    const nativeComplete = jest.fn();
    const source = mountSource(SourceReact.createElement(SourceInvestmentSellOrderFlow, {
      security: sell.security,
      accounts,
      country,
      amountsHidden,
      onBack: jest.fn(),
      onComplete: sourceComplete,
    }));
    let native = mount(React.createElement(BaselineInvestmentSellOrder, {
      host: host(country, amountsHidden),
      security: sell.security,
      accounts,
      onBack: jest.fn(),
      onComplete: nativeComplete,
    }));
    changeSourceInput(source, 'Number of units you want to sell', '1');
    act(() => nativeInput(native, 'Number of units you want to sell').props.onChange('1'));
    expect(sourceButton(source, 'Next').disabled).toBe(false);
    expect(nativeButton(native, 'Next').props.disabled).toBe(false);
    clickSourceButton(source, 'Next');
    act(() => nativeButton(native, 'Next').props.onPress());

    expect(sourceFieldValue(source, 'Quantity')).toBe(nativeFieldValue(native, 'Quantity'));
    expect(sourceFieldValue(source, 'Estimated proceeds')).toBe(
      formatInvestmentMoney(sell.quote.productAmount, country, sell.security.instrumentCurrency, amountsHidden),
    );
    expect(nativeFieldValue(native, 'Estimated proceeds')).toBe(
      formatInvestmentMoney(sell.quote.productAmount, country, sell.security.instrumentCurrency, amountsHidden),
    );
    expect(sourceFieldValue(source, 'Estimated credit')).toBe(
      formatInvestmentMoney(sell.quote.accountAmount, country, sell.account.currency, amountsHidden),
    );
    expect(nativeFieldValue(native, 'Estimated credit')).toBe(
      formatInvestmentMoney(sell.quote.accountAmount, country, sell.account.currency, amountsHidden),
    );
    expect(sourceFieldValue(source, 'Cash account')).toBe(nativeFieldValue(native, 'Cash account'));
    expect(sourceFieldValue(source, 'Cash account')).not.toContain(sell.account.accountNumber);
    expect(sourceComplete).not.toHaveBeenCalled();
    expect(nativeComplete).not.toHaveBeenCalled();

    acceptSourceTerms(source);
    clickSourceButton(source, 'Sell');
    clickSourceButton(source, 'Sign order');
    unmountNative(native);
    sourceAct(() => {
      jest.advanceTimersByTime(840);
    });
    expect(sourceTreeText(source)).toContain('Order accepted');
    clickSourceButton(source, 'Back to investments');
    const expectedExecution = {
      quantity: sell.quote.quantity,
      amount: sell.quote.productAmount,
      currency: sell.security.instrumentCurrency,
    };
    expect(sourceComplete).toHaveBeenCalledWith(expectedExecution);

    native = mount(React.createElement(BaselineInvestmentSellOrder, {
      host: host(country, amountsHidden),
      security: sell.security,
      accounts,
      onBack: jest.fn(),
      onComplete: nativeComplete,
    }));
    act(() => nativeInput(native, 'Number of units you want to sell').props.onChange('1'));
    act(() => nativeButton(native, 'Next').props.onPress());
    acceptNativeTerms(native);
    act(() => nativeButton(native, 'Sell').props.onPress());
    act(() => nativeButton(native, 'Sign order').props.onPress());
    completeNativeFaceId(native);
    expect(nativeTreeText(native)).toContain('Order accepted');
    act(() => nativeButton(native, 'Back to investments').props.onPress());
    expect(nativeComplete).toHaveBeenCalledWith(expectedExecution);
    expect(sell.security.quantity).toBe(originalQuantity);
  });

  it('enforces the holding quantity and canonical amount limit in both sell flows', () => {
    const limitedSecurity = sell.snapshot.catalog.find(security =>
      security.status === 'active' && security.owned && security.quantity > 0 && security.sellOrderMode !== 'units-only',
    );
    if (!limitedSecurity) throw new Error(`No amount-enabled holding exists in the ${country} current snapshot.`);
    const account = sell.snapshot.accounts[0];
    if (!account) throw new Error(`No current account exists in the ${country} current snapshot.`);
    const accounts = [account, ...sell.snapshot.accounts.slice(1)];
    const source = mountSource(SourceReact.createElement(SourceInvestmentSellOrderFlow, {
      security: limitedSecurity,
      accounts,
      country,
      amountsHidden: false,
      onBack: jest.fn(),
      onComplete: jest.fn(),
    }));
    const native = mount(React.createElement(BaselineInvestmentSellOrder, {
      host: host(country),
      security: limitedSecurity,
      accounts,
      onBack: jest.fn(),
      onComplete: jest.fn(),
    }));
    const aboveHolding = String(limitedSecurity.quantity + 1);
    changeSourceInput(source, 'Number of units you want to sell', aboveHolding);
    act(() => nativeInput(native, 'Number of units you want to sell').props.onChange(aboveHolding));
    const unitError = nativeInput(native, 'Number of units you want to sell').props.errorText as string;
    expect(sourceTreeText(source)).toContain(unitError);
    expect(sourceButton(source, 'Next').disabled).toBe(true);
    expect(nativeButton(native, 'Next').props.disabled).toBe(true);

    const emptyAmountValidation = getInvestmentSellOrderValidation({
      security: limitedSecurity,
      account,
      mode: 'amount',
      unitsValue: '',
      amountValue: '',
    });
    const aboveLimit = String(emptyAmountValidation.maximumAmount + 1);
    const nativeAmountButton = native.root.findAll(node => node.props.accessibilityLabel === 'Amount')[0];
    if (!nativeAmountButton) throw new Error(`Amount selling is unavailable in ${country}.`);
    clickSourceButton(source, 'Amount');
    act(() => nativeAmountButton.props.onPress());
    changeSourceInput(source, 'Amount you want to receive', aboveLimit);
    act(() => nativeInput(native, 'Amount you want to receive').props.onChange(aboveLimit));
    expect(sourceTreeText(source))
      .toContain('The amount exceeds the maximum allowed for this instrument. Enter a lower amount.');
    expect(nativeInput(native, 'Amount you want to receive').props.errorText)
      .toBe('The amount exceeds the maximum allowed for this instrument. Enter a lower amount.');
    expect(sourceButton(source, 'Next').disabled).toBe(true);
    expect(nativeButton(native, 'Next').props.disabled).toBe(true);
  });
});
