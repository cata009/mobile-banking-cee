import React, { useState } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import {
  MOBILE_CODE_GEOMETRY as geometry,
  resolveMobileCodeProgress,
  type MobileCodeBiometric,
  type MobileCodeDigits,
  type MobileCodeGlyph,
} from '@/app/components/contracts/mobileCode';
import faceIdAsset from '@/assets/mobile-first/it/profile/settings/face-id.svg';
import fingerprintAsset from '@/assets/design-system/mobile-code/fingerprint.svg';
import deleteAsset from '@/assets/mobile-first/it/profile/auth-imgNavigationAndActionDeleteMcodeT2.svg';
import recoveryAsset from '@/assets/mobile-first/it/investments/funds/660985-imgNavigationAndActionForthK1.svg';
import { AssetGlyph } from './AssetGlyph';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';

/** Original vector assets in the authored 32px viewport; no glyph is redrawn. */
export function BaselineMobileCodeGlyph({
  glyph,
  dark = false,
}: {
  glyph: MobileCodeGlyph;
  dark?: boolean;
}) {
  const faceId = glyph === 'face-id';
  return (
    <View
      style={styles.glyph}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={faceId ? styles.faceIdArtwork : undefined}>
        <AssetGlyph
          asset={
            faceId
              ? faceIdAsset
              : glyph === 'fingerprint'
                ? fingerprintAsset
                : deleteAsset
          }
          width={faceId ? geometry.faceIdArtworkSize : geometry.glyphSize}
          height={faceId ? geometry.faceIdArtworkSize : geometry.glyphSize}
          tintColor={sourceColor(`var(${geometry.textToken})`, dark)}
        />
      </View>
    </View>
  );
}

type KeyProps = {
  onPress?: () => void;
  disabled?: boolean;
  dark?: boolean;
} & (
  | { kind?: 'digit'; digit: string }
  | { kind: 'action'; glyph: MobileCodeGlyph; ariaLabel: string }
);

export function BaselineMobileCodeKey(props: KeyProps) {
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);
  const disabled = props.disabled || !props.onPress;
  const color = sourceColor(`var(${geometry.textToken})`, props.dark);
  const focus: ViewStyle = {
    outlineStyle: 'solid',
    outlineWidth: focused ? 2 : 0,
    outlineColor: sourceColor('var(--uc-action)', props.dark),
    outlineOffset: 2,
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        props.kind === 'action' ? props.ariaLabel : `Digit ${props.digit}`
      }
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        if (!disabled) props.onPress?.();
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.key,
        props.kind !== 'action' ? styles.digitKey : undefined,
        focus,
        { opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
      ]}
    >
      {props.kind === 'action' ? (
        <BaselineMobileCodeGlyph glyph={props.glyph} dark={props.dark} />
      ) : (
        <Text
          style={[styles.digit, { color }]}
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {props.digit}
        </Text>
      )}
    </Pressable>
  );
}

interface KeypadProps {
  biometric?: MobileCodeBiometric;
  disabled?: boolean;
  dark?: boolean;
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onBiometric?: () => void;
}

export function BaselineMobileCodeKeypad({
  biometric = 'face-id',
  disabled = false,
  dark = false,
  onDigit,
  onDelete,
  onBiometric,
}: KeypadProps) {
  return (
    <View testID="mobile-code-keypad" style={styles.keypad}>
      {[
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ].map((row, index) => (
        <View key={index} style={styles.row}>
          {row.map(digit => (
            <BaselineMobileCodeKey
              key={digit}
              digit={String(digit)}
              onPress={() => onDigit(String(digit))}
              disabled={disabled}
              dark={dark}
            />
          ))}
        </View>
      ))}
      <View style={styles.row}>
        {biometric === 'none' ? (
          <View
            testID="mobile-code-empty-cell"
            style={styles.key}
            accessible={false}
          />
        ) : (
          <BaselineMobileCodeKey
            kind="action"
            glyph={biometric}
            ariaLabel={
              biometric === 'face-id' ? 'Use Face ID' : 'Use fingerprint'
            }
            onPress={onBiometric}
            disabled={disabled}
            dark={dark}
          />
        )}
        <BaselineMobileCodeKey
          digit="0"
          onPress={() => onDigit('0')}
          disabled={disabled}
          dark={dark}
        />
        <BaselineMobileCodeKey
          kind="action"
          glyph="delete"
          ariaLabel="Delete last digit"
          onPress={onDelete}
          disabled={disabled}
          dark={dark}
        />
      </View>
    </View>
  );
}

export function BaselineMobileCodeProgress({
  digits = 6,
  enteredDigits = 0,
  dark = false,
}: {
  digits?: MobileCodeDigits;
  enteredDigits?: number;
  dark?: boolean;
}) {
  const state = resolveMobileCodeProgress({ digits, enteredDigits });
  return (
    <View
      testID="mobile-code-progress"
      style={[styles.progress, { width: state.width, height: state.height }]}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${state.enteredDigits} of ${digits} digits entered`}
      accessibilityValue={{ min: 0, max: digits, now: state.enteredDigits }}
    >
      {Array.from({ length: digits }, (_, index) => (
        <View
          key={index}
          testID={`mobile-code-dot-${index}`}
          accessible={false}
          style={[
            styles.dot,
            {
              backgroundColor: sourceColor(
                `var(${index < state.enteredDigits ? geometry.filledDotToken : geometry.emptyDotToken})`,
                dark,
              ),
            },
          ]}
        />
      ))}
    </View>
  );
}

/** Controlled presentation: only entered length is supplied; authorization stays with the feature. */
export function BaselineMobileCode({
  digits = 6,
  enteredDigits = 0,
  biometric = 'face-id',
  dark = false,
  disabled,
  onDigit,
  onDelete,
  onBiometric,
  onRecover,
  showRecovery = true,
  headingLine1 = 'Insert your',
  headingLine2 = 'PIN Code',
  recoveryLabel = 'Forgot your passcode',
}: KeypadProps & {
  digits?: MobileCodeDigits;
  enteredDigits?: number;
  onRecover?: () => void;
  showRecovery?: boolean;
  headingLine1?: string;
  headingLine2?: string;
  recoveryLabel?: string;
}) {
  const color = sourceColor(`var(${geometry.textToken})`, dark);
  return (
    <View testID="mobile-code-entry" style={styles.entry}>
      <Text accessibilityRole="header" style={[styles.heading, { color }]}>
        {headingLine1}
        {'\n'}
        {headingLine2}
      </Text>
      <View testID="mobile-code-progress-slot" style={styles.progressSlot}>
        <BaselineMobileCodeProgress
          digits={digits}
          enteredDigits={enteredDigits}
          dark={dark}
        />
      </View>
      <View testID="mobile-code-keypad-slot" style={styles.keypadSlot}>
        <BaselineMobileCodeKeypad
          biometric={biometric}
          disabled={disabled}
          dark={dark}
          onDigit={onDigit}
          onDelete={onDelete}
          onBiometric={onBiometric}
        />
      </View>
      {showRecovery ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={recoveryLabel}
          accessibilityState={{ disabled: disabled || !onRecover }}
          disabled={disabled || !onRecover}
          onPress={() => {
            if (!disabled) onRecover?.();
          }}
          style={styles.recovery}
        >
          <View
            style={styles.recoveryContent}
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Text style={[styles.recoveryLabel, { color }]}>
              {recoveryLabel.toUpperCase()}
            </Text>
            <AssetGlyph
              asset={recoveryAsset}
              width={16}
              height={16}
              tintColor={color}
            />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  glyph: {
    width: geometry.glyphSize,
    height: geometry.glyphSize,
    position: 'relative',
  },
  faceIdArtwork: {
    position: 'absolute',
    left: 0,
    top: geometry.faceIdArtworkTop,
  },
  key: {
    width: geometry.keyWidth,
    minHeight: geometry.keyMinHeight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  digitKey: { paddingVertical: geometry.keyPaddingVertical },
  digit: {
    width: geometry.keyWidth,
    minHeight: geometry.digitMinHeight,
    fontFamily: 'UniCredit-bold',
    fontSize: geometry.digitFontSize,
    lineHeight: geometry.digitLineHeight,
    textAlign: 'center',
    includeFontPadding: false,
  },
  keypad: { width: geometry.keypadWidth, gap: geometry.rowGap },
  row: {
    width: geometry.keypadWidth,
    minHeight: geometry.keyMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: geometry.columnGap,
  },
  progress: { flexDirection: 'row', gap: geometry.dotGap },
  dot: {
    width: geometry.dotSize,
    height: geometry.dotSize,
    borderRadius: geometry.dotSize / 2,
  },
  entry: {
    width: geometry.entryWidth,
    paddingHorizontal: geometry.entryPaddingHorizontal,
    alignItems: 'center',
  },
  heading: {
    alignSelf: 'stretch',
    textAlign: 'center',
    fontFamily: 'UniCredit-bold',
    fontSize: geometry.headingFontSize,
    lineHeight: geometry.headingLineHeight,
    includeFontPadding: false,
  },
  progressSlot: {
    marginTop: geometry.headingToProgress,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  keypadSlot: { marginTop: geometry.progressToKeypad },
  recovery: {
    marginTop: geometry.keypadToRecovery,
    minHeight: geometry.recoveryMinHeight,
    paddingVertical: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recoveryContent: {
    minHeight: geometry.recoveryContentMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: geometry.recoveryGap,
  },
  recoveryLabel: {
    fontFamily: 'UniCredit-bold',
    fontSize: geometry.recoveryFontSize,
    lineHeight: geometry.recoveryLineHeight,
    includeFontPadding: false,
  },
});
