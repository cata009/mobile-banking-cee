import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import Login from '../src/experiences/pi/current/baseline/more/Login';
import { CURRENT_COAPPING_ADAPTER } from '../src/experiences/pi/current/coapping/adapter';
import { SourceCustomIcon } from '../src/universal/SourceCustomIcon';
import { BaselineNavigationLink } from '../src/universal/BaselineNavigationLink';
import { BaselinePanelMenuSheet } from '../src/universal/BaselinePanelMenuSheet';
import { Text } from '../src/universal/Typography';

const COUNTRY_AVAILABILITY: ReadonlyArray<
  readonly [CurrentScreenProps['country'], boolean]
> = [
  ['CZ', true],
  ['SK', true],
  ['RO', false],
  ['HU', false],
  ['RS', false],
  ['SI', false],
  ['BA', false],
  ['BA_BL', false],
];

function host(
  country: CurrentScreenProps['country'],
): CurrentScreenProps {
  return {
    country,
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
    route: { screen: 'prelogin' },
    tokens: currentTokens(),
    t: createCurrentTranslator(country, 'en'),
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

function mount(props: CurrentScreenProps) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<Login {...props} />);
  });
  return tree;
}

function openOther(tree: Renderer.ReactTestRenderer) {
  const other = tree.root.findAllByType(BaselineNavigationLink).at(-1);
  if (!other) throw new Error('Source Other link must be present');
  act(() => other.props.onPress());
}

it.each(COUNTRY_AVAILABILITY)(
  'shows only the Source Co-Apping row for %s and preserves other market rows',
  (country, coAppingAvailable) => {
    const props = host(country),
      tree = mount(props);
    try {
      openOther(tree);
      const sheet = tree.root.findByType(BaselinePanelMenuSheet);
      expect(sheet.props.startCoAppingSession).toBe(
        coAppingAvailable
          ? props.t('panel.startCoAppingSession')
          : undefined,
      );
      if (coAppingAvailable)
        expect(sheet.props.onStartCoApping).toEqual(expect.any(Function));
      else expect(sheet.props.onStartCoApping).toBeUndefined();
      expect(sheet.findAllByType(Text).map(label => label.props.children)).toEqual(
        [
          props.t('panel.aboutSmartBanking'),
          props.t('panel.exchangeRates'),
          props.t('panel.findAtmBranches'),
          ...(coAppingAvailable
            ? [props.t('panel.startCoAppingSession')]
            : []),
        ],
      );
      expect(
        tree.root
          .findAllByType(SourceCustomIcon)
          .some(icon => icon.props.name === 'panel-share-screen'),
      ).toBe(coAppingAvailable);
    } finally {
      act(() => tree.unmount());
    }
  },
);

it.each(['CZ', 'SK'] as const)(
  'closes Other and opens the existing Native Co-Apping route from %s',
  country => {
    const props = host(country),
      tree = mount(props);
    try {
      openOther(tree);
      const sheet = tree.root.findByType(BaselinePanelMenuSheet);
      const start = sheet.props.onStartCoApping;
      const row = tree.root
        .findAll(control => control.props.onPress === start)
        .at(0);
      if (typeof start !== 'function' || !row)
        throw new Error(
          'Source Co-Apping row must be an actual pressable action',
        );
      expect(row.props.accessibilityRole).toBe('button');

      act(() => row.props.onPress());
      expect(tree.root.findAllByType(BaselinePanelMenuSheet)).toHaveLength(0);
      expect(props.onNavigate).toHaveBeenCalledWith({ screen: 'coapping' });
      expect(CURRENT_COAPPING_ADAPTER.screens.coapping).toBeDefined();
    } finally {
      act(() => tree.unmount());
    }
  },
);

it('keeps Back consuming Other without navigating when the CZ Co-Apping row is available', () => {
  const props = host('CZ'),
    tree = mount(props);
  try {
    openOther(tree);
    const back = (props.onBackHandlerChange as jest.Mock).mock.calls.at(-1)![0];
    act(() => expect(back()).toBe(true));
    expect(tree.root.findAllByType(BaselinePanelMenuSheet)).toHaveLength(0);
    expect(props.onNavigate).not.toHaveBeenCalled();
  } finally {
    act(() => tree.unmount());
  }
});
