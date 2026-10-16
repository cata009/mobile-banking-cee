import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import type { SpendingAnalyticsTransaction } from '@/data/spendingAnalytics';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority';
import { getMoreCardsForCountry } from '@/app/config/moreCardsConfig';
import { CURRENT_BANKING_ADAPTER } from '../src/experiences/pi/current/banking/adapter';
import {
  bankingProducts,
  productTransactions,
} from '../src/experiences/pi/current/banking/model';
import { CURRENT_PROFILE_ADAPTER } from '../src/experiences/pi/current/profile/adapter';
import Pfm from '../src/experiences/pi/current/analytics/Pfm';
import CurrentLogin from '../src/experiences/pi/current/profile/Login';
import RoLogin from '../src/experiences/pi/current/baseline/more/Login';
import BaselineAccount from '../src/experiences/pi/current/baseline/Account';
import BaselineAccountInfo from '../src/experiences/pi/current/baseline/AccountInfo';
import BaselineAccountOptions from '../src/experiences/pi/current/baseline/AccountOptions';
import BaselineCard from '../src/experiences/pi/current/baseline/Card';
import BaselineCardInfo from '../src/experiences/pi/current/baseline/CardInfo';
import BaselineCardOptions from '../src/experiences/pi/current/baseline/CardOptions';
import { RoBaselineTransaction } from '../src/experiences/pi/current/baseline/Transaction';
import { RoBaselineTransactionsScreen } from '../src/experiences/pi/current/baseline/TransactionsScreen';
import { RoBaselinePaymentsScreen } from '../src/experiences/pi/current/baseline/payments/hub/Payments';
import BaselinePaymentCreate from '../src/experiences/pi/current/baseline/payments/domestic/RoBaselinePaymentCreateScreen';
import BaselineMore from '../src/experiences/pi/current/baseline/more/More';
import BaselineSettings from '../src/experiences/pi/current/baseline/more/Settings';
import BaselineLanguage from '../src/experiences/pi/current/baseline/more/Language';
import BaselineDocuments from '../src/experiences/pi/current/baseline/more/Documents';
import BaselineMessages from '../src/experiences/pi/current/baseline/more/Messages';
import BaselineContacts from '../src/experiences/pi/current/baseline/more/Contacts';
import BaselineAdvisor from '../src/experiences/pi/current/baseline/more/Advisor';
import BaselineAppointment from '../src/experiences/pi/current/baseline/more/Appointment';
import BaselineCallRequest from '../src/experiences/pi/current/baseline/more/CallRequest';
import BaselinePfm from '../src/experiences/pi/current/baseline/spending/PfmScreen';
import { BaselineTransactionRow } from '../src/universal/BaselineTransactionRow';
import { BaselinePreloginAccordion } from '../src/universal/BaselinePreloginAccordion';
import { PrimaryButton } from '../src/universal/PrimaryButton';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import { isPiClassicCompositionContext } from '../src/experiences/pi/current/baseline/policy';

const classicContexts = [
  {
    label: 'CZ Co-Apping',
    country: 'CZ',
    release: 'release-future-cz-coapping',
    activeFeatures: ['fx_czCoAppingSmartAssistant'],
  },
  {
    label: 'CZ Robo',
    country: 'CZ',
    release: 'release-future-cz-robo',
    activeFeatures: ['fx_czRoboAdvisor'],
  },
  {
    label: 'RS Future Gain',
    country: 'RS',
    release: 'release-future-rs-future-gain',
    activeFeatures: [],
  },
] as const;

type Element = React.ReactElement<{ children?: React.ReactElement }>;
type PfmElement = React.ReactElement<{
  onTransactionClick: (transaction: SpendingAnalyticsTransaction) => void;
}>;

function host(
  context: (typeof classicContexts)[number],
  extra: Partial<CurrentScreenProps> = {},
): CurrentScreenProps {
  return {
    country: context.country,
    release: context.release,
    scenario: 'active',
    activeFeatures: context.activeFeatures,
    language: 'en',
    productCounts: DEFAULT_VISIBLE_PRODUCT_OVERRIDES,
    route: { screen: 'account' },
    tokens: currentTokens(),
    t: createCurrentTranslator(context.country, 'en'),
    amountsHidden: false,
    screenTopInset: 12,
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
    ...extra,
  };
}

function resolve(renderer: unknown, props: CurrentScreenProps): Element {
  return (renderer as (host: CurrentScreenProps) => Element)(props);
}

function render(element: React.ReactElement): Renderer.ReactTestRenderer {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(element);
  });
  return tree;
}

afterEach(() => jest.clearAllMocks());

test.each(classicContexts)(
  '$label selects the Source-faithful shared banking, profile and analytics screens',
  context => {
    const props = host(context);
    const bankingScreens = [
      ['account', BaselineAccount],
      ['account-info', BaselineAccountInfo],
      ['account-options', BaselineAccountOptions],
      ['card', BaselineCard],
      ['card-info', BaselineCardInfo],
      ['card-options', BaselineCardOptions],
      ['transaction', RoBaselineTransaction],
      ['transactions', RoBaselineTransactionsScreen],
      ['payments', RoBaselinePaymentsScreen],
      ['payment-create', BaselinePaymentCreate],
    ] as const;

    for (const [screen, expected] of bankingScreens) {
      expect(
        resolve(CURRENT_BANKING_ADAPTER.screens[screen], {
          ...props,
          route: { screen },
        }).type,
      ).toBe(expected);
    }

    const profileScreens = [
      ['profile', BaselineMore],
      ['settings', BaselineSettings],
      ['language', BaselineLanguage],
      ['documents', BaselineDocuments],
      ['messages', BaselineMessages],
      ['contacts', BaselineContacts],
      ['prime', BaselineAdvisor],
      ['appointments', BaselineAppointment],
      ['call-request', BaselineCallRequest],
      ['login', RoLogin],
      ['prelogin', RoLogin],
    ] as const;

    for (const [screen, expected] of profileScreens) {
      const selected = resolve(CURRENT_PROFILE_ADAPTER.screens[screen], {
        ...props,
        route: { screen },
      }).props.children!;
      expect(selected.type).toBe(expected);
      expect(selected.props).toMatchObject({
        country: context.country,
        release: context.release,
      });
    }

    const onTransactionSelected = jest.fn();
    const pfmProps = host(context, {
      onTransactionSelected,
      route: { screen: 'pfm' },
    });
    const pfmElement = Pfm(pfmProps) as PfmElement;
    expect(pfmElement.type).toBe(BaselinePfm);

    const account = bankingProducts(props).currentAccounts[0]!;
    const onAccountTransactionSelected = jest.fn();
    const accountTree = render(
      React.createElement(CURRENT_BANKING_ADAPTER.screens.account!, {
        ...props,
        route: { screen: 'account', params: { productId: account.id } },
        onTransactionSelected: onAccountTransactionSelected,
      }),
    );
    try {
      expect(
        accountTree.root.findAllByProps({ testID: 'ro-account-page' }).length,
      ).toBeGreaterThan(0);
      const row = accountTree.root.findAllByType(BaselineTransactionRow)[0]!;
      const transaction = row.props.transaction;
      act(() => row.props.onPress(transaction));
      expect(onAccountTransactionSelected).toHaveBeenCalledWith({
        transaction,
        productId: account.id,
        source: 'account',
      });
    } finally {
      act(() => accountTree.unmount());
    }

    const profileTree = render(
      React.createElement(CURRENT_PROFILE_ADAPTER.screens.profile!, {
        ...props,
        route: { screen: 'profile' },
      }),
    );
    try {
      expect(profileTree.root.findAllByType(BaselineMore)).toHaveLength(1);
      expect(
        profileTree.root.findAllByProps({ testID: 'ro-more-top-reserve' })
          .length,
      ).toBeGreaterThan(0);
      const cardIds = [
        ...new Set(
          profileTree.root
            .findAll(
              node =>
                typeof node.props.testID === 'string' &&
                node.props.testID.startsWith('ro-more-card-'),
            )
            .map(node => node.props.testID),
        ),
      ];
      expect(cardIds).toEqual(
        getMoreCardsForCountry(context.country).map(
          card => `ro-more-card-${card}`,
        ),
      );
    } finally {
      act(() => profileTree.unmount());
    }

    const pfmTree = render(<Pfm {...pfmProps} />);
    try {
      expect(pfmTree.root.findAllByType(BaselinePfm)).toHaveLength(1);
      expect(
        pfmTree.root.findAllByProps({ testID: 'ro-pfm-top-spacer' }).length,
      ).toBeGreaterThan(0);
      const product = bankingProducts(pfmProps).currentAccounts[0]!;
      const transaction = {
        ...productTransactions(pfmProps, product)[0]!,
        sourceProductId: product.id,
      } as SpendingAnalyticsTransaction;
      act(() => pfmElement.props.onTransactionClick(transaction));
      expect(onTransactionSelected).toHaveBeenCalledWith({
        transaction,
        productId: product.id,
        source: 'account',
      });
    } finally {
      act(() => pfmTree.unmount());
    }
  },
);

test('inactive prelogin retains the inactive current Login even when a classic feature is projected', () => {
  const context = classicContexts[0];
  const props = host(context, {
    scenario: 'inactive',
    route: { screen: 'prelogin' },
  });
  expect(isPiClassicCompositionContext(props)).toBe(true);
  const Prelogin = CURRENT_PROFILE_ADAPTER.screens.prelogin!;
  const tree = render(<Prelogin {...props} />);
  try {
    expect(tree.root.findAllByType(CurrentLogin)).toHaveLength(1);
    expect(tree.root.findAllByType(RoLogin)).toHaveLength(0);
    expect(
      tree.root.findAllByProps({ testID: 'pi-inactive-prelogin' }).length,
    ).toBeGreaterThan(0);
    expect(tree.root.findByType(BaselinePreloginAccordion).props).toMatchObject(
      {
        variant: 'animated',
        welcomeText: props.t('preLogin.welcome'),
        findOutMoreText: props.t('products.findOutMore'),
      },
    );
    const activate = tree.root.findByType(PrimaryButton);
    expect(activate.props).toMatchObject({
      label: props.t('preLogin.activateApplication'),
      variant: 'surface',
      labelSize: '16',
    });
    expect(activate.props.onPress).toBeUndefined();
  } finally {
    act(() => tree.unmount());
  }
});
