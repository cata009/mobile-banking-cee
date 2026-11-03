import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Image, Platform, StyleSheet } from 'react-native';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import { BaselineDialog } from '../src/universal/BaselineDialog';
import { BaselineBottomSheet } from '../src/universal/BaselineBottomSheet';
import { BaselineDropdownField } from '../src/universal/BaselineDropdownField';
import { BaselineMoreCard } from '../src/universal/BaselineMoreCard';
import { BaselineNavigationRow } from '../src/universal/BaselineNavigationRow';
import { BaselineTextField } from '../src/universal/BaselineTextField';
import { DateField } from '../src/universal/DateField';
import { ModalPortal } from '../src/universal/ModalPortal';
import { SETTINGS_SECTIONS } from '@/app/config/settingsConfig';
import More, {
  RoMoreCard,
} from '../src/experiences/pi/current/baseline/more/More';
import Settings from '../src/experiences/pi/current/baseline/more/Settings';
import Tutorials from '../src/experiences/pi/current/baseline/more/Tutorials';
import { moreAssets } from '../src/experiences/pi/current/profile/assets';
import { resolveMoreCard } from '@/app/components/contracts/moreCard';
import {
  DuoContentViewport,
  DuoPreviewProvider,
} from '../src/universal/DuoPreview';

function host(language: 'en' | 'ro' = 'en'): CurrentScreenProps {
  return {
    country: 'RO',
    release: 'release-current',
    scenario: 'active',
    language,
    productCounts: {
      accounts: 2,
      debitCards: 2,
      creditCards: 1,
      mealCards: 0,
      deposits: 1,
      savingsAccounts: 1,
      loans: 1,
      mortgages: 1,
      investments: 1,
    },
    route: { screen: 'profile' },
    tokens: currentTokens(),
    t: createCurrentTranslator('RO', language),
    amountsHidden: false,
    screenTopInset: 12,
    isActive: true,
    mode: 'light',
    onNavigate: jest.fn(),
    onBack: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    onModeChange: jest.fn(),
    onPrimaryNavigationChange: jest.fn(),
    onBackHandlerChange: jest.fn(),
  };
}
function button(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(node => node.props.accessibilityLabel === label)[0]!;
}
function mount(props = host()) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<More {...props} />);
  });
  return tree;
}

it('renders baseline Settings item titles in uppercase while preserving descriptions', () => {
  const h = host();
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<Settings {...h} />);
  });
  try {
    const expectedTitles = SETTINGS_SECTIONS.flatMap(section =>
      section.items.map(item =>
        h
          .t(`runtime.settings.items.${item.id}.title`, item.title)
          .toUpperCase(),
      ),
    );
    const rows = tree.root.findAllByType(BaselineNavigationRow);
    expect(rows.map(row => row.props.title)).toEqual(expectedTitles);
    expect(rows[0]?.props.description).not.toBe(rows[0]?.props.title);
  } finally {
    act(() => tree.unmount());
  }
});

it.each([
  'contacts',
  'documents',
  'settings',
  'tutorial',
  'digital-activities',
  'my-requests',
  'third-party-consent',
] as const)(
  'keeps the %s illustration proportionate and anchored on the wide Duo card',
  variant => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    let tree!: Renderer.ReactTestRenderer;
    try {
      act(() => {
        tree = Renderer.create(
          <DuoPreviewProvider
            value={{
              width: 951,
              height: 669,
              rightInset: 84,
              referenceWidth: 375,
            }}
          >
            <DuoContentViewport screen="profile">
              <RoMoreCard
                card={variant}
                title={variant}
                width={256.5}
                dark={false}
                onPress={jest.fn()}
              />
            </DuoContentViewport>
          </DuoPreviewProvider>,
        );
      });
      const frame = StyleSheet.flatten(
        tree.root.findByProps({ testID: `ro-more-art-${variant}` }).props.style,
      );
      const source = resolveMoreCard({ variant }).image;
      expect(frame.right).toBeCloseTo((parseFloat(source.right) / 100) * 155.5);
      expect(frame.bottom).toBeCloseTo((parseFloat(source.bottom) / 100) * 120);
      expect(frame.width).toBeCloseTo(
        (1 - (parseFloat(source.left) + parseFloat(source.right)) / 100) *
          155.5,
      );
      expect(frame.height).toBeCloseTo(
        (1 - (parseFloat(source.top) + parseFloat(source.bottom)) / 100) * 120,
      );
      const image = tree.root.findAllByType('img' as never)[0]!;
      expect(image.props.style).toMatchObject({
        objectFit: 'contain',
        objectPosition: 'right bottom',
      });
    } finally {
      if (tree) act(() => tree.unmount());
      Object.defineProperty(Platform, 'OS', {
        configurable: true,
        value: originalOS,
      });
    }
  },
);

it('anchors the GDPR repeating artwork to the original right and bottom offsets on wide Duo', () => {
  const originalOS = Platform.OS;
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
  let tree!: Renderer.ReactTestRenderer;
  try {
    act(() => {
      tree = Renderer.create(
        <DuoPreviewProvider
          value={{
            width: 951,
            height: 669,
            rightInset: 84,
            referenceWidth: 375,
          }}
        >
          <DuoContentViewport screen="profile">
            <RoMoreCard
              card="gdpr-consent"
              title="GDPR"
              width={256.5}
              dark={false}
              onPress={jest.fn()}
            />
          </DuoContentViewport>
        </DuoPreviewProvider>,
      );
    });
    const frame = tree.root.findByProps({
      'data-testid': 'ro-more-art-gdpr-consent',
    }).props.style;
    const source = resolveMoreCard({ variant: 'gdpr-consent' }).image;
    expect(frame.right).toBeCloseTo((parseFloat(source.right) / 100) * 155.5);
    expect(frame.bottom).toBeCloseTo((parseFloat(source.bottom) / 100) * 120);
    expect(frame.backgroundSize).toBe(
      '61.60000091791153px 62.90000093728304px',
    );
  } finally {
    if (tree) act(() => tree.unmount());
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: originalOS,
    });
  }
});

it('adds Contract withdrawal before Tutorials in RO and preserves the document badge and implemented routes', () => {
  const h = host(),
    tree = mount(h);
  try {
    const cards = tree.root.findAllByType(RoMoreCard);
    expect(cards.map(node => node.props.card)).toEqual([
      'contacts',
      'documents',
      'settings',
      'gdpr-consent',
      'my-requests',
      'tutorial',
    ]);
    const contractWithdrawal = tree.root
      .findAllByType(BaselineMoreCard)
      .find(card => card.props.variant === 'my-requests')!;
    expect(contractWithdrawal.props.title).toBe('Contract withdrawal');
    expect(contractWithdrawal.findByType(Image).props.source).toBe(
      moreAssets['my-requests'],
    );
    expect(
      tree.root.findByProps({ testID: 'ro-more-documents-badge' }).props
        .children,
    ).toBe(8);
    expect(
      StyleSheet.flatten(
        tree.root.findByProps({ testID: 'ro-more-top-reserve' }).props.style,
      ).height,
    ).toBe(54);
    act(() => button(tree, 'Profile').props.onPress?.());
    act(() => cards[3].props.onPress());
    expect(h.onNavigate).not.toHaveBeenCalled();
    for (const card of cards.slice(0, 3)) act(() => card.props.onPress());
    act(() => button(tree, 'Messages').props.onPress());
    expect(h.onNavigate).toHaveBeenNthCalledWith(1, { screen: 'contacts' });
    expect(h.onNavigate).toHaveBeenNthCalledWith(2, { screen: 'documents' });
    expect(h.onNavigate).toHaveBeenNthCalledWith(3, { screen: 'settings' });
    expect(h.onNavigate).toHaveBeenNthCalledWith(4, { screen: 'messages' });
  } finally {
    act(() => tree.unmount());
  }
});

it('localizes the Romanian Contract withdrawal card title', () => {
  const tree = mount(host('ro'));
  try {
    const card = tree.root
      .findAllByType(RoMoreCard)
      .find(node => node.props.card === 'my-requests');
    expect(card?.props.title).toBe('Retragerea contractului');
  } finally {
    act(() => tree.unmount());
  }
});

it('opens the contract-withdrawal intro from the RO More card and hides primary navigation', () => {
  const h = host(),
    tree = mount(h);
  try {
    const card = tree.root
      .findAllByType(BaselineMoreCard)
      .find(node => node.props.variant === 'my-requests')!;
    act(() => card.props.onPress());
    expect(tree.root.findAllByType(ModalPortal)).toHaveLength(1);
    const sheet = tree.root.findByType(BaselineBottomSheet);
    expect(sheet.props.width).toBeGreaterThan(0);
    expect(sheet.props.height).toBeGreaterThan(0);
    expect(sheet.props.maxHeightOffsetPx).toBeGreaterThanOrEqual(64);
    expect(sheet.props.footer).toBeDefined();
    expect(
      tree.root.findByProps({ testID: 'contract-withdrawal-flow' }),
    ).toBeDefined();
    expect(h.onPrimaryNavigationChange).toHaveBeenLastCalledWith(false);
    act(() => button(tree, 'Initiate cancellation request').props.onPress());
    expect(
      tree.root.findByProps({ testID: 'contract-withdrawal-step-source' }),
    ).toBeDefined();
    expect(
      tree.root
        .findAllByType(BaselineNavigationRow)
        .map(row => row.props.title),
    ).toContain('UNICREDIT CONSUMER FINANCING');
  } finally {
    act(() => tree.unmount());
  }
});

it('localizes the contract-withdrawal flow in Romanian', () => {
  const h = host('ro'),
    tree = mount(h);
  try {
    const card = tree.root
      .findAllByType(BaselineMoreCard)
      .find(node => node.props.variant === 'my-requests')!;
    act(() => card.props.onPress());
    expect(button(tree, 'Inițiază cererea de retragere')).toBeDefined();
    act(() => button(tree, 'Inițiază cererea de retragere').props.onPress());
    expect(
      tree.root.findByProps({ testID: 'contract-withdrawal-step-source' }),
    ).toBeDefined();
    expect(
      tree.root.findAll(node =>
        node.children?.includes('De la ce entitate ai obținut produsul?'),
      ).length,
    ).toBeGreaterThan(0);
  } finally {
    act(() => tree.unmount());
  }
});

it('keeps the existing My requests card inert outside RO', () => {
  const h = { ...host(), country: 'CZ' as const },
    tree = mount(h);
  try {
    const card = tree.root
      .findAllByType(BaselineMoreCard)
      .find(node => node.props.variant === 'my-requests')!;
    act(() => card.props.onPress());
    expect(
      tree.root.findAll(
        node => node.props.testID === 'contract-withdrawal-flow',
      ),
    ).toHaveLength(0);
    expect(h.onNavigate).not.toHaveBeenCalled();
  } finally {
    act(() => tree.unmount());
  }
});

it('routes a UniCredit Bank single product into its product list and back', () => {
  const tree = mount();
  try {
    const card = tree.root
      .findAllByType(BaselineMoreCard)
      .find(node => node.props.variant === 'my-requests')!;
    act(() => card.props.onPress());
    act(() => button(tree, 'Initiate cancellation request').props.onPress());
    const bank = tree.root
      .findAllByType(BaselineNavigationRow)
      .find(row => row.props.title === 'UNICREDIT BANK');
    expect(bank).toBeDefined();
    act(() => bank?.props.onPress());
    const kindLabels = tree.root
      .findAllByType(BaselineNavigationRow)
      .map(row => row.props.title);
    expect(kindLabels).toEqual(
      expect.arrayContaining(['SINGLE PRODUCT', 'PACKAGE']),
    );
    const single = tree.root
      .findAllByType(BaselineNavigationRow)
      .find(row => row.props.title === 'SINGLE PRODUCT');
    expect(single).toBeDefined();
    act(() => single?.props.onPress());
    const productLabels = tree.root
      .findAllByType(BaselineNavigationRow)
      .map(row => row.props.title);
    expect(productLabels).toContain('CURRENT ACCOUNT');
    expect(productLabels).toContain('DEBIT CARD');
    const currentAccount = tree.root
      .findAllByType(BaselineNavigationRow)
      .find(row => row.props.title === 'CURRENT ACCOUNT');
    act(() => currentAccount?.props.onPress());
    expect(
      tree.root.findByProps({
        testID: 'contract-withdrawal-step-product-details',
      }),
    ).toBeDefined();

    act(() => button(tree, 'Back').props.onPress());
    expect(
      tree.root.findByProps({
        testID: 'contract-withdrawal-step-product-selection',
      }),
    ).toBeDefined();
    act(() => button(tree, 'Back').props.onPress());
    expect(
      tree.root.findByProps({
        testID: 'contract-withdrawal-step-product-kind',
      }),
    ).toBeDefined();
    expect(
      tree.root
        .findAllByType(BaselineNavigationRow)
        .map(row => row.props.title),
    ).toContain('PACKAGE');
  } finally {
    act(() => tree.unmount());
  }
});

it('routes the UniCredit Bank package choice directly to package details', () => {
  const tree = mount();
  try {
    const card = tree.root
      .findAllByType(BaselineMoreCard)
      .find(node => node.props.variant === 'my-requests')!;
    act(() => card.props.onPress());
    act(() => button(tree, 'Initiate cancellation request').props.onPress());
    const bank = tree.root
      .findAllByType(BaselineNavigationRow)
      .find(row => row.props.title === 'UNICREDIT BANK');
    act(() => bank?.props.onPress());
    const packageChoice = tree.root
      .findAllByType(BaselineNavigationRow)
      .find(row => row.props.title === 'PACKAGE');
    act(() => packageChoice?.props.onPress());
    expect(
      tree.root.findByProps({
        testID: 'contract-withdrawal-step-product-details',
      }),
    ).toBeDefined();
  } finally {
    act(() => tree.unmount());
  }
});

it('routes Consumer Financing to credit card, cash loan, and life insurance products', () => {
  const tree = mount();
  try {
    const card = tree.root
      .findAllByType(BaselineMoreCard)
      .find(node => node.props.variant === 'my-requests')!;
    act(() => card.props.onPress());
    act(() => button(tree, 'Initiate cancellation request').props.onPress());
    const ucfin = tree.root
      .findAllByType(BaselineNavigationRow)
      .find(row => row.props.title === 'UNICREDIT CONSUMER FINANCING');
    expect(ucfin).toBeDefined();
    act(() => ucfin?.props.onPress());
    const productLabels = tree.root
      .findAllByType(BaselineNavigationRow)
      .map(row => row.props.title);
    expect(productLabels).toEqual([
      'CREDIT CARD',
      'CASH LOAN',
      'CREDIT LIFE INSURANCE',
    ]);
    const cashLoan = tree.root
      .findAllByType(BaselineNavigationRow)
      .find(row => row.props.title === 'CASH LOAN');
    act(() => cashLoan?.props.onPress());
    expect(
      tree.root.findByProps({
        testID: 'contract-withdrawal-step-product-details',
      }),
    ).toBeDefined();
  } finally {
    act(() => tree.unmount());
  }
});

it('takes the UniCredit Bank package through the shared contact and review steps', () => {
  const tree = mount();
  try {
    const card = tree.root
      .findAllByType(BaselineMoreCard)
      .find(node => node.props.variant === 'my-requests')!;
    act(() => card.props.onPress());
    act(() => button(tree, 'Initiate cancellation request').props.onPress());
    const bank = tree.root
      .findAllByType(BaselineNavigationRow)
      .find(row => row.props.title === 'UNICREDIT BANK');
    act(() => bank?.props.onPress());
    const packageChoice = tree.root
      .findAllByType(BaselineNavigationRow)
      .find(row => row.props.title === 'PACKAGE');
    act(() => packageChoice?.props.onPress());

    const dropdowns = tree.root.findAllByType(BaselineDropdownField);
    expect(
      dropdowns.some(field => field.props.label === 'Product identifier'),
    ).toBe(false);
    const channel = dropdowns.find(
      field => field.props.label === 'Product was requested in the channel',
    );
    act(() => tree.root.findByType(DateField).props.onChange('2026-10-20'));
    act(() => channel?.props.onChange('mobile-banking'));
    act(() => button(tree, 'Continue').props.onPress());
    expect(
      tree.root.findByProps({ testID: 'contract-withdrawal-step-contact' }),
    ).toBeDefined();
    act(() => button(tree, 'Continue').props.onPress());
    expect(
      tree.root.findByProps({ testID: 'contract-withdrawal-step-review' }),
    ).toBeDefined();
    expect(
      tree.root.findAll(node => node.children?.includes('PACKAGE')).length,
    ).toBeGreaterThan(0);
  } finally {
    act(() => tree.unmount());
  }
});

it('takes a Consumer Financing cash loan through the shared contact and review steps', () => {
  const tree = mount();
  try {
    const card = tree.root
      .findAllByType(BaselineMoreCard)
      .find(node => node.props.variant === 'my-requests')!;
    act(() => card.props.onPress());
    act(() => button(tree, 'Initiate cancellation request').props.onPress());
    const ucfin = tree.root
      .findAllByType(BaselineNavigationRow)
      .find(row => row.props.title === 'UNICREDIT CONSUMER FINANCING');
    act(() => ucfin?.props.onPress());
    const cashLoan = tree.root
      .findAllByType(BaselineNavigationRow)
      .find(row => row.props.title === 'CASH LOAN');
    act(() => cashLoan?.props.onPress());

    const dropdowns = tree.root.findAllByType(BaselineDropdownField);
    const identifier = dropdowns.find(
      field => field.props.label === 'Product identifier',
    );
    const channel = dropdowns.find(
      field => field.props.label === 'Product was requested in the channel',
    );
    expect(identifier?.props.options[0]?.label).toBe('Credit 50,000 RON');
    act(() => identifier?.props.onChange(identifier.props.options[0]!.value));
    act(() => tree.root.findByType(DateField).props.onChange('2026-10-20'));
    act(() => channel?.props.onChange('mobile-banking'));
    act(() => button(tree, 'Continue').props.onPress());
    expect(
      tree.root.findByProps({ testID: 'contract-withdrawal-step-contact' }),
    ).toBeDefined();
    act(() => button(tree, 'Continue').props.onPress());
    expect(
      tree.root.findByProps({ testID: 'contract-withdrawal-step-review' }),
    ).toBeDefined();
    expect(
      tree.root.findAll(node =>
        node.children?.includes('UniCredit Consumer Financing'),
      ).length,
    ).toBeGreaterThan(0);
    expect(
      tree.root.findAll(node => node.children?.includes('CASH LOAN')).length,
    ).toBeGreaterThan(0);
  } finally {
    act(() => tree.unmount());
  }
});

it('completes the RO single-account request through review, PDF, PIN, and receipt', () => {
  const tree = mount();
  try {
    const card = tree.root
      .findAllByType(BaselineMoreCard)
      .find(node => node.props.variant === 'my-requests')!;
    act(() => card.props.onPress());
    act(() => button(tree, 'Initiate cancellation request').props.onPress());
    const bank = tree.root
      .findAllByType(BaselineNavigationRow)
      .find(row => row.props.title === 'UNICREDIT BANK');
    act(() => bank?.props.onPress());
    const single = tree.root
      .findAllByType(BaselineNavigationRow)
      .find(row => row.props.title === 'SINGLE PRODUCT');
    act(() => single?.props.onPress());
    const currentAccount = tree.root
      .findAllByType(BaselineNavigationRow)
      .find(row => row.props.title === 'CURRENT ACCOUNT');
    act(() => currentAccount?.props.onPress());

    const dropdowns = tree.root.findAllByType(BaselineDropdownField);
    const productIdentifier = dropdowns.find(
      field => field.props.label === 'Product identifier',
    );
    const channel = dropdowns.find(
      field => field.props.label === 'Product was requested in the channel',
    );
    expect(productIdentifier).toBeDefined();
    expect(channel).toBeDefined();
    expect(button(tree, 'Continue').props.accessibilityState.disabled).toBe(
      true,
    );
    expect(tree.root.findByType(DateField).props.separator).toBe('.');
    const selectedProductLabel = productIdentifier!.props.options[0]!.label;
    act(() =>
      productIdentifier?.props.onChange(
        productIdentifier.props.options[0]!.value,
      ),
    );
    const date = tree.root.findByType(DateField);
    act(() => date.props.onChange('2026-10-20'));
    act(() => channel?.props.onChange('mobile-banking'));
    act(() => button(tree, 'Continue').props.onPress());

    expect(
      tree.root.findByProps({ testID: 'contract-withdrawal-step-contact' }),
    ).toBeDefined();
    const email = tree.root
      .findAllByType(BaselineTextField)
      .find(field => field.props.label === 'Your email address');
    act(() => email?.props.onChange('invalid'));
    expect(button(tree, 'Continue').props.accessibilityState.disabled).toBe(
      true,
    );
    act(() => email?.props.onChange('ion.popescu@gmail.com'));
    act(() => button(tree, 'Continue').props.onPress());
    expect(
      tree.root.findByProps({ testID: 'contract-withdrawal-step-review' }),
    ).toBeDefined();
    expect(
      tree.root.findAll(node => node.children?.includes(selectedProductLabel))
        .length,
    ).toBeGreaterThan(0);
    const declaration = tree.root
      .findAllByType(BaselineNavigationRow)
      .find(row => String(row.props.title).startsWith('I NOTIFY THE BANK'));
    expect(declaration).toBeDefined();
    expect(button(tree, 'Confirm').props.accessibilityState.disabled).toBe(
      true,
    );
    act(() => declaration?.props.onToggle(true));
    act(() => button(tree, 'Confirm').props.onPress());
    expect(
      tree.root.findByProps({ testID: 'contract-withdrawal-step-document' }),
    ).toBeDefined();
    expect(
      tree.root.findAll(node => node.children?.includes('PDF DOCUMENT')),
    ).toHaveLength(1);

    act(() => button(tree, 'I agree').props.onPress());
    expect(
      tree.root.findByProps({ testID: 'contract-withdrawal-step-review' }),
    ).toBeDefined();
    act(() => button(tree, 'Confirm').props.onPress());
    expect(
      tree.root.findByProps({ testID: 'contract-withdrawal-step-sign' }),
    ).toBeDefined();
    const pin = tree.root
      .findAllByType(BaselineTextField)
      .find(field => field.props.label === 'Enter pin code');
    expect(pin).toBeDefined();
    expect(button(tree, 'Sign').props.accessibilityState.disabled).toBe(true);
    act(() => pin?.props.onChange('123456'));
    act(() => button(tree, 'Sign').props.onPress());
    expect(
      tree.root.findByProps({ testID: 'contract-withdrawal-step-success' }),
    ).toBeDefined();
    expect(
      tree.root.findAll(node =>
        node.children?.includes(
          'The product cancellation request was successfully submitted',
        ),
      ),
    ).toHaveLength(1);
    act(() => button(tree, 'Ok, I got it').props.onPress());
    expect(
      tree.root.findAll(
        node => node.props.testID === 'contract-withdrawal-flow',
      ),
    ).toHaveLength(0);
  } finally {
    act(() => tree.unmount());
  }
});

it('announces the resolved document count and opens Documents from that button', () => {
  const h = host(),
    tree = mount(h);
  try {
    const badge = tree.root.findByProps({ testID: 'ro-more-documents-badge' });
    const documents = button(tree, `Documents ${badge.props.children}`);
    expect(documents).toBeDefined();
    act(() => documents.props.onPress());
    expect(h.onNavigate).toHaveBeenCalledTimes(1);
    expect(h.onNavigate).toHaveBeenCalledWith({ screen: 'documents' });
    expect(button(tree, 'Contacts')).toBeDefined();
  } finally {
    act(() => tree.unmount());
  }
});

it('cancels logout locally and confirms to active prelogin after restoring navigation', () => {
  const h = host(),
    tree = mount(h);
  try {
    act(() => button(tree, 'Logout').props.onPress());
    expect(h.onPrimaryNavigationChange).toHaveBeenLastCalledWith(false);
    act(() => tree.root.findByType(BaselineDialog).props.onCancel());
    expect(tree.root.findAllByType(BaselineDialog)).toHaveLength(0);
    expect(h.onNavigate).not.toHaveBeenCalled();
    expect(h.onPrimaryNavigationChange).toHaveBeenLastCalledWith(true);
    act(() => button(tree, 'Logout').props.onPress());
    act(() => button(tree, 'Ok, got it').props.onPress());
    expect(tree.root.findAllByType(BaselineDialog)).toHaveLength(0);
    expect(h.onNavigate).toHaveBeenCalledWith({ screen: 'prelogin' });
  } finally {
    act(() => tree.unmount());
  }
});

it('opens all Romanian tutorial topics and resets the selected tutorial after Done', () => {
  const h = host(),
    tree = mount(h);
  try {
    act(() => button(tree, 'Tutorials').props.onPress());
    expect(h.onPrimaryNavigationChange).toHaveBeenLastCalledWith(true);
    expect(
      new Set(
        tree.root
          .findAll(node =>
            node.props.accessibilityLabel?.startsWith('Open tutorial:'),
          )
          .map(node => node.props.accessibilityLabel),
      ).size,
    ).toBe(8);
    act(() =>
      button(
        tree,
        'Open tutorial: HOW TO EXCHANGE CURRENCY AT THE BNR RATE VIA MOBILE BANKING',
      ).props.onPress(),
    );
    expect(button(tree, 'Previous tutorial step').props.disabled).toBe(true);
    expect(
      StyleSheet.flatten(
        tree.root.findAll(
          node =>
            node.props.role === 'dialog' &&
            node.props.accessibilityLabel === 'BNR rate exchange tutorial',
        )[0].props.style,
      ).top,
    ).toBe(12);
    expect(
      tree.root
        .findByProps({ testID: 'ro-tutorial-step' })
        .props.children.join(''),
    ).toBe('Step 1 of 5');
    act(() => button(tree, 'NEXT').props.onPress());
    expect(
      tree.root
        .findByProps({ testID: 'ro-tutorial-step' })
        .props.children.join(''),
    ).toBe('Step 2 of 5');
    act(() => button(tree, 'Previous tutorial step').props.onPress());
    expect(
      tree.root
        .findByProps({ testID: 'ro-tutorial-step' })
        .props.children.join(''),
    ).toBe('Step 1 of 5');
    act(() => button(tree, 'Go to step 5').props.onPress());
    act(() => button(tree, 'DONE').props.onPress());
    expect(tree.root.findAllByType(Tutorials)).toHaveLength(0);
    expect(h.onPrimaryNavigationChange).toHaveBeenLastCalledWith(true);
    act(() => button(tree, 'Tutorials').props.onPress());
    expect(
      button(tree, 'Open tutorial: HOW TO ENROLL CARDS IN APPLE PAY'),
    ).toBeDefined();
    expect(
      tree.root.findAllByProps({ testID: 'ro-tutorial-step' }),
    ).toHaveLength(0);
    expect(h.onNavigate).not.toHaveBeenCalled();
  } finally {
    act(() => tree.unmount());
  }
});

it('consumes host Back to dismiss tutorials and restores navigation on unmount', () => {
  const h = host('ro'),
    tree = mount(h);
  act(() =>
    tree.root
      .findAllByType(RoMoreCard)
      .find(node => node.props.card === 'tutorial')!
      .props.onPress(),
  );
  const back = (h.onBackHandlerChange as jest.Mock).mock.calls.at(-1)![0];
  act(() => {
    expect(back()).toBe(true);
  });
  expect(tree.root.findAllByType(Tutorials)).toHaveLength(0);
  expect(h.onBack).not.toHaveBeenCalled();
  act(() => tree.unmount());
  expect(h.onPrimaryNavigationChange).toHaveBeenLastCalledWith(true);
  expect(h.onBackHandlerChange).toHaveBeenLastCalledWith(null);
});

it.each(['web', 'android'] as const)(
  'keeps the original contact artwork and Source crop on %s',
  platform => {
    const previousPlatform = Platform.OS;
    Platform.OS = platform;
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <RoMoreCard
          card="contacts"
          title="Contacts"
          width={164}
          dark={false}
          onPress={() => {}}
        />,
      );
    });
    try {
      if (platform === 'web') {
        const image = tree.root.findByType('img');
        expect(image.props.src).toBe(
          Image.resolveAssetSource(moreAssets.contacts)?.uri,
        );
        expect(image.props.style).toEqual(
          expect.objectContaining({ width: '100%', height: '100%' }),
        );
      } else {
        const image = tree.root.findByType(Image);
        expect(image.props.source).toBe(moreAssets.contacts);
        expect(image.props.resizeMode).toBe('stretch');
      }
    } finally {
      act(() => tree.unmount());
      Platform.OS = previousPlatform;
    }
  },
);
