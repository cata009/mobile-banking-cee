import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet, Text as NativeText, View } from 'react-native';
import {
  BaselineMobileCode,
  BaselineMobileCodeKeypad,
  BaselineMobileCodeProgress,
} from '../src/universal/BaselineMobileCode';
import { AssetGlyph } from '../src/universal/AssetGlyph';
import { TypographyProvider } from '../src/universal/Typography';
import { MobileCodeDesignSystemPreview } from '../src/app/designSystemPreviews/mobileCode';
import { resolveMobileCodeProgress } from '@/app/components/contracts/mobileCode';

const trees: Renderer.ReactTestRenderer[] = [];
function render(node: React.ReactElement) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(node);
  });
  trees.push(tree);
  return tree;
}
afterEach(() => {
  act(() => {
    trees.splice(0).forEach(tree => tree.unmount());
  });
});

it.each([
  [6, 152],
  [7, 180],
  [8, 208],
] as const)(
  'keeps %s-digit progress at its authored width without exposing code',
  (digits, width) => {
    const tree = render(
      <BaselineMobileCodeProgress digits={digits} enteredDigits={3} />,
    );
    const progress = tree.root.findByProps({ testID: 'mobile-code-progress' });
    expect(StyleSheet.flatten(progress.props.style)).toMatchObject({
      width,
      height: 12,
      gap: 16,
    });
    expect(progress.props.accessibilityLabel).toBe(
      `3 of ${digits} digits entered`,
    );
    expect(progress.props.accessibilityValue).toEqual({
      min: 0,
      max: digits,
      now: 3,
    });
    const dots = tree.root.findAll(
      n =>
        typeof n.props.testID === 'string' &&
        /^mobile-code-dot-\d+$/.test(n.props.testID) &&
        n.type === View,
    );
    expect(dots).toHaveLength(digits);
    expect(
      dots.filter(
        n => StyleSheet.flatten(n.props.style).backgroundColor === '#007A91',
      ),
    ).toHaveLength(3);
    expect(tree.root.findAllByType(NativeText)).toHaveLength(0);
  },
);

it('clamps a progress count to the supplied public digit count', () => {
  expect(
    resolveMobileCodeProgress({ digits: 6, enteredDigits: -4 }).enteredDigits,
  ).toBe(0);
  expect(
    resolveMobileCodeProgress({ digits: 8, enteredDigits: 12 }).enteredDigits,
  ).toBe(8);
  expect(
    resolveMobileCodeProgress({ digits: 7, enteredDigits: NaN }).enteredDigits,
  ).toBe(0);
});

it('renders the source keypad geometry and forwards digit, delete and biometric actions', () => {
  const onDigit = jest.fn(),
    onDelete = jest.fn(),
    onBiometric = jest.fn();
  const tree = render(
    <BaselineMobileCodeKeypad
      onDigit={onDigit}
      onDelete={onDelete}
      onBiometric={onBiometric}
    />,
  );
  expect(
    StyleSheet.flatten(
      tree.root.findByProps({ testID: 'mobile-code-keypad' }).props.style,
    ),
  ).toMatchObject({ width: 280, gap: 24 });
  const keys = tree.root.findAll(
    n =>
      n.props.accessibilityRole === 'button' &&
      typeof n.props.onPress === 'function',
  );
  expect(keys).toHaveLength(12);
  keys.forEach(key =>
    expect(StyleSheet.flatten(key.props.style)).toMatchObject({
      width: 88,
      minHeight: 48,
    }),
  );
  act(() =>
    keys.find(k => k.props.accessibilityLabel === 'Digit 7')!.props.onPress(),
  );
  act(() =>
    keys
      .find(k => k.props.accessibilityLabel === 'Delete last digit')!
      .props.onPress(),
  );
  act(() =>
    keys
      .find(k => k.props.accessibilityLabel === 'Use Face ID')!
      .props.onPress(),
  );
  expect(onDigit).toHaveBeenCalledWith('7');
  expect(onDelete).toHaveBeenCalledTimes(1);
  expect(onBiometric).toHaveBeenCalledTimes(1);
});

it('leaves the no-biometric cell noninteractive and prevents disabled actions', () => {
  const onDigit = jest.fn(),
    onDelete = jest.fn();
  const tree = render(
    <BaselineMobileCodeKeypad
      biometric="none"
      onDigit={onDigit}
      onDelete={onDelete}
      disabled
    />,
  );
  const keys = tree.root.findAll(
    n =>
      n.props.accessibilityRole === 'button' &&
      typeof n.props.onPress === 'function',
  );
  expect(keys).toHaveLength(11);
  expect(
    tree.root.findByProps({ testID: 'mobile-code-empty-cell' }).props
      .accessible,
  ).toBe(false);
  keys.forEach(key => {
    expect(key.props.disabled).toBe(true);
    act(() => key.props.onPress());
  });
  expect(onDigit).not.toHaveBeenCalled();
  expect(onDelete).not.toHaveBeenCalled();
});

it('uses original Face ID/fingerprint artwork and the source rendered viewport', () => {
  const tree = render(
    <BaselineMobileCodeKeypad
      biometric="face-id"
      onDigit={() => {}}
      onDelete={() => {}}
      onBiometric={() => {}}
    />,
  );
  let glyphs = tree.root.findAllByType(AssetGlyph);
  expect(glyphs[0]!.props).toMatchObject({
    width: 88 / 3,
    height: 88 / 3,
    tintColor: '#262626',
  });
  expect(glyphs[1]!.props).toMatchObject({ width: 32, height: 32 });
  act(() =>
    tree.update(
      <BaselineMobileCodeKeypad
        biometric="fingerprint"
        onDigit={() => {}}
        onDelete={() => {}}
        onBiometric={() => {}}
      />,
    ),
  );
  glyphs = tree.root.findAllByType(AssetGlyph);
  expect(glyphs[0]!.props).toMatchObject({
    width: 32,
    height: 32,
    tintColor: '#262626',
  });
});

it('keeps entry spacing and recovery controlled by its host', () => {
  const onRecover = jest.fn();
  const tree = render(
    <BaselineMobileCode
      enteredDigits={2}
      onDigit={() => {}}
      onDelete={() => {}}
      onBiometric={() => {}}
      onRecover={onRecover}
    />,
  );
  expect(
    StyleSheet.flatten(
      tree.root.findByProps({ testID: 'mobile-code-entry' }).props.style,
    ),
  ).toMatchObject({ width: 375, paddingHorizontal: 15 });
  expect(
    StyleSheet.flatten(
      tree.root.findByProps({ testID: 'mobile-code-progress-slot' }).props
        .style,
    ),
  ).toMatchObject({ marginTop: 74 });
  expect(
    StyleSheet.flatten(
      tree.root.findByProps({ testID: 'mobile-code-keypad-slot' }).props.style,
    ),
  ).toMatchObject({ marginTop: 60 });
  const recovery = tree.root.find(
    n =>
      n.props.accessibilityLabel === 'Forgot your passcode' &&
      typeof n.props.onPress === 'function',
  );
  expect(StyleSheet.flatten(recovery!.props.style)).toMatchObject({
    marginTop: 34,
    minHeight: 44,
  });
  act(() => recovery!.props.onPress());
  expect(onRecover).toHaveBeenCalledTimes(1);
});

it('scales real text rather than clipping digits to a fixed text height', () => {
  const tree = render(
    <TypographyProvider scale={2}>
      <BaselineMobileCodeKeypad
        biometric="none"
        onDigit={() => {}}
        onDelete={() => {}}
      />
    </TypographyProvider>,
  );
  const digit = tree.root
    .findAllByType(NativeText)
    .find(n => n.props.children === '1');
  expect(StyleSheet.flatten(digit!.props.style)).toMatchObject({
    fontSize: 64,
    lineHeight: 72,
    minHeight: 40,
  });
  expect(StyleSheet.flatten(digit!.props.style).height).toBeUndefined();
});

it('exports one interactive composition with digit, biometric and progress controls', () => {
  const tree = render(
    <MobileCodeDesignSystemPreview
      componentId="ui.mobile-code"
      variantId="7-partial"
      dark={false}
    />,
  );
  expect(tree.root.findByType(BaselineMobileCode).props).toMatchObject({
    digits: 7,
    enteredDigits: 3,
    biometric: 'face-id',
  });
  act(() =>
    tree.root
      .find(
        n =>
          n.props.accessibilityLabel === 'Digit 4' &&
          typeof n.props.onPress === 'function',
      )
      .props.onPress(),
  );
  expect(tree.root.findByType(BaselineMobileCode).props.enteredDigits).toBe(4);
  act(() =>
    tree.root
      .find(
        n =>
          n.props.accessibilityLabel === 'Fingerprint variant' &&
          typeof n.props.onPress === 'function',
      )
      .props.onPress(),
  );
  expect(tree.root.findByType(BaselineMobileCode).props.biometric).toBe(
    'fingerprint',
  );
});

it.each([6, 7, 8])(
  'maps the authored %s-digit Partial variant to three filled dots',
  digits => {
    const tree = render(
      <MobileCodeDesignSystemPreview
        componentId="ui.mobile-code"
        variantId={`${digits}-partial`}
        dark={false}
      />,
    );
    expect(tree.root.findByType(BaselineMobileCode).props.enteredDigits).toBe(
      3,
    );
  },
);
