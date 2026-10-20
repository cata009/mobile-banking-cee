import React from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import Renderer, { act } from 'react-test-renderer';
import {
  AppointmentHost,
  AppointmentPage,
  useAutoGrow,
} from '../src/experiences/pi/current/baseline/more/appointment/Ui';
import { BaselinePageHeader } from '../src/universal/BaselinePageHeader';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority';

const host: CurrentScreenProps = {
  country: 'CZ',
  release: 'release-current',
  scenario: 'active',
  language: 'en',
  productCounts: DEFAULT_VISIBLE_PRODUCT_OVERRIDES,
  route: { screen: 'appointments' },
  tokens: currentTokens(),
  t: createCurrentTranslator('CZ', 'en'),
  amountsHidden: false,
  screenTopInset: 44,
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
};

it.each(['Request a call', 'Select the location and date of the appointment'])(
  'collapses the scrolling %s title into its pinned toolbar while the footer stays fixed',
  async title => {
    let tree!: Renderer.ReactTestRenderer;
    await act(async () => {
      tree = Renderer.create(
        <AppointmentHost host={host}>
          <AppointmentPage
            title={title}
            onBack={jest.fn()}
            footer={<View testID="fixed-footer" />}
          >
            <View testID="form-content" />
          </AppointmentPage>
        </AppointmentHost>,
      );
    });
    const scroll = tree.root.findByType(ScrollView);
    expect(scroll.props.stickyHeaderIndices).toEqual([0]);
    expect(scroll.findAllByProps({ testID: 'fixed-footer' })).toHaveLength(0);
    const footer = tree.root.findByProps({ testID: 'fixed-footer' }).parent!;
    expect(
      StyleSheet.flatten(footer.props.style).paddingBottom,
    ).toBeGreaterThanOrEqual(32);
    expect(
      tree.root.findByType(BaselinePageHeader).props.renderLargeTitle,
    ).toBe(false);
    expect(
      tree.root.findByType(BaselinePageHeader).props.collapsedTitleProgress,
    ).toBe(0);
    act(() =>
      scroll.props.onScroll({ nativeEvent: { contentOffset: { y: 48 } } }),
    );
    expect(
      tree.root.findByType(BaselinePageHeader).props.collapsedTitleProgress,
    ).toBe(1);
    act(() =>
      scroll.props.onScroll({
        nativeEvent: {
          contentOffset: { y: 20 },
          contentSize: { height: 752 },
          layoutMeasurement: { height: 732 },
        },
      }),
    );
    expect(
      tree.root.findByType(BaselinePageHeader).props.collapsedTitleProgress,
    ).toBe(1);
    act(() =>
      scroll.props.onScroll({ nativeEvent: { contentOffset: { y: 0 } } }),
    );
    expect(
      tree.root.findByType(BaselinePageHeader).props.collapsedTitleProgress,
    ).toBe(0);
    await act(async () => tree.unmount());
  },
);

it('fits the complete border box and shrinks after multiline notes are deleted on web', async () => {
  const originalPlatform = Platform.OS;
  const originalTextarea = Object.getOwnPropertyDescriptor(
    globalThis,
    'HTMLTextAreaElement',
  );
  const originalComputedStyle = Object.getOwnPropertyDescriptor(
    globalThis,
    'getComputedStyle',
  );
  class MeasuredTextarea {
    style = { height: '', overflowY: '' };
    scrollHeight = 24;
  }
  const textarea = new MeasuredTextarea();
  Object.defineProperty(globalThis, 'HTMLTextAreaElement', {
    configurable: true,
    value: MeasuredTextarea,
  });
  Object.defineProperty(globalThis, 'getComputedStyle', {
    configurable: true,
    value: () => ({ borderTopWidth: '0px', borderBottomWidth: '1px' }),
  });
  Platform.OS = 'web';
  function Probe({ value }: { value: string }) {
    const grow = useAutoGrow(value, 25);
    grow.ref.current = textarea as unknown as typeof grow.ref.current;
    return <View testID="notes-height" style={{ height: grow.height }} />;
  }
  let tree!: Renderer.ReactTestRenderer;
  try {
    await act(async () => {
      tree = Renderer.create(<Probe value="" />);
    });
    const height = () =>
      StyleSheet.flatten(
        tree.root.findByProps({ testID: 'notes-height' }).props.style,
      ).height;
    expect(height()).toBe(25);
    expect(textarea.style.overflowY).toBe('hidden');
    textarea.scrollHeight = 96;
    await act(async () => {
      tree.update(<Probe value={'Long multiline notes\n'.repeat(4)} />);
    });
    expect(height()).toBe(97);
    textarea.scrollHeight = 24;
    await act(async () => {
      tree.update(<Probe value="Short" />);
    });
    expect(height()).toBe(25);
    expect(textarea.style.height).toBe('25px');
  } finally {
    if (tree) await act(async () => tree.unmount());
    Platform.OS = originalPlatform;
    if (originalTextarea)
      Object.defineProperty(
        globalThis,
        'HTMLTextAreaElement',
        originalTextarea,
      );
    else Reflect.deleteProperty(globalThis, 'HTMLTextAreaElement');
    if (originalComputedStyle)
      Object.defineProperty(
        globalThis,
        'getComputedStyle',
        originalComputedStyle,
      );
    else Reflect.deleteProperty(globalThis, 'getComputedStyle');
  }
});

it('grows and shrinks from native content measurements while preserving the one-line minimum', async () => {
  let onSize!: ReturnType<typeof useAutoGrow>['onContentSizeChange'];
  function Probe() {
    const grow = useAutoGrow('', 25);
    onSize = grow.onContentSizeChange;
    return <View testID="native-height" style={{ height: grow.height }} />;
  }
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(<Probe />);
  });
  const height = () =>
    StyleSheet.flatten(
      tree.root.findByProps({ testID: 'native-height' }).props.style,
    ).height;
  act(() => onSize({ nativeEvent: { contentSize: { height: 100 } } }));
  expect(height()).toBe(100);
  act(() => onSize({ nativeEvent: { contentSize: { height: 18 } } }));
  expect(height()).toBe(25);
  await act(async () => tree.unmount());
});
