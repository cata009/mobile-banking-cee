import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from './Typography';
import type { Themed } from './types';
import { styles } from './styles';

export function NavigationRow<T>({
  tokens,
  title,
  subtitle,
  payload,
  onSelect,
  icon,
  trailing,
  titleContent,
  subtitleContent,
  disabled = false,
  borderWidth = 1,
  titleStyle,
  subtitleStyle,
  containerStyle,
}: Themed & {
  title: string;
  subtitle?: string;
  payload: T;
  onSelect: (payload: T) => void;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  titleContent?: React.ReactNode;
  subtitleContent?: React.ReactNode;
  disabled?: boolean;
  borderWidth?: number;
  titleStyle?: import('react-native').StyleProp<
    import('react-native').TextStyle
  >;
  subtitleStyle?: import('react-native').StyleProp<
    import('react-native').TextStyle
  >;
  containerStyle?: import('react-native').StyleProp<
    import('react-native').ViewStyle
  >;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => onSelect(payload)}
      style={({ pressed }) => [
        styles.row,
        {
          borderBottomColor: tokens.border,
          borderBottomWidth: borderWidth,
          opacity: pressed ? 0.65 : 1,
          minHeight: tokens.rowHeight,
          paddingHorizontal: tokens.rowPaddingHorizontal,
          paddingVertical: tokens.rowPaddingVertical,
          gap: tokens.rowGap,
        },
        containerStyle,
      ]}
    >
      {icon}
      <View style={styles.rowCopy}>
        <Text
          style={[
            styles.rowTitle,
            {
              fontFamily: tokens.strongFont,
              color: tokens.text,
            },
            titleStyle,
          ]}
        >
          {titleContent ?? title}
        </Text>
        {subtitle !== undefined && (
          <Text
            style={[
              styles.rowSubtitle,
              {
                fontFamily: tokens.font,
                color: tokens.muted,
                fontSize: tokens.rowSubtitleSize,
              },
              subtitleStyle,
            ]}
          >
            {subtitleContent ?? subtitle}
          </Text>
        )}
      </View>
      {trailing}
    </Pressable>
  );
}
