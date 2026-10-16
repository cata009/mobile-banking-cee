import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import Products from '../src/experiences/pi/current/products/Products';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority';
import { getProductsMenuForCountry } from '@/app/config/productsMenuConfig';
test('baseline Products is a primary page and preserves original product illustration cards', async () => {
  const host: CurrentScreenProps = {
    country: 'RO',
    release: 'release-current',
    scenario: 'active',
    language: 'en',
    productCounts: DEFAULT_VISIBLE_PRODUCT_OVERRIDES,
    tokens: currentTokens(),
    t: createCurrentTranslator('RO', 'en'),
    route: { screen: 'products' },
    amountsHidden: false,
    screenTopInset: 54,
    isActive: true,
    onBack: jest.fn(),
    onNavigate: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    mode: 'light',
    onModeChange: jest.fn(),
  };
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(<Products {...host} />);
  });
  expect(
    tree.root.findAll(n => n.props.accessibilityLabel === 'Back'),
  ).toHaveLength(0);
  for (const card of getProductsMenuForCountry('RO').products) {
    expect(
      tree.root.findAll(n => n.props.testID === `source-menu-card-${card.id}`),
    ).not.toHaveLength(0);
  }
  await act(async () => tree.unmount());
});
