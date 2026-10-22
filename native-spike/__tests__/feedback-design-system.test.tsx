import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Platform, StyleSheet, Text as NativeText } from 'react-native';
import Svg, { Circle, Rect, LinearGradient } from 'react-native-svg';
import {
  BaselineFeedbackSkeleton,
  BaselineProgressOutput,
  BaselineFeedbackSlider,
  BaselineLinearProgress,
  BaselineFeedbackInfo,
  BaselineNpsStars,
} from '../src/universal/BaselineFeedbackProgress';
import { SourceRangeSlider } from '../src/universal/SourceRangeSlider';
import { SourceRangeSlider as WebSourceRangeSlider } from '../src/universal/SourceRangeSlider.web';
import { VectorArtworkLayer } from '../src/universal/VectorArtworkLayer';
import { FeedbackDesignSystemPreview } from '../src/app/designSystemPreviews/feedback';
import { resolveFeedbackProgress } from '@/app/components/contracts/feedbackProgress';

const trees: Renderer.ReactTestRenderer[] = [];

it('keeps image-info copy and slider values readable on their dark surfaces', () => {
  const info = render(
    <BaselineFeedbackInfo
      variant="image"
      title="Review your options"
      paragraph="Choose the next step."
      dark
    />,
  );
  const surface = StyleSheet.flatten(
    info.root.findByProps({ testID: 'feedback-info' }).props.style,
  ).backgroundColor;
  const paragraph = info.root.findAll(
    node => node.props.children === 'Choose the next step.' && node.props.style,
  )[0]!;
  expect(StyleSheet.flatten(paragraph.props.style).color).toBe('#FFFFFF');
  expect(surface).not.toBe('#FFFFFF');
  const slider = render(
    <BaselineFeedbackSlider
      value={50}
      min={0}
      max={100}
      step={1}
      onChange={jest.fn()}
      dark
    />,
  );
  const counter = slider.root.findAll(
    node =>
      StyleSheet.flatten(node.props.style)?.width === 166 &&
      StyleSheet.flatten(node.props.style)?.minHeight === 46,
  )[0]!;
  expect(StyleSheet.flatten(counter.props.style).backgroundColor).toBe(
    '#333333',
  );
  const value = counter.findAll(
    node => node.props.children === '50' && node.props.style,
  )[0]!;
  expect(StyleSheet.flatten(value.props.style).color).toBe('#FFFFFF');
});

it('supports rating keyboard activation, arrow navigation and disabled state through the same control', () => {
  const platform = jest.replaceProperty(Platform, 'OS', 'web');
  try {
    const changed = jest.fn();
    const tree = render(<BaselineNpsStars value={2} onChange={changed} />);
    const rating = tree.root.findAll(
      node =>
        node.props.accessibilityLabel === '2 of 5 stars' &&
        typeof node.props.onKeyDown === 'function',
    )[0]!;
    const preventDefault = jest.fn();
    act(() => rating.props.onKeyDown({ key: 'ArrowRight', preventDefault }));
    expect(changed).toHaveBeenLastCalledWith(3);
    act(() => rating.props.onKeyDown({ key: ' ', preventDefault }));
    expect(changed).toHaveBeenLastCalledWith(2);
    expect(preventDefault).toHaveBeenCalledTimes(2);
    act(() =>
      tree.update(<BaselineNpsStars value={2} disabled onChange={changed} />),
    );
    const disabled = tree.root.findAll(
      node =>
        node.props.accessibilityLabel === '2 of 5 stars' &&
        typeof node.props.onKeyDown === 'function',
    )[0]!;
    act(() => disabled.props.onKeyDown({ key: 'End', preventDefault }));
    expect(changed).toHaveBeenCalledTimes(2);
  } finally {
    platform.restore();
  }
});
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
    trees.splice(0).forEach(t => t.unmount());
  });
});

it('renders the actual skeleton shapes and shared source gradient in code', () => {
  const tree = render(<BaselineFeedbackSkeleton />);
  const svg = tree.root.findByType(Svg);
  expect(svg.props).toMatchObject({ width: 375, height: 80 });
  expect(tree.root.findByType(Circle).props).toMatchObject({
    cx: 28,
    cy: 40,
    r: 16,
  });
  expect(
    tree.root
      .findAllByType(Rect)
      .map(n => [n.props.x, n.props.y, n.props.width, n.props.height]),
  ).toEqual([
    [56, 23, 128, 16],
    [56, 41, 200, 16],
  ]);
  expect(tree.root.findByType(LinearGradient).props).toMatchObject({
    x1: 256,
    x2: 12,
  });
  expect(tree.root.findAllByType(VectorArtworkLayer)).toHaveLength(0);
});

it.each([true, false])(
  'preserves the progress output geometry with title=%s and controlled fill',
  title => {
    const tree = render(
      <BaselineProgressOutput
        label={title ? 'Label' : undefined}
        value={32}
        max={title ? 190 : 327}
      />,
    );
    const track = tree.root.findByProps({ testID: 'feedback-output-track' });
    expect(StyleSheet.flatten(track.props.style)).toMatchObject({
      width: title ? 190 : 327,
      height: 32,
      borderRadius: 6,
    });
    expect(
      StyleSheet.flatten(
        tree.root.findByProps({ testID: 'feedback-output-fill' }).props.style,
      ).width,
    ).toBe(32);
    expect(track.props.accessibilityValue).toEqual({
      min: 0,
      max: title ? 190 : 327,
      now: 32,
    });
  },
);

it('derives Linear progress width from actual value instead of copying the inconsistent source40% geometry', () => {
  const tree = render(
    <BaselineLinearProgress value={40} label="LABEL" valueLabel="00:00" />,
  );
  const track = tree.root.findByProps({ testID: 'feedback-linear-track' });
  expect(track.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 40 });
  expect(
    StyleSheet.flatten(
      tree.root.findByProps({ testID: 'feedback-linear-fill' }).props.style,
    ),
  ).toMatchObject({ width: 130.8, right: 0 });
  expect(resolveFeedbackProgress({ value: 120 }).value).toBe(100);
  expect(resolveFeedbackProgress({ value: NaN }).value).toBe(0);
});

it('reuses the real range engine and emits controlled stepper changes', () => {
  const onChange = jest.fn();
  const tree = render(
    <BaselineFeedbackSlider
      label="Label"
      value={137}
      min={0}
      max={303}
      step={1}
      onChange={onChange}
    />,
  );
  expect(tree.root.findByType(SourceRangeSlider).props).toMatchObject({
    presentation: 'feedback',
    value: 137,
    min: 0,
    max: 303,
    step: 1,
  });
  act(() =>
    tree.root
      .find(
        n =>
          n.props.accessibilityLabel === 'Increase value' &&
          typeof n.props.onPress === 'function',
      )
      .props.onPress(),
  );
  expect(onChange).toHaveBeenLastCalledWith(138);
  act(() =>
    tree.root
      .find(
        n =>
          n.props.accessibilityLabel === 'Decrease value' &&
          typeof n.props.onPress === 'function',
      )
      .props.onPress(),
  );
  expect(onChange).toHaveBeenLastCalledWith(136);
});

it('keeps both range presentations and the existing drag/adjustable value engine', () => {
  const onChange = jest.fn();
  const tree = render(
    <SourceRangeSlider
      label="Range"
      value={137}
      min={0}
      max={303}
      step={1}
      onChange={onChange}
      color="#007A91"
      presentation="feedback"
    />,
  );
  const root = tree.root.find(
    n =>
      n.props.accessibilityRole === 'adjustable' &&
      typeof n.props.onLayout === 'function',
  );
  act(() => root.props.onLayout({ nativeEvent: { layout: { width: 327 } } }));
  act(() => root.props.onResponderGrant({ nativeEvent: { locationX: 149 } }));
  expect(onChange).toHaveBeenLastCalledWith(137);
  expect(
    StyleSheet.flatten(
      tree.root.findByProps({ testID: 'feedback-range-thumb' }).props.style,
    ),
  ).toMatchObject({ width: 24, height: 24, left: 137 });
  act(() =>
    tree.update(
      <SourceRangeSlider
        label="Range"
        value={50}
        min={0}
        max={100}
        step={1}
        onChange={onChange}
        color="#007A91"
      />,
    ),
  );
  expect(
    StyleSheet.flatten(
      tree.root.find(
        n =>
          n.props.accessibilityRole === 'adjustable' &&
          typeof n.props.onLayout === 'function',
      ).props.style,
    ).height,
  ).toBe(20);
});

it('uses source Info slots and real typography without flattening the component', () => {
  const tree = render(
    <BaselineFeedbackInfo
      variant="image"
      title="Access with the Touch ID"
      paragraph="A contextual message."
    />,
  );
  expect(
    StyleSheet.flatten(
      tree.root.findByProps({ testID: 'feedback-info' }).props.style,
    ),
  ).toMatchObject({
    width: 391,
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 24,
  });
  expect(
    StyleSheet.flatten(
      tree.root.findByProps({ testID: 'feedback-info-placeholder' }).props
        .style,
    ),
  ).toMatchObject({ width: 343, height: 160, borderRadius: 8 });
  expect(tree.root.findAllByType(VectorArtworkLayer)).toHaveLength(1);
  expect(
    tree.root
      .findAllByType(NativeText)
      .some(n => n.props.children === 'Access with the Touch ID'),
  ).toBe(true);
});

it('renders five controlled NPS choices with the original separate star glyphs', () => {
  const onChange = jest.fn();
  const tree = render(<BaselineNpsStars value={3} onChange={onChange} />);
  const stars = tree.root.findAll(
    n =>
      n.props.accessibilityRole === 'radio' &&
      typeof n.props.onPress === 'function',
  );
  expect(stars).toHaveLength(5);
  expect(stars.map(n => n.props.accessibilityState.checked)).toEqual([
    false,
    false,
    true,
    false,
    false,
  ]);
  expect(tree.root.findAllByType(VectorArtworkLayer)).toHaveLength(5);
  act(() => stars[4]!.props.onPress());
  expect(onChange).toHaveBeenCalledWith(5);
  expect(
    StyleSheet.flatten(
      tree.root.findByProps({ testID: 'feedback-nps-stars' }).props.style,
    ),
  ).toMatchObject({ gap: 16 });
});

it('exports a real interactive feedback preview without any authorization/business controller', () => {
  const tree = render(
    <FeedbackDesignSystemPreview
      componentId="ui.feedback-slider"
      variantId="default"
      dark={false}
    />,
  );
  expect(tree.root.findByType(BaselineFeedbackSlider).props.value).toBe(137);
  act(() =>
    tree.root
      .find(
        n =>
          n.props.accessibilityLabel === 'Increase value' &&
          typeof n.props.onPress === 'function',
      )
      .props.onPress(),
  );
  expect(tree.root.findByType(BaselineFeedbackSlider).props.value).toBe(138);
});

it('preserves the actual browser range and its controlled change callback in both presentations', () => {
  const onChange = jest.fn();
  const tree = render(
    <WebSourceRangeSlider
      label="Range"
      min={0}
      max={303}
      step={1}
      value={137}
      onChange={onChange}
      color="#007A91"
      presentation="feedback"
    />,
  );
  const input = tree.root.findByType('input');
  expect(input.props).toMatchObject({
    type: 'range',
    min: 0,
    max: 303,
    step: 1,
    value: 137,
    'aria-label': 'Range',
  });
  act(() => input.props.onChange({ target: { value: '138' } }));
  expect(onChange).toHaveBeenCalledWith(138);
  act(() =>
    tree.update(
      <WebSourceRangeSlider
        label="Range"
        min={0}
        max={100}
        step={1}
        value={50}
        onChange={onChange}
        color="#007A91"
      />,
    ),
  );
  expect(tree.root.findByType('input').props.style).toMatchObject({
    height: 20,
  });
  expect(tree.root.findByType('input').props.style.opacity).toBeUndefined();
});

it.each(['text', 'icon'] as const)(
  'keeps the authored Info %s presentation as text and layers',
  variant => {
    const tree = render(
      <BaselineFeedbackInfo
        variant={variant}
        title="A contextual title"
        paragraph="A contextual message."
      />,
    );
    expect(
      StyleSheet.flatten(
        tree.root.findByProps({ testID: 'feedback-info' }).props.style,
      ),
    ).toMatchObject({ width: variant === 'text' ? 375 : 376 });
    expect(tree.root.findAllByType(VectorArtworkLayer)).toHaveLength(0);
    expect(
      tree.root
        .findAllByType(NativeText)
        .some(n => n.props.children === 'A contextual message.'),
    ).toBe(true);
  },
);
