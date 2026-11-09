import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { resolveTextLink } from '@/app/components/contracts/textLink';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';

/** The Design System inline text link: a plain text action, 14 Bold, in the action color, 44 px target. */
export function BaselineTextLink({
  label,
  onPress,
  disabled = false,
  dark = false,
  accessibilityLabel,
  leadingIcon,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  dark?: boolean;
  accessibilityLabel?: string;
  /** Decorative glyph before the text. */
  leadingIcon?: React.ReactNode;
}) {
  const link = resolveTextLink({ disabled });
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        { minHeight: link.minHeight, gap: link.gap },
        { opacity: disabled ? link.disabledOpacity : pressed ? link.pressedOpacity : 1 },
      ]}
    >
      {leadingIcon ? (
        <View
          style={styles.icon}
          aria-hidden
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {leadingIcon}
        </View>
      ) : null}
      <Text
        style={[
          styles.text,
          {
            fontSize: link.fontSize,
            lineHeight: link.lineHeight,
            color: sourceColor(`var(${link.colorToken})`, dark),
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  text: { fontFamily: 'UniCredit-bold' },
  icon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
