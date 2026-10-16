import React from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import Renderer, { act } from 'react-test-renderer';
import Detail from '../src/experiences/pi/current/baseline/offers/Detail';
import ProductSheet from '../src/experiences/pi/current/baseline/offers/ProductSheet';
import { RasterImage } from '../src/experiences/pi/current/baseline/offers/RasterImage';
import { FaceIdOverlay } from '../src/experiences/pi/current/baseline/FaceIdOverlay';
import { BaselinePageHeader } from '../src/universal/BaselinePageHeader';
import { BaselineTextField } from '../src/universal/BaselineTextField';
import { BaselineNavigationRow } from '../src/universal/BaselineNavigationRow';
import { SourceBottomSheet } from '../src/universal/SourceBottomSheet';
import { PrimaryButton } from '../src/universal/PrimaryButton';
import { currentTokens } from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import {
  getProductCardSheetConfig,
  getProductsMenuForCountry,
} from '@/app/config/productsMenuConfig';
import { getProductDetailContent } from '@/features/products/evoProductDetail';

function host(extra: Partial<CurrentScreenProps> = {}): CurrentScreenProps {
  return {
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
    route: {
      screen: 'product-detail',
      params: {
        title: 'Current account',
        cardId: 'account',
        optionId: 'current-account',
      },
    },
    tokens: currentTokens(),
    t: (_key, fallback) => fallback ?? _key,
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
}
async function renderDetail(props = host()) {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<Detail {...props} />);
  });
  return { tree, props };
}
const action = (tree: Renderer.ReactTestRenderer) =>
  tree.root.findByType(PrimaryButton);
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('detail retains canonical Source copy, inert Help and 64px collapsing title', async () => {
  const { tree } = await renderDetail();
  const content = getProductDetailContent(
    'current-account',
    'account',
    'Current account',
  );
  for (const text of [content.heading, ...content.body])
    expect(JSON.stringify(tree.toJSON())).toContain(text);
  expect(action(tree).props.label).toBe('Start application');
  const header = tree.root.findByType(BaselinePageHeader);
  expect(header.props.includeSafeArea).toBe(true);
  expect(header.props.safeAreaReserve).toBe(54);
  expect(header.props.onHelpPress).toBeUndefined();
  await act(() =>
    tree.root
      .findByType(ScrollView)
      .props.onScroll({ nativeEvent: { contentOffset: { y: 32 } } }),
  );
  expect(
    tree.root.findByType(BaselinePageHeader).props.collapsedTitleProgress,
  ).toBe(0.5);
  const artwork = tree.root.findByType(RasterImage);
  expect(StyleSheet.flatten(artwork.props.style).aspectRatio).toBe(327 / 160);
  expect(StyleSheet.flatten(artwork.props.style).top).toBe(0);
  const frame = tree.root.findByProps({
    testID: 'ro-product-detail-image-frame',
  });
  expect(StyleSheet.flatten(frame.props.style).aspectRatio).toBe(12 / 5);
  expect(StyleSheet.flatten(frame.props.style).overflow).toBe('hidden');
  expect(artwork.props.resizeMode).toBe('cover');
  await act(() => tree.unmount());
});

test('insurance quote follows Source editable PIN, Face ID delay and completion back', async () => {
  const props = host({
    route: {
      screen: 'product-detail',
      params: {
        title: 'Home insurance',
        cardId: 'insurance',
        optionId: 'home-insurance',
      },
    },
  });
  const { tree } = await renderDetail(props);
  expect(action(tree).props.label).toBe('Get a quote');
  await act(() => action(tree).props.onPress());
  expect(tree.root.findByType(BaselinePageHeader).props.title).toBe(
    'Apply for Home insurance',
  );
  expect(tree.root.findByType(BaselinePageHeader).props.showHelp).toBe(false);
  const pin = tree.root.findByType(BaselineTextField);
  expect(pin.props.label).toBe('Mobile banking PIN');
  expect(pin.props.value).toBe('******');
  expect(pin.props.helperText).toBe('Confirm you want to send this request.');
  await act(() => pin.props.onChange('123456'));
  expect(tree.root.findByType(BaselineTextField).props.value).toBe('123456');
  expect(action(tree).props.label).toBe('Send request');
  await act(() => action(tree).props.onPress());
  expect(tree.root.findAllByType(FaceIdOverlay)).toHaveLength(1);
  expect(action(tree).props.disabled).toBe(true);
  await act(() => jest.advanceTimersByTime(839));
  expect(action(tree).props.disabled).toBe(true);
  await act(() => jest.advanceTimersByTime(1));
  expect(tree.root.findAllByType(BaselinePageHeader)).toHaveLength(0);
  expect(JSON.stringify(tree.toJSON())).toContain(
    'We received your request for Home insurance. You can follow it in My applications.',
  );
  expect(action(tree).props.label).toBe('Back to products');
  await act(() => action(tree).props.onPress());
  expect(props.onBack).toHaveBeenCalledTimes(1);
  expect(props.onChanged).not.toHaveBeenCalled();
  await act(() => tree.unmount());
});

test('local Sign Back consumes host Back and cancels pending authentication before detail remount', async () => {
  const register = jest.fn(),
    props = host({ onBackHandlerChange: register });
  const { tree } = await renderDetail(props);
  const back = () => register.mock.calls.at(-1)![0] as () => boolean;
  expect(back()()).toBe(false);
  await act(() => action(tree).props.onPress());
  await act(() => action(tree).props.onPress());
  await act(() => expect(back()()).toBe(true));
  expect(action(tree).props.label).toBe('Start application');
  await act(() => jest.advanceTimersByTime(840));
  expect(action(tree).props.label).toBe('Start application');
  expect(props.onBack).not.toHaveBeenCalled();
  await act(() => action(tree).props.onPress());
  expect(tree.root.findByType(BaselineTextField).props.value).toBe('******');
  await act(() => tree.root.findByType(BaselinePageHeader).props.onBack());
  expect(action(tree).props.label).toBe('Start application');
  await act(() => tree.unmount());
  expect(register).toHaveBeenLastCalledWith(null);
});

test.each(
  getProductsMenuForCountry('RO').products.map(
    card => [card.id, card] as const,
  ),
)(
  '%s sheet retains Source option order and closes before routing each selected option',
  async (_id, card) => {
    const props = host(),
      onClose = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    await act(() => {
      tree = Renderer.create(
        <ProductSheet host={props} card={card} onClose={onClose} />,
      );
    });
    const config = getProductCardSheetConfig(card.id, 'RO');
    expect(tree.root.findByType(SourceBottomSheet).props.title).toBe(
      config.title ?? card.title.replace(/\n/g, ' '),
    );
    const rows = tree.root.findAllByType(BaselineNavigationRow);
    expect(rows.map(row => row.props.title)).toEqual(
      config.options.map(option => option.title),
    );
    for (const [index, option] of config.options.entries()) {
      await act(() => rows[index]!.props.onPress());
      expect(onClose).toHaveBeenCalledTimes(index + 1);
      expect(props.onNavigate).toHaveBeenLastCalledWith({
        screen: 'product-detail',
        params: { title: option.title, cardId: card.id, optionId: option.id },
      });
      const navigated = props.onNavigate as jest.Mock;
      expect(onClose.mock.invocationCallOrder[index]).toBeLessThan(
        navigated.mock.invocationCallOrder[index]!,
      );
    }
    await act(() => tree.root.findByType(SourceBottomSheet).props.onClose());
    expect(props.onNavigate).toHaveBeenCalledTimes(config.options.length);
    await act(() => tree.unmount());
  },
);

test('web sheet avoids a compositing transform while keeping the Source product preset', async () => {
  const platform = jest.replaceProperty(Platform, 'OS', 'web');
  const card = getProductsMenuForCountry('RO').products[0]!;
  let tree!: Renderer.ReactTestRenderer;
  try {
    await act(() => {
      tree = Renderer.create(
        <ProductSheet host={host()} card={card} onClose={jest.fn()} />,
      );
    });
    const sheet = tree.root.findByType(SourceBottomSheet);
    expect(StyleSheet.flatten(sheet.props.scrollStyle)).toEqual({
      transform: 'none',
    });
    await act(() => tree.unmount());
  } finally {
    platform.restore();
  }
});
