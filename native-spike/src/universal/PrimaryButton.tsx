import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
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
  ...options
}: PrimaryButtonOptions & {
  label: string;
  onPress?: () => void;
  dark?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const contract = resolvePrimaryButton(options);
  const [hovered, setHovered] = useState(false);
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
      style={({ pressed }) => [
        {
          width: '100%',
          height: contract.height,
          borderRadius: contract.radius,
          paddingVertical: contract.variant === 'language-save' ? 0 : 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: sourceColor(
            `var(${
              hovered && contract.hoverBackgroundToken
                ? contract.hoverBackgroundToken
                : contract.backgroundToken
            })`,
            dark,
          ),
          opacity: contract.opacity * (hovered ? contract.hoverOpacity : 1),
          transform: [{ scale: pressed ? contract.pressedScale : 1 }],
        },
        style,
      ]}
    >
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: 'UniCredit-bold', maxWidth: '100%' },
});
