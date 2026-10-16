import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority';
import { deriveProductCategories } from '@/features/products/selectors';
import { createSpendingAnalyticsTimeline } from '@/data/spendingAnalytics';
import {
  createCurrentProducts,
  createCurrentTranslator,
  currentFeature,
  currentTokens,
} from '../src/experiences/pi/current/context';
import { isPiBaselineContext } from '../src/experiences/pi/current/baseline/policy';
import { CURRENT_HOME_ADAPTER } from '../src/experiences/pi/current/adapter';
import { CURRENT_BANKING_ADAPTER } from '../src/experiences/pi/current/banking/adapter';
import { CURRENT_PROFILE_ADAPTER } from '../src/experiences/pi/current/profile/adapter';
import Home from '../src/experiences/pi/current/Home';
import BaselineHome from '../src/experiences/pi/current/baseline/Home';
import { BaselineHomeBody } from '../src/experiences/pi/current/baseline/Body';
import BaselineAccount from '../src/experiences/pi/current/baseline/Account';
import BaselineCard from '../src/experiences/pi/current/baseline/Card';
import BaselineProducts from '../src/experiences/pi/current/baseline/offers/Products';
import BaselineMore from '../src/experiences/pi/current/baseline/more/More';
import BaselinePfm from '../src/experiences/pi/current/baseline/spending/PfmScreen';
import { RoBaselinePaymentsScreen } from '../src/experiences/pi/current/baseline/payments/hub/Payments';
import PaymentCreate from '../src/experiences/pi/current/baseline/payments/domestic/RoBaselinePaymentCreateScreen';
import { BaselineLocalAccountFields } from '../src/experiences/pi/current/baseline/payments/domestic/LocalAccountFields';
import { BaselineTextField } from '../src/universal/BaselineTextField';
import { BaselineAmountField } from '../src/universal/BaselineAmountField';
import { PrimaryButton } from '../src/universal/PrimaryButton';

const countries = ['RO', 'HU', 'RS', 'SI', 'CZ', 'SK', 'BA', 'BA_BL'] as const;
const releases = [
  'release-current',
  'release-v1',
  'release-v2',
  'release-v3',
  'release-v4',
] as const;
const all = countries.flatMap(country =>
  releases.map(release => ({ country, release })),
);
const redesigned = all.filter(
  c =>
    ['RO', 'CZ'].includes(c.country) &&
    ['release-v2', 'release-v3', 'release-v4'].includes(c.release),
);
const accepted = all.filter(c => !redesigned.includes(c));
function host(context: (typeof all)[number]): CurrentScreenProps {
  return {
    ...context,
    scenario: 'active',
    language: 'en',
    productCounts: DEFAULT_VISIBLE_PRODUCT_OVERRIDES,
    route: { screen: 'home' },
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
  };
}
type Element = React.ReactElement<{ children: React.ReactElement }>;
const resolve = (renderer: unknown, props: CurrentScreenProps) =>
  (renderer as (h: CurrentScreenProps) => Element)(props);

function homeUsesRedesignedSummary(screen: Element): boolean {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(screen);
  });
  try {
    return Boolean(tree.root.findByType(BaselineHomeBody).props.redesigned);
  } finally {
    act(() => tree.unmount());
  }
}

it('covers all forty audited current active country/release contexts', () => {
  expect(all).toHaveLength(40);
  expect(accepted).toHaveLength(34);
  expect(redesigned).toHaveLength(6);
});

it.each(accepted)(
  '$country/$release selects seven faithful baseline families and preserves canonical products/report data',
  context => {
    const h = host(context);
    expect(isPiBaselineContext(h)).toBe(true);
    const selectedHome = resolve(Home, h);
    expect(selectedHome.type).toBe(BaselineHome);
    expect(homeUsesRedesignedSummary(selectedHome)).toBe(
      currentFeature(h, 'fx_cardsRedesign'),
    );
    for (const [screen, renderer] of [
      ['account', BaselineAccount],
      ['card', BaselineCard],
      ['payments', RoBaselinePaymentsScreen],
      ['payment-create', PaymentCreate],
    ] as const) {
      const selected = resolve(CURRENT_BANKING_ADAPTER.screens[screen], {
        ...h,
        route: { screen },
      });
      expect(selected.type).toBe(renderer);
      expect(selected.props).toMatchObject({
        country: context.country,
        release: context.release,
      });
    }
    expect(resolve(CURRENT_HOME_ADAPTER.screens.products, h).type).toBe(
      BaselineProducts,
    );
    expect(resolve(CURRENT_HOME_ADAPTER.screens.pfm, h).type).toBe(BaselinePfm);
    expect(
      resolve(CURRENT_PROFILE_ADAPTER.screens.profile, h).props.children.type,
    ).toBe(BaselineMore);
    const expected = deriveProductCategories({
      country: context.country,
      release: 'release-current',
      resolvedProductCounts: DEFAULT_VISIBLE_PRODUCT_OVERRIDES,
    });
    const actual = createCurrentProducts(h);
    expect(actual.categories).toEqual(expected);
    expect(
      createSpendingAnalyticsTimeline(context.country, actual.products),
    ).toEqual(
      createSpendingAnalyticsTimeline(
        context.country,
        expected.flatMap(category => category.products),
      ),
    );
  },
);
it.each(redesigned)(
  '$country/$release selects the redesigned baseline Home for cardsRedesign',
  context => {
    const h = host(context);
    expect(isPiBaselineContext(h)).toBe(true);
    const selectedHome = resolve(Home, h);
    expect(selectedHome.type).toBe(BaselineHome);
    expect(homeUsesRedesignedSummary(selectedHome)).toBe(true);
  },
);
it('CZ R1 keeps Source generic mandatory-prefix form and its nonempty-only legacy validation', () => {
  const h = host({ country: 'CZ', release: 'release-v1' });
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<PaymentCreate {...h} />);
  });
  const field = (label: string) =>
    tree.root
      .findAllByType(BaselineTextField)
      .find(node => node.props.label === label)!;
  try {
    expect(tree.root.findAllByType(BaselineLocalAccountFields)).toHaveLength(0);
    expect(
      tree.root
        .findAllByType(BaselineTextField)
        .some(node => node.props.trailingIconAction),
    ).toBe(false);
    act(() => field('Beneficiary').props.onChange('Ada'));
    act(() =>
      field('Account number (mandatory)').props.onChange('not-account'),
    );
    act(() => field('Bank code (mandatory)').props.onChange('not-bank'));
    act(() => tree.root.findByType(BaselineAmountField).props.onChange('word'));
    expect(tree.root.findByType(PrimaryButton).props.disabled).toBe(true);
    act(() => field('Prefix').props.onChange('abc'));
    expect(tree.root.findByType(PrimaryButton).props.disabled).toBe(false);
    act(() => tree.root.findByType(PrimaryButton).props.onPress());
    expect(JSON.stringify(tree.toJSON())).toContain('word CZK');
    expect(JSON.stringify(tree.toJSON())).toContain('abc-not-account-not-bank');
  } finally {
    act(() => tree.unmount());
  }
});
