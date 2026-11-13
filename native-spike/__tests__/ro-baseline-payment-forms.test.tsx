import React from 'react';
import { ScrollView } from 'react-native';
import Renderer, { act } from 'react-test-renderer';
import type { RoBaselinePaymentKind } from '../../src/features/accounts-payments/currentPaymentPolicy';
import { getRoBaselineBillProviders } from '../../src/features/accounts-payments/currentPaymentPolicy';
import {
  createCurrentTranslator,
  currentTokens,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { RoBaselinePaymentFormFlow } from '../src/experiences/pi/current/baseline/payments/forms/RoBaselinePaymentFlow';
import { FaceIdOverlay } from '../src/experiences/pi/current/baseline/FaceIdOverlay';
import { RoBaselinePaymentsScreen } from '../src/experiences/pi/current/baseline/payments/hub/Payments';
import { BaselinePaymentHero } from '../src/universal/BaselinePaymentHero';
import { BaselineAmountField } from '../src/universal/BaselineAmountField';
import { BaselineTextField } from '../src/universal/BaselineTextField';
import { BaselinePageHeader } from '../src/universal/BaselinePageHeader';
import { DateField } from '../src/universal/DateField';
import { PrimaryButton } from '../src/universal/PrimaryButton';
import { SourceCustomIcon } from '../src/universal/SourceCustomIcon';
import { ToggleButton } from '../src/universal/ToggleButton';

const counts = {
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

function host(): CurrentScreenProps {
  return {
    country: 'RO',
    release: 'release-current',
    scenario: 'active',
    language: 'en',
    productCounts: counts,
    route: { screen: 'payments' },
    tokens: currentTokens(),
    t: createCurrentTranslator('RO', 'en'),
    amountsHidden: false,
    screenTopInset: 0,
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

function mount(
  kind: RoBaselinePaymentKind,
  providerId?: string,
  onComplete: jest.Mock = jest.fn(),
) {
  let tree!: Renderer.ReactTestRenderer;
  const provider = providerId
    ? getRoBaselineBillProviders().find(item => item.id === providerId)
    : undefined;
  act(() => {
    tree = Renderer.create(
      <RoBaselinePaymentFormFlow
        host={host()}
        kind={kind}
        provider={provider}
        onBack={jest.fn()}
        onComplete={onComplete}
      />,
    );
  });
  return tree;
}

function textField(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root
    .findAllByType(BaselineTextField)
    .filter(field => field.props.label === label)
    .at(-1)!;
}

function amountField(tree: Renderer.ReactTestRenderer) {
  return tree.root.findByType(BaselineAmountField);
}

function nextButton(tree: Renderer.ReactTestRenderer) {
  return tree.root
    .findAllByType(PrimaryButton)
    .find(button => button.props.label === 'Next')!;
}

function mountHub() {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<RoBaselinePaymentsScreen {...host()} />);
  });
  return tree;
}

function pressHub(tree: Renderer.ReactTestRenderer, label: string) {
  const target = tree.root.find(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  );
  act(() => target.props.onPress());
}

it('shows the screenshot-specific controls for Currency Exchange, Treasury, own transfer and Standing Order', () => {
  const exchange = mount('currency-exchange');
  try {
    expect(
      exchange.root.findByProps({
        testID: 'ro-payment-form-currency-exchange',
      }),
    ).toBeTruthy();
    expect(JSON.stringify(exchange.toJSON())).toContain('1 EUR = 5.4200 RON');
    const accountSelectors = exchange.root
      .findAllByType(BaselineTextField)
      .filter(field => field.props.label === 'ACCOUNT NUMBER');
    expect(accountSelectors).toHaveLength(2);
    expect(accountSelectors[0]?.props.trailingIconName).toBe(
      'chevron-down-wide',
    );
    expect(accountSelectors[0]?.props.trailingIconPlacement).toBe('floating');
    expect(accountSelectors[0]?.props.selectionControl).toBeDefined();
    expect(accountSelectors[0]?.props.helperText2).toContain('RON');
    expect(
      exchange.root
        .findAllByType(DateField)
        .some(field => field.props.label === 'PAYMENT PROCESSING DATE'),
    ).toBe(true);
    expect(
      exchange.root
        .findAllByType(BaselineTextField)
        .some(field => field.props.label === 'Payment details'),
    ).toBe(true);
  } finally {
    act(() => exchange.unmount());
  }

  const treasury = mount('treasury-payment');
  try {
    expect(
      treasury.root
        .findAllByType(ToggleButton)
        .some(toggle => toggle.props.ariaLabel === 'PROCESSING METHOD URGENT'),
    ).toBe(true);
    expect(
      treasury.root
        .findAllByType(BaselineTextField)
        .some(field => field.props.label === 'Fiscal code / CNP'),
    ).toBe(true);
    act(() =>
      treasury.root
        .find(node => node.props.accessibilityLabel === 'SHOW MORE DETAILS')
        .props.onPress(),
    );
    expect(
      treasury.root
        .findAllByType(BaselineTextField)
        .some(
          field => field.props.label === 'Payment reference no (ANAF code)',
        ),
    ).toBe(true);
  } finally {
    act(() => treasury.unmount());
  }

  const transfer = mount('own-account-transfer');
  try {
    expect(
      transfer.root
        .findAllByType(ToggleButton)
        .find(toggle => toggle.props.ariaLabel === 'INSTANT PAYMENT')?.props
        .checked,
    ).toBe(true);
  } finally {
    act(() => transfer.unmount());
  }

  const standing = mount('standing-order');
  try {
    expect(
      standing.root
        .findAllByType(ToggleButton)
        .some(toggle => toggle.props.ariaLabel === 'Sweeping mode'),
    ).toBe(true);
    expect(
      standing.root
        .findAllByType(BaselineTextField)
        .some(field => field.props.label === 'Order no. / E2E reference'),
    ).toBe(true);
  } finally {
    act(() => standing.unmount());
  }
});

it('keeps the source Foreign Payment heading and shared review footer', () => {
  const tree = mount('foreign-payment');
  try {
    const rendered = JSON.stringify(tree.toJSON());
    expect(rendered).toContain('Foreign payment');
    expect(rendered).not.toContain('New beneficiary');
    expect(rendered).toContain(
      'You can review and sign your payment in the next step',
    );
    expect(
      tree.root.findAllByType(ScrollView)[0]?.props
        .showsVerticalScrollIndicator,
    ).toBe(false);
  } finally {
    act(() => tree.unmount());
  }
});

it('uses source radio and calendar icons in payment selectors', () => {
  const tree = mount('foreign-payment');
  try {
    const addressType = tree.root.find(
      node =>
        node.props.accessibilityLabel?.startsWith('ADDRESS TYPE:') &&
        typeof node.props.onPress === 'function',
    );
    act(() => addressType.props.onPress());
    const rendered = JSON.stringify(tree.toJSON());
    expect(rendered).toContain('CHOOSE ONE OPTION');
    expect(rendered).toContain(
      'The full address will be entered in a single field',
    );
    expect(
      tree.root
        .findAllByType(SourceCustomIcon)
        .some(icon => icon.props.name === 'radio-selected'),
    ).toBe(true);
    expect(
      tree.root
        .findAllByType(SourceCustomIcon)
        .some(icon => icon.props.name === 'close-x'),
    ).toBe(true);
  } finally {
    act(() => tree.unmount());
  }

  const exchange = mount('currency-exchange');
  try {
    const date = exchange.root.findByType(DateField);
    expect(date.props.calendarIcon.type).toBe(SourceCustomIcon);
    expect(date.props.calendarIcon.props.name).toBe('insurance-calendar');
  } finally {
    act(() => exchange.unmount());
  }
});

it.each([
  'foreign-payment',
  'currency-exchange',
  'treasury-payment',
  'own-account-transfer',
  'standing-order',
  'direct-debit',
] as const)('centers the %s title in the header after scrolling', kind => {
  const tree = mount(kind);
  try {
    expect(
      tree.root.findByType(BaselinePageHeader).props.collapsedTitleProgress,
    ).toBe(0);
    const scrollView = tree.root.findAllByType(ScrollView)[0]!;
    expect(scrollView.props.showsVerticalScrollIndicator).toBe(false);
    act(() =>
      scrollView.props.onScroll({
        nativeEvent: { contentOffset: { y: 48 } },
      }),
    );
    expect(
      tree.root.findByType(BaselinePageHeader).props.collapsedTitleProgress,
    ).toBe(1);
  } finally {
    act(() => tree.unmount());
  }
});

it('keeps Foreign Payment Next disabled until beneficiary and amount are complete, then opens review and sign', () => {
  const onComplete = jest.fn();
  const tree = mount('foreign-payment', undefined, onComplete);
  try {
    expect(nextButton(tree).props.disabled).toBe(true);
    act(() => textField(tree, 'Name').props.onChange('Mihai Popescu'));
    act(() =>
      textField(tree, 'ACCOUNT NUMBER').props.onChange(
        'DE89370400440532013000',
      ),
    );
    act(() => amountField(tree).props.onChange('25,50'));
    expect(nextButton(tree).props.disabled).toBe(false);
    act(() => nextButton(tree).props.onPress());
    expect(
      tree.root
        .findAllByType(PrimaryButton)
        .some(button => button.props.label === 'Sign'),
    ).toBe(true);
    act(() =>
      tree.root
        .findAllByType(PrimaryButton)
        .find(button => button.props.label === 'Sign')!
        .props.onPress(),
    );
    expect(tree.root.findByProps({ testID: 'ro-payment-sign' })).toBeTruthy();
    act(() =>
      tree.root
        .findAllByType(PrimaryButton)
        .find(button => button.props.label === 'Sign')!
        .props.onPress(),
    );
    act(() => tree.root.findByType(FaceIdOverlay).props.onComplete());
    expect(
      tree.root.findByProps({ testID: 'ro-payment-success' }),
    ).toBeTruthy();
    act(() =>
      tree.root
        .findAllByType(PrimaryButton)
        .find(button => button.props.label === 'Ok, got it')!
        .props.onPress(),
    );
    expect(onComplete).toHaveBeenCalledWith(null);
  } finally {
    act(() => tree.unmount());
  }
});

it('only offers same-currency destinations for own-account transfer', () => {
  const tree = mount('own-account-transfer');
  try {
    expect(nextButton(tree).props.disabled).toBe(true);
    const destination = tree.root.find(
      node =>
        node.props.accessibilityLabel?.startsWith('To account:') &&
        typeof node.props.onPress === 'function',
    );
    act(() => destination.props.onPress());
    const destinationLabels = tree.root
      .findAll(node => node.props.accessibilityRole === 'radio')
      .map(node => node.props.accessibilityLabel);
    expect(
      destinationLabels.some(label =>
        String(label).includes('Savings Account'),
      ),
    ).toBe(true);
    expect(destinationLabels.some(label => String(label).includes('EUR'))).toBe(
      false,
    );
  } finally {
    act(() => tree.unmount());
  }
});

it('sweeping Standing Order keeps the entered floor and records only the surplus after signing', () => {
  const onComplete = jest.fn();
  const tree = mount('standing-order', undefined, onComplete);
  try {
    act(() => textField(tree, 'Name').props.onChange('Rent account'));
    act(() =>
      textField(tree, 'ACCOUNT NUMBER').props.onChange(
        'RO24BACX0000000000000012',
      ),
    );
    act(() => amountField(tree).props.onChange('10000'));
    const sweeping = tree.root
      .findAllByType(ToggleButton)
      .find(toggle => toggle.props.ariaLabel === 'Sweeping mode')!;
    act(() => sweeping.props.onToggle(true));
    expect(JSON.stringify(tree.toJSON())).toContain(
      'Minimum balance to retain',
    );
    expect(JSON.stringify(tree.toJSON())).toContain('Transferable surplus:');
    expect(JSON.stringify(tree.toJSON())).toContain('10614.83');
    expect(JSON.stringify(tree.toJSON())).toContain('RON');
    expect(nextButton(tree).props.disabled).toBe(false);
    act(() => nextButton(tree).props.onPress());
    expect(JSON.stringify(tree.toJSON())).toContain('Minimum balance retained');
    expect(JSON.stringify(tree.toJSON())).toContain('10614.83 RON');
    act(() =>
      tree.root
        .findAllByType(PrimaryButton)
        .find(button => button.props.label === 'Sign')!
        .props.onPress(),
    );
    act(() =>
      tree.root
        .findAllByType(PrimaryButton)
        .find(button => button.props.label === 'Sign')!
        .props.onPress(),
    );
    act(() => tree.root.findByType(FaceIdOverlay).props.onComplete());
    act(() =>
      tree.root
        .findAllByType(PrimaryButton)
        .find(button => button.props.label === 'Ok, got it')!
        .props.onPress(),
    );
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'standing-order',
        name: 'Rent account',
        amount: 10614.83,
        schedule: expect.objectContaining({ repeat: 'monthly' }),
      }),
    );
  } finally {
    act(() => tree.unmount());
  }
});

it('switches Foreign Payment address modes without clearing entered address parts', () => {
  const tree = mount('foreign-payment');
  try {
    const addressPicker = () =>
      tree.root.find(
        node =>
          node.props.accessibilityLabel?.startsWith('ADDRESS TYPE:') &&
          typeof node.props.onPress === 'function',
      );
    const selectMode = (mode: string) => {
      act(() => addressPicker().props.onPress());
      act(() =>
        tree.root
          .find(
            node =>
              node.props.accessibilityRole === 'radio' &&
              node.props.accessibilityLabel === mode,
          )
          .props.onPress(),
      );
      expect(
        tree.root
          .findAllByType(PrimaryButton)
          .some(button => button.props.label === 'Apply'),
      ).toBe(true);
      act(() =>
        tree.root
          .findAllByType(PrimaryButton)
          .find(button => button.props.label === 'Apply')!
          .props.onPress(),
      );
    };

    act(() => addressPicker().props.onPress());
    act(() =>
      tree.root
        .find(
          node =>
            node.props.accessibilityRole === 'radio' &&
            node.props.accessibilityLabel === 'STRUCTURED',
        )
        .props.onPress(),
    );
    expect(
      tree.root
        .findAllByType(PrimaryButton)
        .some(button => button.props.label === 'Apply'),
    ).toBe(true);
    expect(
      tree.root
        .findAllByType(BaselineTextField)
        .some(field => field.props.label === 'COUNTRY'),
    ).toBe(false);
    act(() =>
      tree.root
        .findAllByType(PrimaryButton)
        .find(button => button.props.label === 'Apply')!
        .props.onPress(),
    );
    expect(
      tree.root
        .findAllByType(BaselineTextField)
        .some(field => field.props.label === 'COUNTRY'),
    ).toBe(true);
    act(() => textField(tree, 'COUNTRY').props.onChange('Romania'));
    act(() => textField(tree, 'CITY').props.onChange('Bucuresti'));
    act(() => textField(tree, 'STREET').props.onChange('Calea Victoriei 35'));
    act(() => textField(tree, 'POSTAL CODE').props.onChange('010061'));
    selectMode('HYBRID');
    expect(textField(tree, 'COUNTRY').props.value).toBe('Romania');
    expect(textField(tree, 'CITY').props.value).toBe('Bucuresti');
    expect(textField(tree, 'STREET AND NUMBER').props.value).toBe(
      'Calea Victoriei 35',
    );
    act(() =>
      textField(tree, 'ADDITIONAL ADDRESS DETAILS').props.onChange('Sector 1'),
    );
    selectMode('UNSTRUCTURED');
    selectMode('HYBRID');
    expect(textField(tree, 'ADDITIONAL ADDRESS DETAILS').props.value).toBe(
      'Sector 1',
    );
  } finally {
    act(() => tree.unmount());
  }
});

it('requires Direct Debit terms consent and offers the screenshot limit presets', () => {
  const onComplete = jest.fn();
  const tree = mount(
    'direct-debit',
    'orange-romania-communications',
    onComplete,
  );
  try {
    expect(nextButton(tree).props.disabled).toBe(true);
    act(() =>
      tree.root
        .find(node => node.props.accessibilityLabel === '200 RON')
        .props.onPress(),
    );
    expect(nextButton(tree).props.disabled).toBe(true);
    const agreement = tree.root
      .findAllByType(ToggleButton)
      .find(
        toggle =>
          toggle.props.ariaLabel === 'I AGREE WITH TERMS AND CONDITIONS',
      )!;
    act(() => agreement.props.onToggle(true));
    expect(nextButton(tree).props.disabled).toBe(false);
    expect(JSON.stringify(tree.toJSON())).toContain('200 RON');
    act(() => nextButton(tree).props.onPress());
    act(() =>
      tree.root
        .findAllByType(PrimaryButton)
        .find(button => button.props.label === 'Sign')!
        .props.onPress(),
    );
    act(() =>
      tree.root
        .findAllByType(PrimaryButton)
        .find(button => button.props.label === 'Sign')!
        .props.onPress(),
    );
    act(() => tree.root.findByType(FaceIdOverlay).props.onComplete());
    expect(
      tree.root.findByProps({ testID: 'ro-payment-success' }),
    ).toBeTruthy();
    act(() =>
      tree.root
        .findAllByType(PrimaryButton)
        .find(button => button.props.label === 'Ok, got it')!
        .props.onPress(),
    );
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'direct-debit',
        name: 'ORANGE ROMANIA (COMMUNICATIONS)',
        amount: 200,
        isLimit: true,
      }),
    );
  } finally {
    act(() => tree.unmount());
  }
});

it('routes the Romanian hub to Exchange, Foreign, Treasury, own transfer and Standing Order', () => {
  const choices = [
    {
      heroId: 'between-accounts',
      action: 'CURRENCY EXCHANGE Currency exchange between your accounts',
      kind: 'currency-exchange',
    },
    {
      heroId: 'new-payment',
      action: 'FOREIGN PAYMENTS Make a foreign or SEPA payment',
      kind: 'foreign-payment',
    },
    {
      heroId: 'new-payment',
      action: 'TREASURY PAYMENT Make a budget payment',
      kind: 'treasury-payment',
    },
    {
      heroId: 'new-payment',
      action: 'TRANSFER BETWEEN YOUR OWN ACCOUNTS Same currency transfer only',
      kind: 'own-account-transfer',
    },
  ] as const;
  for (const choice of choices) {
    const tree = mountHub();
    try {
      const hero = tree.root
        .findAllByType(BaselinePaymentHero)
        .find(node => node.props.item.id === choice.heroId)!;
      act(() => hero.props.onSelect());
      pressHub(tree, choice.action);
      expect(
        tree.root.findByProps({ testID: `ro-payment-form-${choice.kind}` }),
      ).toBeTruthy();
    } finally {
      act(() => tree.unmount());
    }
  }
  const tree = mountHub();
  try {
    pressHub(tree, 'Recurrent Payments');
    expect(
      tree.root.findByProps({ testID: 'ro-payment-form-standing-order' }),
    ).toBeTruthy();
  } finally {
    act(() => tree.unmount());
  }
});

it('filters the provider list and prefills the selected Orange Romania details', () => {
  const tree = mountHub();
  try {
    const bills = tree.root
      .findAllByType(BaselinePaymentHero)
      .find(node => node.props.item.id === 'manage-ebills')!;
    act(() => bills.props.onSelect());
    pressHub(
      tree,
      'DIRECT DEBIT Create and manage your intrabank Direct Debit mandates',
    );
    expect(JSON.stringify(tree.toJSON())).toContain('No Direct Debits yet');
    act(() =>
      tree.root
        .findAllByType(PrimaryButton)
        .find(button => button.props.label === 'Create Direct Debit')!
        .props.onPress(),
    );
    act(() => textField(tree, 'Search').props.onChange('orange'));
    expect(
      tree.root
        .findAll(node => node.props.accessibilityRole === 'button')
        .some(node => node.props.accessibilityLabel === 'DIGI ROMANIA SA'),
    ).toBe(false);
    expect(
      tree.root
        .findAll(node => node.props.accessibilityRole === 'button')
        .some(
          node =>
            node.props.accessibilityLabel === 'ORANGE ROMANIA (COMMUNICATIONS)',
        ),
    ).toBe(true);
    pressHub(tree, 'Back');
    act(() =>
      tree.root
        .findAllByType(PrimaryButton)
        .find(button => button.props.label === 'Create Direct Debit')!
        .props.onPress(),
    );
    pressHub(tree, 'ORANGE ROMANIA (COMMUNICATIONS)');
    expect(textField(tree, 'BENEFICIARY ACCOUNT NUMBER').props.value).toBe(
      'RO24BACX00000000000031313',
    );
    expect(textField(tree, 'BENEFICIARY ADDRESS').props.value).toContain(
      'Calea Victoriei nr. 35',
    );
    expect(textField(tree, 'FISCAL CODE / CNP').props.value).toBe('9010105');
  } finally {
    act(() => tree.unmount());
  }
});

it('saves a signed Direct Debit locally and shows it in the reopened list', () => {
  const values = new Map<string, string>();
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
    },
  });
  const tree = mountHub();
  try {
    const bills = tree.root
      .findAllByType(BaselinePaymentHero)
      .find(node => node.props.item.id === 'manage-ebills')!;
    act(() => bills.props.onSelect());
    pressHub(
      tree,
      'DIRECT DEBIT Create and manage your intrabank Direct Debit mandates',
    );
    act(() =>
      tree.root
        .findAllByType(PrimaryButton)
        .find(button => button.props.label === 'Create Direct Debit')!
        .props.onPress(),
    );
    pressHub(tree, 'ORANGE ROMANIA (COMMUNICATIONS)');
    act(() =>
      tree.root
        .find(node => node.props.accessibilityLabel === '200 RON')
        .props.onPress(),
    );
    const agreement = tree.root
      .findAllByType(ToggleButton)
      .find(
        toggle =>
          toggle.props.ariaLabel === 'I AGREE WITH TERMS AND CONDITIONS',
      )!;
    act(() => agreement.props.onToggle(true));
    act(() =>
      tree.root
        .findAllByType(PrimaryButton)
        .find(button => button.props.label === 'Next')!
        .props.onPress(),
    );
    act(() =>
      tree.root
        .findAllByType(PrimaryButton)
        .find(button => button.props.label === 'Sign')!
        .props.onPress(),
    );
    act(() =>
      tree.root
        .findAllByType(PrimaryButton)
        .find(button => button.props.label === 'Sign')!
        .props.onPress(),
    );
    act(() => tree.root.findByType(FaceIdOverlay).props.onComplete());
    act(() =>
      tree.root
        .findAllByType(PrimaryButton)
        .find(button => button.props.label === 'Ok, got it')!
        .props.onPress(),
    );
    const reopenedBills = tree.root
      .findAllByType(BaselinePaymentHero)
      .find(node => node.props.item.id === 'manage-ebills')!;
    act(() => reopenedBills.props.onSelect());
    pressHub(
      tree,
      'DIRECT DEBIT Create and manage your intrabank Direct Debit mandates',
    );
    expect(JSON.stringify(tree.toJSON())).toContain(
      'ORANGE ROMANIA (COMMUNICATIONS)',
    );
    expect(JSON.stringify(tree.toJSON())).toContain('Limit 200 RON');
  } finally {
    act(() => tree.unmount());
    if (originalWindow)
      Object.defineProperty(globalThis, 'window', originalWindow);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});

it.each(['foreign-payment', 'standing-order', 'treasury-payment', 'own-account-transfer', 'currency-exchange', 'direct-debit'] as const)('uses baseline calendar controls for all %s dates', kind => {
  const tree = mount(kind);
  const fields = tree.root.findAllByType(DateField);
  expect(fields.length).toBeGreaterThan(0);
  for (const field of fields) {
    expect(field.props.openCalendarOnFieldPress).toBe(true);
    expect(field.props.calendarIcon.props.name).toBe('insurance-calendar');
    expect(field.props.calendarIcon.props.size).toBe(32);
  }
  act(() => tree.unmount());
});
