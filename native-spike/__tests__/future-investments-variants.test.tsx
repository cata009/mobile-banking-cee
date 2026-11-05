import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import Investments from '../src/experiences/pi/current/investments/Investments';
import {
  createCurrentTranslator,
  currentTokens,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { DEFAULT_CZECH_COUNTS } from '../src/experiences/pi/cz/evo-2027/contracts';

it.each([
  'release-future-evo-2027',
  'release-future-cz-robo',
  'release-future-cz-coapping',
] as const)(
  'supports the real Portfolio and Goals destinations in %s',
  async release => {
    const host: CurrentScreenProps = {
      country: 'CZ',
      release,
      scenario: 'active',
      bankingScenario: 'retail-single-account',
      activeFeatures: [],
      language: 'en',
      productCounts: DEFAULT_CZECH_COUNTS,
      route: { screen: 'investments' },
      tokens: currentTokens(),
      t: createCurrentTranslator('CZ', 'en'),
      amountsHidden: false,
      screenTopInset: 54,
      isActive: true,
      mode: 'light',
      onModeChange: jest.fn(),
      onNavigate: jest.fn(),
      onBack: jest.fn(),
      onProfile: jest.fn(),
      onSearch: jest.fn(),
      onAmountsToggle: jest.fn(),
      onChanged: jest.fn(),
      onLanguageChange: jest.fn(),
    };
    let tree!: Renderer.ReactTestRenderer;
    await act(async () => {
      tree = Renderer.create(<Investments {...host} />);
    });
    expect(
      tree.root.findAll(node => node.props.testID === 'future-investment-home')
        .length,
    ).toBeGreaterThan(0);
    await act(async () => {
      tree.update(
        <Investments
          {...host}
          route={{
            screen: 'investments',
            params: { view: 'goals', robo_view: 'goals' },
          }}
        />,
      );
    });
    expect(
      tree.root.findAll(node => node.props.testID === 'cz-goals').length,
    ).toBeGreaterThan(0);
    await act(async () => tree.unmount());
  },
);
