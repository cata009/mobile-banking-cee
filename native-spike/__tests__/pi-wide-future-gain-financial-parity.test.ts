import React from 'react';
import Renderer, { act, type ReactTestRenderer } from 'react-test-renderer';
import { TextInput as NativeTextInput } from 'react-native';
import type { CurrentContext, CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { currentTokens, createCurrentTranslator } from '../src/experiences/pi/current/context';
import {
  futureGainAvailableBalance,
} from '../src/experiences/pi/current/future-gain/model';
import { createCurrentInvestmentSnapshot } from '../src/experiences/pi/current/investments/model';
import { Simulator } from '../src/experiences/pi/current/future-gain/Simulator';
import { TermDeposit } from '../src/experiences/pi/current/future-gain/TermDeposit';
import { PeerSimulator } from '../src/experiences/pi/current/future-gain/PeerSimulator';
import { Chips, Fact, Money } from '../src/experiences/pi/current/future-gain/Primitives';
import { sourceColor } from '../src/universal/sourceColor';
import {
  DEPOSIT_CURRENCIES,
  EXTERNAL_LIMITS,
  FUND_OPTIONS,
  FUTURE_GAIN_REFERENCE_DATE,
  INVESTMENT_CURRENCIES,
  STOCK_OPTIONS,
  TENOR_OPTIONS,
  calculateFutureGainDepositQuote,
  calculateFutureGainInvestmentIllustration,
  parseFutureGainAmount,
  getFutureGainDepositSuggestions,
  getFutureGainInvestmentSuggestions,
  type DepositCurrency,
  type FundingSource,
  type InvestmentOption,
  type SimulatorCurrency,
  type SimulatorKind,
  type TenorMonths,
} from '@/features/investments/future-gain/smartInvestment';
import { formatMoneyNumber } from '@/app/registry/countryConfig';
import {
  FUTURE_GAIN_PEER_GOALS,
  calculateFutureGainPeerSimulation,
  getFutureGainPeerSimulatorPreset,
  type FutureGainPeerProduct,
  type FutureGainPeerSimulatorKind,
} from '@/features/investments/future-gain/peerInsights';
import { deriveProductCategories } from '@/features/products/selectors';
import { createProductFormatters } from '@/features/products/formatters';
import { convertCurrency, getCountryCurrency, roundMoney } from '@/data/exchangeRates';
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority';
import { isReleaseFeatureActive } from '@/app/state/featureResolver';
import type { NativeInvestmentPresentation } from '@/features/demo-native/contracts';
import {
  buildInvestmentHistoryOrders,
  buildInvestmentHistoryTransactions,
  buildInvestmentSecurityCatalog,
  buildInvestmentSecurities,
  getInvestmentProducts,
} from '@/app/config/investmentsPortfolioConfig';

const COUNTRY = 'RS' as const;
const RELEASE = 'release-future-rs-future-gain' as const;
const CURRENCIES: readonly SimulatorCurrency[] = ['EUR', 'RSD', 'USD'];
const BASE_COUNTS: CurrentContext['productCounts'] = {
  accounts: 2,
  debitCards: 1,
  creditCards: 1,
  mealCards: 0,
  deposits: 1,
  savingsAccounts: 1,
  loans: 0,
  mortgages: 0,
  investments: 1,
};
const ZERO_COUNTS: CurrentContext['productCounts'] = {
  accounts: 0,
  debitCards: 0,
  creditCards: 0,
  mealCards: 0,
  deposits: 0,
  savingsAccounts: 0,
  loans: 0,
  mortgages: 0,
  investments: 0,
};
const BALANCE_PROFILES: readonly [string, CurrentContext['productCounts']][] = [
  ['empty', ZERO_COUNTS],
  ['current accounts only', { ...ZERO_COUNTS, accounts: 2 }],
  ['savings only', { ...ZERO_COUNTS, savingsAccounts: 2 }],
  ['term deposits only', { ...ZERO_COUNTS, deposits: 2 }],
  [
    'other products only',
    { ...ZERO_COUNTS, debitCards: 1, creditCards: 1, loans: 1, mortgages: 1, investments: 1 },
  ],
  ['mixed FutureGain profile', BASE_COUNTS],
];

function host(
  productCounts: CurrentContext['productCounts'] = BASE_COUNTS,
  route: CurrentScreenProps['route'] = { screen: 'investments' },
): CurrentScreenProps {
  return {
    country: COUNTRY,
    release: RELEASE,
    scenario: 'active',
    language: 'en',
    productCounts,
    route,
    tokens: currentTokens(),
    t: createCurrentTranslator(COUNTRY, 'en'),
    amountsHidden: false,
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

function sourceBalanceRsd(productCounts: CurrentContext['productCounts']) {
  const categories = deriveProductCategories({
    country: COUNTRY,
    release: RELEASE,
    resolvedProductCounts: productCounts,
  });
  return createProductFormatters(categories, COUNTRY, RELEASE).calculateTotalAvailableAmount();
}

function sourceAvailableBalance(
  productCounts: CurrentContext['productCounts'],
  currency: SimulatorCurrency,
) {
  return roundMoney(
    convertCurrency(sourceBalanceRsd(productCounts), getCountryCurrency(COUNTRY), currency),
  );
}

type CurrentInvestmentSnapshotContext = Pick<
  CurrentContext,
  'country' | 'release' | 'productCounts' | 'bankingScenario'
> & Partial<Pick<CurrentContext, 'scenario' | 'activeFeatures'>>;

function sourceRoboAdvisorEnabled(context: CurrentInvestmentSnapshotContext) {
  if (context.activeFeatures !== undefined) {
    return context.activeFeatures.includes('fx_czRoboAdvisor');
  }
  return isReleaseFeatureActive(
    {
      product: 'PI',
      country: context.country,
      designSystem: 'current',
      release: context.release,
      scenario: context.scenario ?? 'active',
    },
    'fx_czRoboAdvisor',
  );
}

function sourceInvestmentData(
  context: CurrentInvestmentSnapshotContext,
  presentation: NativeInvestmentPresentation = {},
) {
  const categories = deriveProductCategories({
    country: context.country,
    release: context.release,
    resolvedProductCounts: context.productCounts,
  });
  const products = categories.flatMap(category => category.products);
  const securities = buildInvestmentSecurities(
    getInvestmentProducts(products),
    context.country,
  );
  const catalog = buildInvestmentSecurityCatalog(securities, context.country, {
    includeRoboGoals:
      presentation.roboAdvisorEnabled ?? sourceRoboAdvisorEnabled(context),
  });
  const transactions = buildInvestmentHistoryTransactions(securities, context.country, {
    includeCzRoboHistoricalTransactions: presentation.showBottomNavigation ?? false,
  });
  // Source history orders expose only minimumRecordsPerSecurity; the archived
  // PI portfolio has no robo-presentation order option.
  const orders = buildInvestmentHistoryOrders(securities, context.country);
  return { products, securities, catalog, transactions, orders };
}

const BASELINE_COUNTRIES = ['RO', 'HU', 'RS', 'SI', 'CZ', 'SK', 'BA', 'BA_BL'] as const;
const BASELINE_RELEASES = ['release-current', 'release-v1', 'release-v2', 'release-v3', 'release-v4'] as const;
const BASELINE_CONTEXTS = BASELINE_COUNTRIES.flatMap(country =>
  BASELINE_RELEASES.map(release => ({
    country,
    release,
    productCounts: { ...DEFAULT_VISIBLE_PRODUCT_OVERRIDES },
  })),
);

test.each(BASELINE_CONTEXTS)(
  '$country $release keeps the Source-default investment snapshot unchanged',
  context => {
    const expected = sourceInvestmentData(context);
    const actual = createCurrentInvestmentSnapshot(context);

    expect(actual.products).toEqual(expected.products);
    expect(actual.securities).toEqual(expected.securities);
    expect(actual.catalog).toEqual(expected.catalog);
    expect(actual.transactions).toEqual(expected.transactions);
    expect(actual.orders).toEqual(expected.orders);
    expect(actual.catalog.some(security => security.id.startsWith('robo-'))).toBe(false);
    expect(actual.transactions.some(transaction => transaction.id.startsWith('trx-catalog-climate-focus'))).toBe(false);
  },
);

const ROBO_CONTEXTS: readonly {
  label: string;
  context: CurrentInvestmentSnapshotContext;
}[] = [
  {
    label: 'CZ Robo release',
    context: {
      country: 'CZ',
      release: 'release-future-cz-robo',
      scenario: 'active',
      productCounts: { ...DEFAULT_VISIBLE_PRODUCT_OVERRIDES },
    },
  },
  {
    label: 'CZ Evo release',
    context: {
      country: 'CZ',
      release: 'release-future-evo-2027',
      scenario: 'active',
      productCounts: { ...DEFAULT_VISIBLE_PRODUCT_OVERRIDES },
    },
  },
];

test.each(ROBO_CONTEXTS)(
  '$label extends the Source catalog while history rows follow the presentation flag',
  ({ context }) => {
    const withoutRoboHistory: NativeInvestmentPresentation = {
      roboAdvisorEnabled: true,
      showBottomNavigation: false,
    };
    const withRoboHistory: NativeInvestmentPresentation = {
      roboAdvisorEnabled: true,
      showBottomNavigation: true,
    };
    const expectedWithout = sourceInvestmentData(context, withoutRoboHistory);
    const expectedWith = sourceInvestmentData(context, withRoboHistory);
    const actualWithout = createCurrentInvestmentSnapshot(context, withoutRoboHistory);
    const actualWith = createCurrentInvestmentSnapshot(context, withRoboHistory);

    expect(actualWithout.catalog).toEqual(expectedWithout.catalog);
    expect(actualWith.catalog).toEqual(expectedWith.catalog);
    expect(actualWithout.catalog.filter(item => item.id.startsWith('robo-')).length).toBeGreaterThan(0);
    expect(actualWith.transactions).toEqual(expectedWith.transactions);
    expect(actualWithout.transactions).toEqual(expectedWithout.transactions);
    expect(actualWith.transactions).toHaveLength(actualWithout.transactions.length + 3);
    expect(actualWith.transactions.filter(item => item.id.startsWith('trx-catalog-climate-focus'))).toHaveLength(3);
    expect(actualWith.orders).toEqual(expectedWith.orders);
    expect(actualWithout.orders).toEqual(expectedWithout.orders);
  },
);

test('Root activeFeatures and NativeInvestmentPresentation remain explicit Robo preview authorities', () => {
  const context: CurrentInvestmentSnapshotContext = {
    country: 'CZ',
    release: 'release-future-cz-robo',
    scenario: 'active',
    activeFeatures: [],
    productCounts: { ...DEFAULT_VISIBLE_PRODUCT_OVERRIDES },
  };
  const featureDisabled = createCurrentInvestmentSnapshot(context);
  const previewEnabled = createCurrentInvestmentSnapshot(context, {
    roboAdvisorEnabled: true,
    showBottomNavigation: true,
  });
  const previewDisabled = createCurrentInvestmentSnapshot(
    { ...context, activeFeatures: ['fx_czRoboAdvisor'] },
    { roboAdvisorEnabled: false },
  );

  expect(featureDisabled.catalog.some(item => item.id.startsWith('robo-'))).toBe(false);
  expect(previewEnabled.catalog.some(item => item.id.startsWith('robo-'))).toBe(true);
  expect(previewEnabled.transactions.filter(item => item.id.startsWith('trx-catalog-climate-focus'))).toHaveLength(3);
  expect(previewDisabled.catalog.some(item => item.id.startsWith('robo-'))).toBe(false);
});

async function render(element: React.ReactElement) {
  let tree!: ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(element);
  });
  return tree;
}

async function unmount(tree: ReactTestRenderer) {
  await act(() => tree.unmount());
}

function fact(tree: ReactTestRenderer, label: string) {
  const row = tree.root.findAllByType(Fact).find(node => node.props.label === label);
  if (!row) throw new Error(`FutureGain screen is missing the ${label} fact.`);
  return row;
}

function moneyFact(tree: ReactTestRenderer, label: string) {
  const value = fact(tree, label).props.value;
  if (!React.isValidElement(value) || value.type !== Money) {
    throw new Error(`FutureGain ${label} fact is not rendered through the canonical money field.`);
  }
  const props = value.props as { value: number; currency: string };
  return { value: props.value, currency: props.currency };
}

function opportunityAmount(tree: ReactTestRenderer, expected: number, currency: string) {
  const value = tree.root.findAll(node =>
    typeof node.type === 'function' && node.type.name === 'OpportunityAmount',
  ).find(node => node.props.amount === expected && node.props.currency === currency);
  if (!value) throw new Error(`Missing OpportunityAmount(${expected}, ${currency}).`);
  return value.props as {
    amount: number;
    currency: string;
    color: string;
    prefix?: string;
    align?: 'left' | 'right';
  };
}

function pressable(tree: ReactTestRenderer, label: string) {
  const action = tree.root.findAll(node =>
    node.props.accessibilityLabel === label && typeof node.props.onPress === 'function',
  )[0];
  if (!action) throw new Error(`FutureGain screen is missing the ${label} action.`);
  return action;
}

async function press(tree: ReactTestRenderer, label: string) {
  await act(() => pressable(tree, label).props.onPress());
}

function formField(tree: ReactTestRenderer, label: string) {
  const field = tree.root
    .findAllByType(NativeTextInput)
    .find(node => node.props.accessibilityLabel === label);
  if (!field) throw new Error(`FutureGain screen is missing the ${label} input.`);
  return field;
}

async function enterAmount(tree: ReactTestRenderer, label: string, value: string) {
  await act(() => formField(tree, label).props.onChangeText(value));
}

function expectFormError(tree: ReactTestRenderer, expected: string) {
  const errors = tree.root
    .findAll(node => node.props.accessibilityRole === 'alert')
    .map(node => node.props.children);
  if (expected) expect(errors).toContain(expected);
  else expect(errors).toHaveLength(0);
}

function assertMoneyFact(
  tree: ReactTestRenderer,
  label: string,
  expected: number,
  currency: string,
) {
  expect(moneyFact(tree, label)).toEqual({ value: expected, currency });
}

describe.each(BALANCE_PROFILES)('RS FutureGain available balance: %s', (_name, productCounts) => {
  test.each(CURRENCIES)('matches Source product totals in %s', currency => {
    const context = { country: COUNTRY, release: RELEASE, productCounts };
    const sourceRsd = sourceBalanceRsd(productCounts);
    const expected = roundMoney(convertCurrency(sourceRsd, getCountryCurrency(COUNTRY), currency));

    expect(futureGainAvailableBalance(context, currency)).toBe(expected);
    expect(sourceAvailableBalance(productCounts, currency)).toBe(expected);
    if (_name === 'empty' || _name === 'term deposits only' || _name === 'other products only') {
      expect(sourceRsd).toBe(0);
    }
  });
});

const SIMULATOR_OPTIONS: readonly { kind: SimulatorKind; option: InvestmentOption }[] = [
  ...FUND_OPTIONS.map(option => ({ kind: 'fund' as const, option })),
  ...STOCK_OPTIONS.map(option => ({ kind: 'stock' as const, option })),
];
const SIMULATOR_CASES = SIMULATOR_OPTIONS.flatMap(({ kind, option }) =>
  INVESTMENT_CURRENCIES.map(currency => ({
    caseName: `${kind} ${option.id} ${currency}`,
    kind,
    option,
    currency,
  })),
);

test.each(SIMULATOR_CASES)('$caseName uses Source balance, rate and illustration', async ({ kind, option, currency }) => {
  const context = { country: COUNTRY, release: RELEASE, productCounts: BASE_COUNTS };
  const availableBalance = sourceAvailableBalance(BASE_COUNTS, currency);
  const amount = availableBalance > 0 ? Math.min(1000, availableBalance) : 0;
  const amountInput = String(amount);
  const expected = calculateFutureGainInvestmentIllustration({ amount, availableBalance, option });
  const screenHost = host(BASE_COUNTS, {
    screen: 'smart-investment',
    params: { view: kind, securityId: option.id, amountInput, currency },
  });
  const tree = await render(
    React.createElement(Simulator, { host: screenHost, kind, onBack: screenHost.onBack }),
  );

  try {
    expect(futureGainAvailableBalance(context, currency)).toBe(availableBalance);
    expect(formField(tree, `Investment amount in ${currency}`).props.value).toBe(amountInput);
    expectFormError(tree, expected.amountError);
    const returnValue = expected.isAmountValid ? expected.potentialReturn : null;
    const accumulatedValue = expected.isAmountValid ? expected.accumulatedAmount : null;
    if (returnValue === null) expect(fact(tree, 'Potential annual return').props.value).toBe('—');
    else assertMoneyFact(tree, 'Potential annual return', returnValue, currency);
    if (accumulatedValue === null) expect(fact(tree, 'Accumulated amount').props.value).toBe('—');
    else assertMoneyFact(tree, 'Accumulated amount', accumulatedValue, currency);
    expect(fact(tree, 'Return rate').props.value).toBe(
      `${expected.annualReturnRate.toLocaleString('sr-RS', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%`,
    );
    if (kind === 'fund') expect(fact(tree, 'Entry fee').props.value).toBe('0%');
    expect(fact(tree, 'Tenor').props.value).toBe('12 months');
    expect(fact(tree, 'Price updated at').props.value).toBe(FUTURE_GAIN_REFERENCE_DATE);
    expect(tree.root.findByType(Chips).props.items.map((item: { value: number }) => item.value)).toEqual(
      getFutureGainInvestmentSuggestions(availableBalance, currency),
    );
    expect(pressable(tree, 'Explore more').props.disabled).toBe(!expected.isAmountValid);
  } finally {
    await unmount(tree);
  }
});

test('RS EUR simulator input formats, parses and quotes 1.160,33 like Source', async () => {
  const amount = 1160.33;
  const sourceFormattedAmount = formatMoneyNumber(amount, COUNTRY);
  expect(sourceFormattedAmount).toBe('1.160,33');
  expect(parseFutureGainAmount(sourceFormattedAmount)).toBe(amount);

  const availableBalance = sourceAvailableBalance(BASE_COUNTS, 'EUR');
  expect(availableBalance).toBeGreaterThanOrEqual(amount);
  const option = FUND_OPTIONS.find(item => item.id === 'balanced-income')!;
  const screenHost = host(BASE_COUNTS, {
    screen: 'smart-investment',
    params: {
      view: 'fund',
      securityId: option.id,
      amountInput: String(amount),
      currency: 'EUR',
    },
  });
  const tree = await render(
    React.createElement(Simulator, { host: screenHost, kind: 'fund', onBack: screenHost.onBack }),
  );

  try {
    const input = formField(tree, 'Investment amount in EUR');
    await act(() => input.props.onBlur());
    expect(formField(tree, 'Investment amount in EUR').props.value).toBe(sourceFormattedAmount);
    const parsedAmount = parseFutureGainAmount(formField(tree, 'Investment amount in EUR').props.value);
    const expected = calculateFutureGainInvestmentIllustration({
      amount: parsedAmount,
      availableBalance,
      option,
    });

    expect(parsedAmount).toBe(1160.33);
    expect(expected.potentialReturn).toBe(20.89);
    expect(expected.accumulatedAmount).toBe(1181.22);
    assertMoneyFact(tree, 'Potential annual return', 20.89, 'EUR');
    assertMoneyFact(tree, 'Accumulated amount', 1181.22, 'EUR');
  } finally {
    await unmount(tree);
  }
});

type DepositCase = {
  caseName: string;
  currency: DepositCurrency;
  fundingSource: FundingSource;
  tenor: TenorMonths;
};
const DEPOSIT_CASES: DepositCase[] = DEPOSIT_CURRENCIES.flatMap(currency =>
  (['current', 'external'] as const).flatMap(fundingSource =>
    TENOR_OPTIONS.map(tenor => ({
      caseName: `${fundingSource} ${currency} ${tenor} months`,
      currency,
      fundingSource,
      tenor,
    })),
  ),
);

test.each(DEPOSIT_CASES)('$caseName preserves Source term-deposit capital, rates, tax and maturity', async ({ currency, fundingSource, tenor }) => {
  const context = { country: COUNTRY, release: RELEASE, productCounts: BASE_COUNTS };
  const availableBalance = sourceAvailableBalance(BASE_COUNTS, currency);
  const amount = 1000;
  const expected = calculateFutureGainDepositQuote({ amount, currency, fundingSource, tenor });
  const screenHost = host(BASE_COUNTS);
  const tree = await render(React.createElement(TermDeposit, { host: screenHost, onBack: screenHost.onBack }));

  try {
    if (currency !== 'EUR') {
      await press(tree, 'Change currency, currently EUR');
      await press(tree, currency);
      await press(tree, 'OK');
    }
    if (fundingSource === 'external') await press(tree, 'External bank account');
    await enterAmount(tree, `Amount to deposit in ${currency}`, String(amount));
    await press(tree, `${tenor} months`);

    expect(futureGainAvailableBalance(context, currency)).toBe(availableBalance);
    expectFormError(tree, '');
    assertMoneyFact(tree, 'Amount', amount, currency);
    expect(fact(tree, 'Tenor').props.value).toBe(`${tenor} months`);
    expect(fact(tree, 'Fixed NKS (Nominal interest rate)').props.value).toBe(
      `${expected.rates.nominal.toLocaleString('sr-RS', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%`,
    );
    expect(fact(tree, 'EKS (Effective interest rate)').props.value).toBe(
      `${(expected.rates.effective * tenor / 12).toLocaleString('sr-RS', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
    );
    const averageFunds = opportunityAmount(tree, expected.averageUninvestedFunds, currency);
    expect(averageFunds.color).toBe(screenHost.tokens.text);
    expect(averageFunds.prefix ?? '').toBe('');
    const potentialYield = opportunityAmount(tree, expected.potentialYield, currency);
    expect(potentialYield.color).toBe(sourceColor('var(--uc-investment-reference-positive, #3D7D43)', false));
    expect(potentialYield.prefix).toBe('+');
    expect(potentialYield.align).toBe('right');
    assertMoneyFact(tree, 'Total deposit amount and gross interest at maturity', expected.grossMaturity, currency);
    assertMoneyFact(tree, 'Tax', expected.tax, currency);
    assertMoneyFact(tree, 'Net deposit amount and interest at maturity', expected.netMaturity, currency);
    expect(tree.root.findByType(Chips).props.items.map((item: { value: number }) => item.value)).toEqual(
      getFutureGainDepositSuggestions(
        fundingSource === 'current' ? availableBalance : EXTERNAL_LIMITS[currency],
        currency,
        fundingSource,
      ),
    );
    expect(pressable(tree, 'Request offer').props.disabled).toBe(false);
  } finally {
    await unmount(tree);
  }
});

const PEER_KINDS: readonly FutureGainPeerSimulatorKind[] = [
  'term-deposit',
  'cash-loan',
  'mortgage',
  'investment-fund',
];
const PEER_PRODUCTS: readonly { kind: FutureGainPeerSimulatorKind; product: FutureGainPeerProduct }[] = PEER_KINDS.map(kind => ({
  kind,
  product: FUTURE_GAIN_PEER_GOALS.flatMap(goal => goal.products).find(item => item.simulator === kind)!,
}));

test.each(PEER_PRODUCTS)('$kind peer illustration matches the canonical Source quote', async ({ kind, product }) => {
  const preset = getFutureGainPeerSimulatorPreset(kind);
  const expected = calculateFutureGainPeerSimulation({
    kind,
    amount: preset.amount,
    currency: 'EUR',
    termMonths: preset.termMonths,
    rateMode: 'combined',
  });
  if (!expected) throw new Error(`Source returned no ${kind} preset quote.`);
  const screenHost = host();
  const tree = await render(
    React.createElement(PeerSimulator, { host: screenHost, product, onBack: screenHost.onBack }),
  );

  try {
    expect(fact(tree, 'Indicative rate').props.value).toBe(`${expected.ratePercent.toFixed(2)}%`);
    const amountLabel = kind === 'term-deposit'
      ? 'Deposit amount'
      : kind === 'investment-fund'
        ? 'Investment amount'
        : 'Loan amount';
    expect(formField(tree, amountLabel).props.value).toBe(String(preset.amount));
    if (preset.termMonths > 0) {
      expect(formField(tree, 'Duration in months').props.value).toBe(String(preset.termMonths));
    }
    if (expected.monthlyPayment !== null) {
      assertMoneyFact(tree, 'Monthly installment', expected.monthlyPayment, 'EUR');
      if (expected.monthlyPaymentAfterFixedPeriod !== null) {
        assertMoneyFact(tree, 'After 60 months', expected.monthlyPaymentAfterFixedPeriod, 'EUR');
      }
    }
    if (expected.estimatedReturn !== null) {
      assertMoneyFact(tree, 'Estimated return', expected.estimatedReturn, 'EUR');
    }
    const totalLabel = expected.monthlyPayment !== null
      ? 'Total principal + interest'
      : 'Estimated amount at maturity';
    assertMoneyFact(tree, totalLabel, expected.totalAmount ?? 0, 'EUR');
  } finally {
    await unmount(tree);
  }
});
