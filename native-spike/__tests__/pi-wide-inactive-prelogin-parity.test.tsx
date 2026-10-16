import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import InactiveBaselinePrelogin from '../src/experiences/pi/current/baseline/auth/InactiveBaselinePrelogin';
import FaceIdAnimation from '../src/experiences/pi/current/profile/FaceIdAnimation';
import { getProductsForCountry } from '@/app/config/productConfig';
import { getProjectPack } from '@/app/registry/projectPackRegistry';
import { loginBackground } from '../src/experiences/pi/current/profile/assets';
import { SourceLogo } from '../src/experiences/pi/current/profile/SourceLogo';
import { RasterImage } from '../src/experiences/pi/current/baseline/offers/RasterImage';
import { CURRENT_COAPPING_ADAPTER } from '../src/experiences/pi/current/coapping/adapter';
import { BaselinePreloginAccordion } from '../src/universal/BaselinePreloginAccordion';
import { BaselineNavigationLink } from '../src/universal/BaselineNavigationLink';
import { BaselinePanelMenuSheet } from '../src/universal/BaselinePanelMenuSheet';
import { PrimaryButton } from '../src/universal/PrimaryButton';
import { SourceCustomIcon } from '../src/universal/SourceCustomIcon';
import { Text } from '../src/universal/Typography';

const PI_COUNTRIES = [
  'RO',
  'CZ',
  'SK',
  'HU',
  'RS',
  'BA',
  'BA_BL',
  'SI',
] as const;
const PI_RELEASE_CONTEXTS = PI_COUNTRIES.flatMap(country =>
  getProjectPack('PI', country).releases.map(release => ({ country, release })),
);

const COAPPING_COUNTRIES = new Set(['CZ', 'SK']);

function host(
  country: CurrentScreenProps['country'],
  release: CurrentScreenProps['release'] = 'release-current',
): CurrentScreenProps {
  return {
    country,
    release,
    scenario: 'inactive',
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
    tree = Renderer.create(<InactiveBaselinePrelogin {...props} />);
  });
  return tree;
}

function openOther(tree: Renderer.ReactTestRenderer) {
  const other = tree.root.findAllByType(BaselineNavigationLink).at(-1);
  if (!other) throw new Error('Source Other link must be present');
  act(() => other.props.onPress());
}

it.each(PI_RELEASE_CONTEXTS)(
  '$country/$release renders Source inactive assets and country product order',
  ({ country, release }) => {
    const props = host(country, release),
      tree = mount(props);
    try {
      expect(tree.root.findByType(RasterImage).props.source).toBe(
        loginBackground,
      );
      expect(tree.root.findAllByType(SourceLogo)).toHaveLength(1);

      const accordion = tree.root.findByType(BaselinePreloginAccordion);
      expect(accordion.props).toMatchObject({
        variant: 'animated',
        welcomeText: props.t('preLogin.welcome'),
        findOutMoreText: props.t('products.findOutMore'),
      });
      expect(accordion.props.products).toEqual(
        getProductsForCountry(country).map(product => ({
          ...product,
          title: props.t(`products.${product.id}.title`, product.title),
          description: props.t(
            `products.${product.id}.description`,
            product.description,
          ),
        })),
      );

      const activate = tree.root.findByType(PrimaryButton);
      expect(activate.props).toMatchObject({
        label: props.t('preLogin.activateApplication'),
        variant: 'surface',
        labelSize: '16',
      });
      expect(activate.props.onPress).toBeUndefined();
      expect(
        tree.root.findAllByType(BaselineNavigationLink).map(link => link.props.text),
      ).toEqual([
        props.t('preLogin.contacts'),
        props.t('preLogin.mtoken'),
        props.t('preLogin.other'),
      ]);
      expect(tree.root.findAllByType(TextInput)).toHaveLength(0);
      expect(tree.root.findAllByType(FaceIdAnimation)).toHaveLength(0);
    } finally {
      act(() => tree.unmount());
    }
  },
);

it('keeps activation and utility links inert while routing Language to the Source screen', () => {
  const props = host('RO'),
    tree = mount(props);
  try {
    const links = tree.root.findAllByType(BaselineNavigationLink);
    act(() => links[0].props.onPress());
    act(() => links[1].props.onPress());
    act(() => tree.root.findByType(PrimaryButton).props.onPress?.());
    expect(props.onNavigate).not.toHaveBeenCalled();

    const language = tree.root.findAll(
      node => node.props.accessibilityLabel === 'Language',
    )[0];
    if (!language) throw new Error('Source language button must be present');
    act(() => language.props.onPress());
    expect(props.onNavigate).toHaveBeenCalledWith({ screen: 'language' });
    expect(props.onLanguageChange).not.toHaveBeenCalled();
  } finally {
    act(() => tree.unmount());
  }
});

it.each(PI_COUNTRIES)(
  'shows the existing Co-Apping row only where Source allows it: %s',
  country => {
    const props = host(country),
      tree = mount(props),
      available = COAPPING_COUNTRIES.has(country);
    try {
      openOther(tree);
      const sheet = tree.root.findByType(BaselinePanelMenuSheet);
      expect(sheet.props.startCoAppingSession).toBe(
        available ? props.t('panel.startCoAppingSession') : undefined,
      );
      expect(sheet.findAllByType(Text).map(row => row.props.children)).toEqual([
        props.t('panel.aboutSmartBanking'),
        props.t('panel.exchangeRates'),
        props.t('panel.findAtmBranches'),
        ...(available ? [props.t('panel.startCoAppingSession')] : []),
      ]);
      expect(
        tree.root
          .findAllByType(SourceCustomIcon)
          .some(icon => icon.props.name === 'panel-share-screen'),
      ).toBe(available);

      if (available) {
        const start = sheet.props.onStartCoApping;
        const row = tree.root
          .findAll(control => control.props.onPress === start)
          .at(0);
        if (typeof start !== 'function' || !row)
          throw new Error('Source Co-Apping row must be actionable');
        act(() => row.props.onPress());
        expect(tree.root.findAllByType(BaselinePanelMenuSheet)).toHaveLength(0);
        expect(props.onNavigate).toHaveBeenCalledWith({ screen: 'coapping' });
        expect(CURRENT_COAPPING_ADAPTER.screens.coapping).toBeDefined();
      } else {
        expect(sheet.props.onStartCoApping).toBeUndefined();
        expect(props.onNavigate).not.toHaveBeenCalled();
      }
    } finally {
      act(() => tree.unmount());
    }
  },
);

it('consumes Back to close Other and restores primary navigation visibility on unmount', () => {
  const props = host('CZ'),
    tree = mount(props);
  try {
    expect(props.onPrimaryNavigationChange).toHaveBeenLastCalledWith(false);
    openOther(tree);
    const back = (props.onBackHandlerChange as jest.Mock).mock.calls.at(-1)![0];
    act(() => expect(back()).toBe(true));
    expect(tree.root.findAllByType(BaselinePanelMenuSheet)).toHaveLength(0);
    expect(props.onNavigate).not.toHaveBeenCalled();
    expect(props.onBack).not.toHaveBeenCalled();
  } finally {
    act(() => tree.unmount());
  }
  expect(props.onPrimaryNavigationChange).toHaveBeenLastCalledWith(true);
});
