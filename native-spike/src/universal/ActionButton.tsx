import React from 'react';
import {
  Pressable,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Text } from './Typography';
import type { Themed } from './types';
import { styles } from './styles';

export function ActionButton({
  tokens,
  label,
  onPress,
  secondary = false,
  disabled = false,
  labelStyle,
  containerStyle,
}: Themed & {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  labelStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        {
          backgroundColor: secondary ? 'transparent' : tokens.accent,
          opacity: disabled ? 0.4 : pressed ? 0.65 : 1,
        },
        containerStyle,
      ]}
    >
      <Text
        style={[
          styles.actionLabel,
          {
            fontFamily: tokens.strongFont,
            color: secondary ? tokens.accent : tokens.inverse,
          },
          labelStyle,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
