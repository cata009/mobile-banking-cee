import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  resolvePrimaryButton,
  type PrimaryButtonOptions,
} from '@/app/components/contracts/primaryButton';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';

/** Canonical Baseline CTA; all of its visual variants consume the shared Source contract. */
export function PrimaryButton({
  label,
  onPress,
  dark = false,
  style,
  leadingIcon,
  ...options
}: PrimaryButtonOptions & {
  label: string;
  onPress?: () => void;
  dark?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Decorative composition slot; callers reuse the existing icon renderers. */
  leadingIcon?: React.ReactNode;
}) {
  const contract = resolvePrimaryButton(options);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const labelNode = (
    <Text
      numberOfLines={contract.truncateLabel ? 1 : undefined}
      ellipsizeMode="tail"
      style={[
        styles.label,
        {
          fontSize: contract.fontSize,
          color: sourceColor(`var(${contract.textToken})`, dark),
        },
      ]}
    >
      {label}
    </Text>
  );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: contract.disabled }}
      disabled={contract.disabled}
      onPress={() => {
        if (!contract.disabled) onPress?.();
      }}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={event => {
        // Match the Source web button's :focus-visible behavior. A pointer
        // click may retain DOM focus while the same CTA advances the flow.
        const target = event?.currentTarget as unknown as {
          matches?: (selector: string) => boolean;
        };
        setFocused(
          Platform.OS !== 'web' || Boolean(target?.matches?.(':focus-visible')),
        );
      }}
      onPointerDown={() => {
        if (Platform.OS === 'web') setFocused(false);
      }}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        {
          width: '100%',
          height: contract.height,
          borderRadius: contract.radius,
          paddingVertical: contract.variant === 'language-save' ? 0 : 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: contract.transparent
            ? 'transparent'
            : sourceColor(
                `var(${
                  hovered && contract.hoverBackgroundToken
                    ? contract.hoverBackgroundToken
                    : contract.backgroundToken
                })`,
                dark,
              ),
          opacity: contract.opacity * (hovered ? contract.hoverOpacity : 1),
          transform: [{ scale: pressed ? contract.pressedScale : 1 }],
          outlineStyle: 'solid',
          outlineWidth:
            focused && !contract.disabled && contract.focusRing ? 2 : 0,
          outlineOffset: 2,
          outlineColor: sourceColor('var(--uc-action)', dark),
        },
        style,
      ]}
    >
      {leadingIcon ? (
        <View style={styles.content}>
          <View
            style={styles.icon}
            aria-hidden
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {leadingIcon}
          </View>
          {labelNode}
        </View>
      ) : (
        labelNode
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: 'UniCredit-bold', maxWidth: '100%', flexShrink: 1 },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    maxWidth: '100%',
  },
  icon: {
    width: 24,
    height: 24,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
