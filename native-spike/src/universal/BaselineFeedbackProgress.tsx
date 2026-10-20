import React, { useId, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { resolveFeedbackProgress } from '@/app/components/contracts/feedbackProgress';
import emptyStar from '@/assets/design-system/feedback/nps-empty.svg';
import selectedStar from '@/assets/design-system/feedback/nps-selected.svg';
import placeholderLabel from '@/assets/design-system/feedback/placeholder-label.svg';
import incrementIcon from '@/assets/design-system/feedback/increment.svg';
import decrementIcon from '@/assets/design-system/feedback/decrement.svg';
import { SourceRangeSlider } from './SourceRangeSlider';
import { AssetGlyph } from './AssetGlyph';
import { VectorArtworkLayer } from './VectorArtworkLayer';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';

/** Original Boolean-operation primitives, not a flattened loading image. */
export function BaselineFeedbackSkeleton({
  label = 'Loading content',
}: {
  label?: string;
}) {
  const id = `skeleton-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
    >
      <Svg
        width={375}
        height={80}
        viewBox="0 0 375 80"
        accessible={false}
        accessibilityElementsHidden
      >
        <Defs>
          <LinearGradient
            id={id}
            x1={256}
            y1={40}
            x2={12}
            y2={40}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset={0} stopColor="#e6e6e6" />
            <Stop offset={0.34889182448387146} stopColor="#ffffff" />
            <Stop offset={1} stopColor="#f5f5f5" />
          </LinearGradient>
        </Defs>
        <Circle cx={28} cy={40} r={16} fill={`url(#${id})`} />
        <Rect x={56} y={23} width={128} height={16} fill={`url(#${id})`} />
        <Rect x={56} y={41} width={200} height={16} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

type ProgressProps = {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  minLabel?: string;
  maxLabel?: string;
  dark?: boolean;
};

function Legend({
  minLabel,
  maxLabel,
  dark,
}: {
  minLabel: string;
  maxLabel: string;
  dark: boolean;
}) {
  const color = sourceColor('var(--uc-text)', dark);
  return (
    <View style={s.legend}>
      <Text style={[s.body14, { color }]}>{minLabel}</Text>
      <Text style={[s.body14, { color }]}>{maxLabel}</Text>
    </View>
  );
}

export function BaselineProgressOutput({
  value,
  min = 0,
  max = 100,
  label,
  minLabel = 'Label min',
  maxLabel = 'Label max',
  dark = false,
}: ProgressProps) {
  const width = label ? 190 : 327;
  const state = resolveFeedbackProgress({ value, min, max, width });
  const color = sourceColor('var(--uc-text)', dark);
  return (
    <View style={[s.output, label ? s.outputWithTitle : s.outputWithoutTitle]}>
      {label ? (
        <Text style={[s.label14, { width: 121, color }]}>
          {label.toUpperCase()}
        </Text>
      ) : null}
      <View style={{ width, minHeight: label ? 57 : undefined }}>
        <View
          testID="feedback-output-track"
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={label ?? 'Progress'}
          accessibilityValue={{ min, max, now: state.value }}
          style={[s.outputTrack, { width }]}
        >
          <View style={[s.trackPaint, { borderRadius: 6 }]} />
          <View
            testID="feedback-output-fill"
            style={[
              s.outputFill,
              {
                width: state.fillWidth,
                backgroundColor: sourceColor('var(--uc-action-strong)', dark),
              },
            ]}
          />
        </View>
        <View style={{ marginTop: 8 }}>
          <Legend minLabel={minLabel} maxLabel={maxLabel} dark={dark} />
        </View>
      </View>
    </View>
  );
}

export function BaselineLinearProgress({
  value,
  min = 0,
  max = 100,
  label = 'LABEL',
  valueLabel = '00:00',
  dark = false,
}: ProgressProps & { valueLabel?: string }) {
  const state = resolveFeedbackProgress({ value, min, max, width: 327 });
  const color = sourceColor('var(--uc-text)', dark);
  return (
    <View style={s.linear}>
      <View style={s.linearLabels}>
        <Text style={[s.label14, { color }]}>{label}</Text>
        <Text style={[s.value24, { color }]}>{valueLabel}</Text>
      </View>
      <View
        testID="feedback-linear-track"
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={label}
        accessibilityValue={{ min, max, now: state.value }}
        style={s.linearTrack}
      >
        <View style={[s.trackPaint, { borderRadius: 4 }]} />
        <View
          testID="feedback-linear-fill"
          style={[
            s.linearFill,
            {
              width: state.fillWidth,
              backgroundColor: sourceColor('var(--uc-action-strong)', dark),
            },
          ]}
        />
      </View>
    </View>
  );
}

export function BaselineFeedbackSlider({
  label = 'Label',
  value,
  min,
  max,
  step,
  onChange,
  valueLabel,
  minLabel = 'Label min',
  maxLabel = 'Label max',
  dark = false,
}: {
  label?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  valueLabel?: string;
  minLabel?: string;
  maxLabel?: string;
  dark?: boolean;
}) {
  const color = sourceColor('var(--uc-text)', dark);
  const shift = (amount: number) =>
    onChange(
      resolveFeedbackProgress({ value: value + amount, min, max }).value,
    );
  return (
    <View style={s.slider}>
      <Text style={[s.label14, { color }]}>{label.toUpperCase()}</Text>
      <View style={s.sliderBody}>
        <View style={s.counter}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Decrease value"
            accessibilityState={{ disabled: value <= min }}
            disabled={value <= min}
            hitSlop={12}
            onPress={() => {
              if (value > min) shift(-step);
            }}
            style={s.counterAction}
          >
            <AssetGlyph
              asset={decrementIcon}
              width={20}
              height={20}
              tintColor={color}
            />
          </Pressable>
          <View
            style={[
              s.counterValue,
              {
                backgroundColor: sourceColor('var(--uc-surface)', dark),
                borderColor: sourceColor('var(--uc-text-muted)', dark),
              },
            ]}
          >
            <Text style={[s.value24, { color }]}>
              {valueLabel ?? String(value)}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Increase value"
            accessibilityState={{ disabled: value >= max }}
            disabled={value >= max}
            hitSlop={12}
            onPress={() => {
              if (value < max) shift(step);
            }}
            style={s.counterAction}
          >
            <AssetGlyph
              asset={incrementIcon}
              width={20}
              height={20}
              tintColor={color}
            />
          </Pressable>
        </View>
        <View style={s.sliderBottom}>
          <View style={s.rangeSlot}>
            <View style={s.rangePosition}>
              <SourceRangeSlider
                presentation="feedback"
                label={label}
                value={value}
                min={min}
                max={max}
                step={step}
                onChange={onChange}
                color={sourceColor('var(--uc-action-strong)', dark)}
              />
            </View>
          </View>
          <Legend minLabel={minLabel} maxLabel={maxLabel} dark={dark} />
        </View>
      </View>
    </View>
  );
}

export function BaselineFeedbackInfo({
  variant = 'text',
  title,
  paragraph,
  image,
  icon,
  dark = false,
}: {
  variant?: 'image' | 'text' | 'icon';
  title?: string;
  paragraph: string;
  image?: React.ReactNode;
  icon?: React.ReactNode;
  dark?: boolean;
}) {
  const color =
    variant === 'image' && !dark
      ? '#333333'
      : sourceColor('var(--uc-text)', dark);
  return (
    <View
      testID="feedback-info"
      style={[
        s.info,
        variant === 'image'
          ? s.infoImage
          : variant === 'icon'
          ? s.infoIcon
          : s.infoText,
        { backgroundColor: sourceColor('var(--uc-surface)', dark) },
      ]}
    >
      {variant === 'image'
        ? image ?? (
            <View
              testID="feedback-info-placeholder"
              style={s.placeholder}
              accessible={false}
            >
              <VectorArtworkLayer
                asset={placeholderLabel}
                x={(343 - 121.403) / 2}
                y={(160 - 24.106) / 2}
                width={121.403}
                height={24.106}
              />
            </View>
          )
        : null}
      {variant === 'icon' ? (
        <>
          <View style={s.infoIconSlot} accessible={false}>
            {icon ?? <View style={s.emptyIcon} />}
          </View>
          <Text style={[s.iconParagraph, { color }]}>{paragraph}</Text>
        </>
      ) : (
        <View style={s.infoCopy}>
          {title ? (
            <Text accessibilityRole="header" style={[s.infoTitle, { color }]}>
              {title}
            </Text>
          ) : null}
          <Text style={[s.infoParagraph, { color }]}>{paragraph}</Text>
        </View>
      )}
    </View>
  );
}

export function BaselineNpsStars({
  value = 0,
  onChange,
  description,
  disabled = false,
  dark = false,
}: {
  value?: number;
  onChange?: (value: number) => void;
  description?: string;
  disabled?: boolean;
  dark?: boolean;
}) {
  const controls = useRef<Array<React.ComponentRef<typeof View> | null>>([]);
  const [focused, setFocused] = useState<number | null>(null);
  const selected = Math.max(
    0,
    Math.min(5, Number.isFinite(value) ? Math.floor(value) : 0),
  );
  const keyboardProps = (
    rating: number,
  ): Pick<React.ComponentProps<typeof Pressable>, 'onKeyDown'> =>
    Platform.OS === 'web'
      ? {
          onKeyDown: event => {
            if (disabled || !onChange) return;
            const key: unknown = Reflect.get(event, 'key');
            const next =
              key === 'ArrowRight' || key === 'ArrowDown'
                ? (rating % 5) + 1
                : key === 'ArrowLeft' || key === 'ArrowUp'
                ? ((rating + 3) % 5) + 1
                : key === 'Home'
                ? 1
                : key === 'End'
                ? 5
                : key === ' ' || key === 'Spacebar'
                ? rating
                : undefined;
            if (next !== undefined) {
              event.preventDefault();
              if (
                (key === ' ' || key === 'Spacebar') &&
                Reflect.get(event, 'repeat') === true
              )
                return;
              onChange(next);
              controls.current[next - 1]?.focus();
            }
          },
        }
      : {};
  return (
    <View style={s.nps}>
      <View
        testID="feedback-nps-stars"
        accessibilityRole="radiogroup"
        accessibilityLabel="Rating"
        style={s.stars}
      >
        {[1, 2, 3, 4, 5].map(rating => (
          <Pressable
            key={rating}
            ref={node => {
              controls.current[rating - 1] = node;
            }}
            {...keyboardProps(rating)}
            {...(Platform.OS === 'web'
              ? {
                  tabIndex:
                    selected === rating || (!selected && rating === 1) ? 0 : -1,
                }
              : {})}
            accessibilityRole="radio"
            accessibilityLabel={`${rating} of 5 stars`}
            accessibilityState={{
              checked: selected === rating,
              disabled: disabled || !onChange,
            }}
            disabled={disabled || !onChange}
            hitSlop={6}
            onPress={() => {
              if (!disabled) onChange?.(rating);
            }}
            onFocus={() => setFocused(rating)}
            onBlur={() => setFocused(null)}
            style={[
              s.star,
              Platform.OS === 'web'
                ? {
                    outlineStyle: 'solid',
                    outlineWidth: focused === rating ? 2 : 0,
                    outlineOffset: 2,
                    outlineColor: sourceColor('var(--uc-action)', dark),
                  }
                : undefined,
            ]}
          >
            <VectorArtworkLayer
              asset={rating <= selected ? selectedStar : emptyStar}
              x={rating <= selected ? 0 : -1}
              y={rating <= selected ? 0 : -1}
              width={rating <= selected ? 32 : 34.1699}
              height={rating <= selected ? 32 : 34.2518}
            />
          </Pressable>
        ))}
      </View>
      <Text
        accessibilityLiveRegion="polite"
        style={[s.body14, { color: sourceColor('var(--uc-text)', dark) }]}
      >
        {description ?? (selected ? 'Value description' : 'Select value')}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  body14: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 15,
    includeFontPadding: false,
  },
  label14: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 15,
    includeFontPadding: false,
  },
  value24: {
    fontFamily: 'UniCredit-bold',
    fontSize: 24,
    lineHeight: 26,
    includeFontPadding: false,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  output: { width: 375, paddingHorizontal: 24 },
  outputWithTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 57,
  },
  outputWithoutTitle: { paddingVertical: 16 },
  outputTrack: { height: 32, borderRadius: 6, overflow: 'hidden' },
  trackPaint: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: '#909090',
    backgroundColor: '#e5e5e5',
  },
  outputFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 32,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  linear: { width: 327, gap: 8 },
  linearLabels: {
    minHeight: 30,
    paddingVertical: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linearTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  linearFill: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: 8,
    borderRadius: 4,
  },
  slider: { width: 375, paddingHorizontal: 24, gap: 12 },
  sliderBody: { width: 327, alignItems: 'center', gap: 18 },
  counter: {
    width: 222,
    minHeight: 46,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  counterAction: {
    width: 20,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValue: {
    width: 166,
    minHeight: 46,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#666666',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderBottom: { width: 327, gap: 16 },
  rangeSlot: { height: 8, width: 327 },
  rangePosition: { position: 'absolute', left: 0, right: 0, top: -8 },
  info: { gap: 24 },
  infoText: { width: 375, padding: 24 },
  infoImage: { width: 391, paddingHorizontal: 24, paddingVertical: 16 },
  infoIcon: {
    width: 376,
    minHeight: 51.825653076171875,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoIconSlot: { width: 32, height: 32 },
  emptyIcon: { width: 32, height: 32, backgroundColor: '#f5f5f5' },
  iconParagraph: {
    flex: 1,
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 18,
    includeFontPadding: false,
  },
  infoCopy: { alignSelf: 'stretch', gap: 24 },
  infoTitle: {
    fontFamily: 'UniCredit-bold',
    fontSize: 20,
    lineHeight: 22,
    includeFontPadding: false,
  },
  infoParagraph: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 20,
    includeFontPadding: false,
  },
  placeholder: {
    width: 343,
    height: 160,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  nps: { width: 375, paddingHorizontal: 24, gap: 16 },
  stars: { flexDirection: 'row', gap: 16 },
  star: { width: 32, height: 32, overflow: 'visible' },
});
