import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { View, StyleSheet, Platform } from 'react-native';
import Svg from 'react-native-svg';
import { BaselineCardArtwork } from '../src/universal/BaselineCardArtwork';
import * as Headers from '../src/experiences/pi/current/baseline/DetailsHeader';
import { BaselineDetailToolbar } from '../src/universal/BaselineDetailToolbar';
import { BaselinePageHeader } from '../src/universal/BaselinePageHeader';
import { BankingCopyToast } from '../src/experiences/pi/current/banking/CopyToast';
import { sourceColor } from '../src/universal/sourceColor';

import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type {
  CurrentAdapter,
  CurrentScreenProps,
} from '../src/experiences/pi/current/contracts';
import NativeCurrentApp from '../src/experiences/pi/current/NativeCurrentApp';
import { CURRENT_BANKING_ADAPTER } from '../src/experiences/pi/current/banking/adapter';
import RoBaselineAccount from '../src/experiences/pi/current/baseline/Account';
import RoBaselineAccountInfo from '../src/experiences/pi/current/baseline/AccountInfo';
import RoBaselineAccountOptions from '../src/experiences/pi/current/baseline/AccountOptions';
import RoBaselineCard from '../src/experiences/pi/current/baseline/Card';
import RoBaselineCardInfo from '../src/experiences/pi/current/baseline/CardInfo';
import RoBaselineCardOptions from '../src/experiences/pi/current/baseline/CardOptions';
import { RoBaselineTransaction } from '../src/experiences/pi/current/baseline/Transaction';
import { isPiClassicCompositionContext } from '../src/experiences/pi/current/baseline/policy';
import { BaselineSearchBar } from '../src/universal/BaselineSearchBar';
import { Text, TextInput } from '../src/universal/Typography';
import { BaselineTransactionRow } from '../src/universal/BaselineTransactionRow';
import {
  AccountScreen,
  AccountInfoScreen,
  AccountOptionsScreen,
} from '../src/experiences/pi/current/banking/Accounts';
import {
  CardScreen,
  CardInfoScreen,
  CardOptionsScreen,
} from '../src/experiences/pi/current/banking/Cards';
import { TransactionScreen } from '../src/experiences/pi/current/banking/Transaction';
import { BaselineAccountActionBar } from '../src/universal/BaselineAccountActionBar';
import { BaselineAccountBalanceCard } from '../src/universal/BaselineAccountBalanceCard';
import { SourceCustomIcon } from '../src/universal/SourceCustomIcon';
import { BaselineCarouselIndicator } from '../src/universal/BaselineCarouselIndicator';
import { BaselineCardNavigationRow } from '../src/universal/BaselineCardNavigationRow';
import { bankingProducts } from '../src/experiences/pi/current/banking/model';
import { BaselineNavigationRow } from '../src/universal/BaselineNavigationRow';
import { sourceIconDimensions } from '../src/universal/sourceIconDimensions';

it.each([
  ['account', 'account-info'],
  ['account', 'account-options'],
  ['account', 'transaction'],
  ['card', 'card-info'],
  ['card', 'card-options'],
  ['card', 'transaction'],
] as const)(
  'restores the RO %s entry route after %s instead of replacing it with carousel selection',
  async (parent, target) => {
    let rendered!: CurrentScreenProps;
    const Screen = (host: CurrentScreenProps) => {
      rendered = host;
      return <View />;
    };
    const adapters: CurrentAdapter[] = [
      {
        id: 'ro-route-proof',
        screens: {
          account: Screen,
          card: Screen,
          'account-info': Screen,
          'account-options': Screen,
          'card-info': Screen,
          'card-options': Screen,
          transaction: Screen,
        },
      },
    ];
    let tree!: Renderer.ReactTestRenderer;
    await act(() => {
      tree = Renderer.create(
        <NativeCurrentApp
          country="RO"
          release="release-current"
          scenario="active"
          adapters={adapters}
          initialRoute={{
            screen: parent,
            params: { productId: 'entry-product' },
          }}
        />,
      );
    });
    try {
      await act(() =>
        rendered.onNavigate({
          screen: target,
          params: { productId: 'carousel-product' },
        }),
      );
      expect(rendered.route.params?.productId).toBe('carousel-product');
      await act(() => rendered.onBack());
      expect(rendered.route).toEqual({
        screen: parent,
        params: { productId: 'entry-product' },
      });
    } finally {
      await act(() => tree.unmount());
    }
  },
);

it('retains the existing parent-selection policy outside the classic composition guard', async () => {
  let rendered!: CurrentScreenProps;
  const Screen = (host: CurrentScreenProps) => {
    rendered = host;
    return <View />;
  };
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <NativeCurrentApp
        country="CZ"
        release="release-future-evo-2027"
        scenario="active"
        adapters={[
          {
            id: 'legacy-route-proof',
            screens: { account: Screen, 'account-info': Screen },
          },
        ]}
        initialRoute={{
          screen: 'account',
          params: { productId: 'entry-product' },
        }}
      />,
    );
  });
  try {
    await act(() =>
      rendered.onNavigate({
        screen: 'account-info',
        params: { productId: 'carousel-product' },
      }),
    );
    await act(() => rendered.onBack());
    expect(rendered.route.params?.productId).toBe('carousel-product');
  } finally {
    await act(() => tree.unmount());
  }
});

it('uses the original static-black toast surface rather than substituting absolute black', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <BankingCopyToast
        toast={{ message: 'Account number successfully copied', visible: true }}
        font="UniCredit-bold"
      />,
    );
  });
  try {
    const frames = tree.root
      .findAll(n => n.props.style)
      .map(n => StyleSheet.flatten(n.props.style));
    expect(
      frames.some(
        s =>
          s?.height === 34 &&
          s?.backgroundColor === sourceColor('var(--uc-static-black)'),
      ),
    ).toBe(true);
  } finally {
    act(() => tree.unmount());
  }
});

it('uses the full Source compact-title span rather than clipping the final glyph in an intrinsic native text box', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <BaselinePageHeader
        title="Dante International"
        onBack={jest.fn()}
        collapsedTitleProgress={1}
        renderLargeTitle={false}
      />,
    );
  });
  try {
    const title = tree.root
      .findAllByType(Text)
      .find(n => n.props.children === 'Dante International')!;
    expect(StyleSheet.flatten(title.props.style)).toMatchObject({
      width: '100%',
      textAlign: 'center',
    });
  } finally {
    act(() => tree.unmount());
  }
});

it('re-activates search on repeated field taps as well as focus, without Android underline or browser focus outline', () => {
  const activate = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<BaselineSearchBar onClick={activate} />);
  });
  try {
    const field = tree.root.findByType(TextInput);
    expect(typeof field.props.onPressIn).toBe('function');
    act(() => field.props.onPressIn());
    expect(activate).toHaveBeenCalledTimes(1);
    expect(field.props.underlineColorAndroid).toBe('transparent');
    expect(StyleSheet.flatten(field.props.style).outlineWidth).toBe(0);
    expect(StyleSheet.flatten(field.props.style).outlineStyle).toBeUndefined();
  } finally {
    act(() => tree.unmount());
  }
});

it('uses the actual browser click and outline-none semantics when the native input is rendered on web', () => {
  const previousOS = Platform.OS;
  Object.defineProperty(Platform, 'OS', { value: 'web', configurable: true });
  const activate = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<BaselineSearchBar onClick={activate} />);
  });
  try {
    const field = tree.root.findByType(TextInput);
    expect(StyleSheet.flatten(field.props.style).outlineStyle).toBe('none');
    act(() => field.props.onClick());
    expect(activate).toHaveBeenCalledTimes(1);
  } finally {
    act(() => tree.unmount());
    Object.defineProperty(Platform, 'OS', {
      value: previousOS,
      configurable: true,
    });
  }
});

it('retains the Source22×18 redo glyph and its canonical nonstandard brand glyph dimensions', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <BaselineAccountActionBar
        items={[
          { id: 'redo', label: 'Redo payment', iconName: 'redo-payment' },
        ]}
        iconTreatment="bare"
      />,
    );
  });
  try {
    const glyph = tree.root.findByType(SourceCustomIcon);
    expect([
      glyph.props.width ?? glyph.props.size,
      glyph.props.height ?? glyph.props.size,
    ]).toEqual([22, 18]);
  } finally {
    act(() => tree.unmount());
  }
});

it('retains Source artwork compositing and original navigation glyph sizes in the web renderer', () => {
  const previousOS = Platform.OS;
  Object.defineProperty(Platform, 'OS', { value: 'web', configurable: true });
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <>
        <BaselineCardArtwork
          variant="mc-credit-partner-standard"
          size="large"
        />
        <BaselineNavigationRow
          title="APPLE PAY"
          leadingIconName="card-options-apple-pay"
          trailingAccessory="chevron"
        />
      </>,
    );
  });
  try {
    const shell = tree.root
      .findAllByType(View)
      .map(n => StyleSheet.flatten(n.props.style))
      .find(s => s?.width === 160)! as {
      transform?: string;
      backgroundImage?: string;
    };
    expect(shell.transform).toBe('translateZ(0)');
    expect(shell.backgroundImage).toBe(
      'linear-gradient(135deg, #CF0612 0%, #7C0F0D 100%)',
    );
    expect(
      tree.root.findAllByType(Svg).find(n => n.props.viewBox === '0 0 64 40')!
        .props.style,
    ).toEqual({ borderRadius: 'inherit' });
    const glyphs = tree.root.findAllByType(SourceCustomIcon);
    expect(
      glyphs.map(n => [
        n.props.name,
        n.props.width ?? n.props.size,
        n.props.height ?? n.props.size,
      ]),
    ).toEqual([
      [
        'card-options-apple-pay',
        sourceIconDimensions('card-options-apple-pay').width,
        sourceIconDimensions('card-options-apple-pay').height,
      ],
      ['chevron-link', 32, 32],
    ]);
  } finally {
    act(() => tree.unmount());
    Object.defineProperty(Platform, 'OS', {
      value: previousOS,
      configurable: true,
    });
  }
});

it('preserves the original carousel backdrop in the browser and the32px card-link chevron', () => {
  const previousOS = Platform.OS;
  Object.defineProperty(Platform, 'OS', { value: 'web', configurable: true });
  const context = {
    country: 'RO',
    release: 'release-current',
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
  } as CurrentScreenProps;
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <>
        <BaselineCarouselIndicator count={6} activeIndex={0} />
        <BaselineCardNavigationRow
          card={bankingProducts(context).cards[0]}
          label="Card"
        />
      </>,
    );
  });
  try {
    expect(
      tree.root
        .findAllByType(View)
        .some(
          n =>
            (StyleSheet.flatten(n.props.style) as { backdropFilter?: string })
              ?.backdropFilter === 'blur(13.591408729553223px)',
        ),
    ).toBe(true);
    expect(
      tree.root
        .findAllByType(SourceCustomIcon)
        .find(n => n.props.name === 'chevron-link')?.props.size,
    ).toBe(32);
  } finally {
    act(() => tree.unmount());
    Object.defineProperty(Platform, 'OS', {
      value: previousOS,
      configurable: true,
    });
  }
});

it('matches the actual baseline mixed-font line boxes in account amounts and ledger rows', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <>
        <BaselineAccountBalanceCard
          account={{
            accountName: 'Primary',
            accountNumber: 'RO43BACX1234567890123401',
          }}
          availableInteger="20.614"
          availableDecimals=",83"
          currency="RON"
          currentBalance="18.965,64"
        />
        <BaselineTransactionRow
          transaction={
            {
              id: 'pending-starbucks',
              label: 'Starbucks',
              amount: -46.62,
              type: 'debit',
              status: 'Pending',
              day: '08',
              month: 'APR',
            } as React.ComponentProps<
              typeof BaselineTransactionRow
            >['transaction']
          }
          formattedAmount="46,62"
          currency="RON"
        />
      </>,
    );
  });
  try {
    const texts = tree.root.findAllByType(Text);
    expect(
      texts.some(
        n =>
          StyleSheet.flatten(n.props.style).fontSize === 30 &&
          StyleSheet.flatten(n.props.style).lineHeight === 33,
      ),
    ).toBe(true);
    expect(
      texts.some(
        n =>
          StyleSheet.flatten(n.props.style).fontSize === 20 &&
          StyleSheet.flatten(n.props.style).fontFamily ===
            'UniCredit-regular' &&
          StyleSheet.flatten(n.props.style).lineHeight === 22,
      ),
    ).toBe(true);
    const label = texts.find(n => n.props.children === 'Starbucks')!;
    expect(StyleSheet.flatten(label.props.style).lineHeight).toBe(17);
    expect(
      texts.some(
        n =>
          StyleSheet.flatten(n.props.style).fontSize === 14 &&
          StyleSheet.flatten(n.props.style).letterSpacing === 0 &&
          StyleSheet.flatten(n.props.style).lineHeight === 15,
      ),
    ).toBe(true);
  } finally {
    act(() => tree.unmount());
  }
});

it('uses the Source20px glyph inside bare account actions and the balance-card copy slot', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <>
        <BaselineAccountActionBar
          items={[
            { id: 'details', label: 'Details', iconName: 'account-details' },
          ]}
          iconTreatment="bare"
        />
        <BaselineAccountBalanceCard
          account={{
            accountName: 'Primary',
            accountNumber: 'RO43BACX1234567890123401',
          }}
          availableInteger="20.614"
          availableDecimals=",83"
          currency="RON"
          currentBalance="18.965,64"
          onCopy={jest.fn()}
        />
      </>,
    );
  });
  try {
    const glyphs = tree.root.findAllByType(SourceCustomIcon);
    expect(glyphs.map(n => [n.props.name, n.props.size])).toEqual([
      ['account-details', 20],
      ['copy-documents', 20],
    ]);
    expect(
      StyleSheet.flatten(
        tree.root.findAllByType(Text).find(n => n.props.children === 'Details')!
          .props.style,
      ).lineHeight,
    ).toBe(15);
  } finally {
    act(() => tree.unmount());
  }
});

const classicDetailRenderers = {
  account: RoBaselineAccount,
  card: RoBaselineCard,
  'account-info': RoBaselineAccountInfo,
  'account-options': RoBaselineAccountOptions,
  'card-info': RoBaselineCardInfo,
  'card-options': RoBaselineCardOptions,
  transaction: RoBaselineTransaction,
} as const;

const classicDetailContexts = [
  { country: 'CZ', release: 'release-future-cz-coapping', scenario: 'active' },
  { country: 'CZ', release: 'release-future-cz-robo', scenario: 'active' },
  { country: 'RS', release: 'release-future-rs-future-gain', scenario: 'active' },
] as const;

it.each([
  ['account', AccountScreen],
  ['card', CardScreen],
  ['account-info', AccountInfoScreen],
  ['account-options', AccountOptionsScreen],
  ['card-info', CardInfoScreen],
  ['card-options', CardOptionsScreen],
  ['transaction', TransactionScreen],
] as const)(
  'selects Source-faithful %s details in classic contexts and preserves generic contexts elsewhere',
  (screen, Previous) => {
    const Dispatch = CURRENT_BANKING_ADAPTER.screens[
      screen
    ] as React.FunctionComponent<CurrentScreenProps>;
    for (const context of classicDetailContexts) {
      const host = {
        ...context,
        amountsHidden: true,
        route: { screen, params: { productId: 'preserved-selected-id' } },
      } as unknown as CurrentScreenProps;
      expect(isPiClassicCompositionContext(host)).toBe(true);
      const result = Dispatch(host) as React.ReactElement<CurrentScreenProps>;
      expect(result.type).toBe(classicDetailRenderers[screen]);
      expect(result.props.route.params?.productId).toBe('preserved-selected-id');
      expect(result.props.amountsHidden).toBe(true);
    }

    for (const context of [
      { country: 'CZ', release: 'release-future-evo-2027', scenario: 'active' },
      { country: 'RO', release: 'release-future-evo-2027', scenario: 'active' },
      { country: 'RO', release: 'release-current', scenario: 'inactive' },
    ]) {
      const host = {
        ...context,
        amountsHidden: true,
        route: { screen, params: { productId: 'preserved-selected-id' } },
      } as unknown as CurrentScreenProps;
      expect(isPiClassicCompositionContext(host)).toBe(false);
      const result = Dispatch(host) as React.ReactElement<CurrentScreenProps>;
      expect(result.type).toBe(Previous);
      expect(result.props.route.params?.productId).toBe('preserved-selected-id');
      expect(result.props.amountsHidden).toBe(true);
    }
  },
);

it('preserves the Source eight-pixel gap between search icon and input without moving the trailing action', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<BaselineSearchBar onFilterClick={jest.fn()} />);
  });
  try {
    const input = tree.root.findByType(TextInput);
    expect(StyleSheet.flatten(input.props.style).marginLeft).toBe(8);
    const trailing = tree.root.findAll(
      n =>
        n.props.accessibilityLabel === 'Filters' &&
        typeof n.props.onPress !== 'undefined',
    );
    expect(StyleSheet.flatten(trailing.at(-1)!.props.style).width).toBe(32);
  } finally {
    act(() => tree.unmount());
  }
});

it.each([
  ['account', RoBaselineAccount],
  ['card', RoBaselineCard],
] as const)(
  'actual %s adapter selects only RO/current/active composition',
  (screen, Expected) => {
    const Component = CURRENT_BANKING_ADAPTER.screens[screen]!;
    const host = {
      country: 'RO',
      release: 'release-current',
      scenario: 'active',
      language: 'en',
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
      tokens: currentTokens(),
      t: createCurrentTranslator('RO', 'en'),
      screenTopInset: 12,
      onBack: jest.fn(),
      onNavigate: jest.fn(),
      onChanged: jest.fn(),
      onAmountsToggle: jest.fn(),
      onProfile: jest.fn(),
      onSearch: jest.fn(),
      route: { screen },
      isActive: true,
      amountsHidden: false,
      mode: 'light',
      onModeChange: jest.fn(),
      onLanguageChange: jest.fn(),
    } as CurrentScreenProps;
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(<Component {...host} />);
    });
    try {
      expect(tree.root.findAllByType(Expected)).toHaveLength(1);
    } finally {
      act(() => tree.unmount());
    }
  },
);

it.each(['account', 'card'] as const)(
  'shares the original %s toolbar geometry/host reserve with inert RO Help',
  kind => {
    const Header = Headers.RoBaselineDetailsHeader;
    expect(Header).toBeDefined();
    const onBack = jest.fn();
    const host = {
      country: 'RO',
      release: 'release-current',
      scenario: 'active',
      tokens: currentTokens(),
      t: createCurrentTranslator('RO', 'en'),
      screenTopInset: 12,
      onBack,
    } as unknown as CurrentScreenProps;
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <Header
          host={host}
          title={kind === 'card' ? 'Cards' : 'My Products'}
          progress={0.5}
          kind={kind}
        />,
      );
    });
    try {
      const toolbar = tree.root.findByType(BaselineDetailToolbar);
      expect(toolbar.props.safeAreaReserve).toBe(12);
      expect(toolbar.props.progress).toBe(0.5);
      const back = tree.root
        .findAll(
          n =>
            n.props.accessibilityLabel === 'Back' &&
            typeof n.props.onPress === 'function',
        )
        .at(-1)!;
      act(() => back.props.onPress());
      expect(onBack).toHaveBeenCalledTimes(1);
      const help = tree.root.findAll(
        n => n.props.accessibilityLabel === 'Help',
      );
      expect(help.length).toBeGreaterThan(0);
      if (kind === 'account')
        expect(typeof toolbar.props.onHelpPress).toBe('function');
      else expect(toolbar.props.onHelpPress).toBeUndefined();
    } finally {
      act(() => tree.unmount());
    }
  },
);

it('fills the original219×138 detail canvas when the common artwork wrapper is resized', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <BaselineCardArtwork
        size="large"
        style={{ width: 219, height: 138, borderRadius: 5.67 }}
      />,
    );
  });
  try {
    const shell = StyleSheet.flatten(
      tree.root.findAllByType(View)[0].props.style,
    );
    expect([shell.width, shell.height]).toEqual([219, 138]);
    const art = tree.root.findByType(Svg);
    expect([art.props.width, art.props.height]).toEqual(['100%', '100%']);
  } finally {
    act(() => tree.unmount());
  }
});
