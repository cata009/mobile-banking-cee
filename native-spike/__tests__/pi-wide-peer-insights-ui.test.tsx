import React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { ToggleButton } from '../src/universal/ToggleButton';
import { PrimaryButton } from '../src/universal/PrimaryButton';
import Renderer, { act } from 'react-test-renderer';
import { CURRENT_FUTURE_GAIN_ADAPTER } from '../src/experiences/pi/current/future-gain/adapter';
import {
  createCurrentTranslator,
  currentTokens,
} from '../src/experiences/pi/current/context';
import type {
  CurrentScreen,
  CurrentScreenProps,
} from '../src/experiences/pi/current/contracts';
import { FUTURE_GAIN_PEER_GOALS } from '@/features/investments/future-gain/peerInsights';
import { Text } from '../src/universal/Typography';

const counts = {
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

async function render(
  screen: CurrentScreen,
  extra: Partial<CurrentScreenProps> = {},
) {
  const props: CurrentScreenProps = {
    country: 'RS',
    release: 'release-future-rs-future-gain',
    scenario: 'active',
    language: 'en',
    productCounts: counts,
    route: { screen },
    tokens: currentTokens(),
    t: createCurrentTranslator('RS', 'en'),
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
    ...extra,
  };
  const Component = CURRENT_FUTURE_GAIN_ADAPTER.screens[screen]!;
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<Component {...props} />);
  });
  return { tree, props };
}

const press = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root.findAll(
    node =>
      typeof node.props.onPress === 'function' &&
      node.props.accessibilityLabel === label,
  )[0]!;

const textStyles = (tree: Renderer.ReactTestRenderer, value: string) =>
  tree.root
    .findAllByType(Text)
    .filter(node => node.props.children === value)
    .map(node => StyleSheet.flatten(node.props.style));

test('Peer Insights keeps Source page hierarchy, profile cues, goal gutters and canonical product rows', async () => {
  const { tree } = await render('peer-insights');
  try {
    expect(
      textStyles(tree, 'GDPR notice').filter(style => style.fontSize === 32),
    ).toHaveLength(0);
    const consentContent = tree.root.findByProps({
        testID: 'future-gain-peer-consent-copy',
      }),
      firstParagraph = tree.root
        .findAllByType(Text)
        .find(node =>
          String(node.props.children).startsWith(
            'To display and use this functionality',
          ),
        )!;
    expect(StyleSheet.flatten(consentContent.props.style)).toMatchObject({
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 20,
    });
    expect(StyleSheet.flatten(firstParagraph.props.style).lineHeight).toBe(20);
    const privacyLink = tree.root.findByProps({
      testID: 'future-gain-peer-consent-policy-link',
    });
    expect(StyleSheet.flatten(privacyLink.props.style)).toMatchObject({
      minHeight: 32,
      marginTop: 20,
      gap: 4,
    });
    expect(press(tree, 'Next').props.disabled).toBe(true);
    expect(tree.root.findAllByType(PrimaryButton).find(node => node.props.label === 'Next')?.props.labelSize).toBe('18');

    const consent = tree.root.findAllByType(ToggleButton)[0]!;
    expect(consent.props.ariaLabel).toBe('I agree with the terms and conditions');
    await act(() => consent.props.onToggle(true));
    await act(() => press(tree, 'Next').props.onPress());

    expect(
      textStyles(tree, 'Achieve your life goals').filter(
        style => style.fontSize === 32,
      ),
    ).toHaveLength(0);

    const profile = tree.root.findByProps({ testID: 'future-gain-peer-profile-card' }),
      profileStyle = StyleSheet.flatten(profile.props.style),
      stats = profile.findByProps({ testID: 'future-gain-peer-profile-stats' }),
      firstStat = stats.findByProps({ testID: 'future-gain-peer-profile-age' }),
      goals = tree.root
        .findAllByType(ScrollView)
        .find(node => node.props.horizontal)!,
      goalStyle = StyleSheet.flatten(goals.props.contentContainerStyle),
      secondGoal = tree.root.findByProps({
        testID: 'future-gain-goal-tab-buy-a-car',
      }),
      housing = tree.root.findByProps({
        testID: `future-gain-peer-product-${FUTURE_GAIN_PEER_GOALS[0]!.products[0]!.id}`,
      }),
      housingIcon = housing.findByProps({ testID: 'future-gain-peer-product-icon-housing-loan' }),
      housingIconStyle = StyleSheet.flatten(housingIcon.props.style);

    expect(profileStyle).toMatchObject({
      paddingHorizontal: 12,
      paddingTop: 12,
      paddingBottom: 14,
    });
    expect(profile.findByProps({ testID: 'future-gain-peer-profile-info' })).toBeDefined();
    expect(StyleSheet.flatten(firstStat.props.style)).toMatchObject({
      alignItems: 'center',
      borderRightWidth: 1,
    });
    expect(goalStyle).toMatchObject({
      flexDirection: 'row',
      paddingHorizontal: 17,
    });
    expect(
      StyleSheet.flatten(secondGoal.props.style).marginLeft,
    ).toBe(8);
    expect(housingIconStyle).toMatchObject({
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#008574',
    });
  } finally {
    await act(() => tree.unmount());
  }
});

test('credit-card peer simulator follows Source card hierarchy and keeps the offer contact inert', async () => {
  const { tree, props } = await render('peer-insights');
  try {
    await act(() => tree.root.findAllByType(ToggleButton)[0]!.props.onToggle(true));
    await act(() => press(tree, 'Next').props.onPress());
    await act(() => press(tree, 'Open Credit cards simulator').props.onPress());

    expect(
      textStyles(tree, 'Credit Card').filter(style => style.fontSize === 32),
    ).toHaveLength(0);
    expect(tree.root.findAllByType(Image)).toHaveLength(2);
    expect(
      textStyles(tree, 'Lorem ipsum dolor sit amet'),
    ).toHaveLength(2);
    expect(
      textStyles(tree, 'Why should Flexia Mastercard be your first choice?').some(
        style => style.fontSize === 18,
      ),
    ).toBe(true);

    const flexia = tree.root.findByProps({ testID: 'future-gain-peer-card-option-flexia' }),
      platinum = tree.root.findByProps({ testID: 'future-gain-peer-card-option-platinum' });
    expect(StyleSheet.flatten(flexia.props.style)).toMatchObject({
      borderRadius: 4,
      borderWidth: 2,
    });
    expect(StyleSheet.flatten(platinum.props.style)).toMatchObject({
      borderRadius: 4,
      borderWidth: 1,
    });
    expect(
      tree.root.findAll(
        node =>
          node.type === View &&
          node.props.testID === 'future-gain-peer-credit-benefit',
      ),
    ).toHaveLength(4);

    await act(() => press(tree, 'Mastercard Platinum').props.onPress());
    expect(JSON.stringify(tree.toJSON())).toContain(
      'Why should Mastercard Platinum be your first choice?',
    );
    await act(() => press(tree, 'Call us for offer').props.onPress());
    expect(JSON.stringify(tree.toJSON())).toContain(
      'No call is started in this demo.',
    );
    expect(props.onNavigate).not.toHaveBeenCalled();
    await act(() => press(tree, 'OK').props.onPress());
  } finally {
    await act(() => tree.unmount());
  }
});
