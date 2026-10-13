import React, { forwardRef, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Text, TextInput } from './Typography';
import type { Themed } from './types';
import { styles } from './styles';

export const SearchField = forwardRef<
  React.ElementRef<typeof TextInput>,
  Themed & {
    label: string;
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    onClear: () => void;
    clearLabel?: string;
    placeholder?: string;
    autoFocus?: boolean;
    icon?: React.ReactNode;
    clearIcon?: React.ReactNode;
    idleTrailing?: React.ReactNode;
    containerStyle?: import('react-native').StyleProp<
      import('react-native').ViewStyle
    >;
    inputStyle?: import('react-native').StyleProp<
      import('react-native').TextStyle
    >;
  }
>(function SearchFieldControl(
  {
    tokens,
    label,
    value,
    onChange,
    onSubmit,
    onClear,
    clearLabel = 'Clear search',
    placeholder,
    autoFocus = false,
    icon,
    clearIcon,
    idleTrailing,
    containerStyle,
    inputStyle,
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={[
        styles.search,
        {
          backgroundColor: tokens.searchBackground ?? tokens.surface,
          borderRadius: tokens.searchRadius ?? tokens.radius,
          borderColor: focused
            ? tokens.searchFocusBorder ?? tokens.accent
            : tokens.searchBorder,
          borderWidth: tokens.searchBorderWidth,
          gap: tokens.searchGap,
          paddingHorizontal: tokens.searchPaddingHorizontal,
        },
        containerStyle,
      ]}
    >
      {icon}
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        autoFocus={autoFocus}
        returnKeyType="search"
        submitBehavior="submit"
        autoCapitalize="none"
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={tokens.text}
        style={[
          styles.searchInput,
          Platform.OS === 'web' && styles.webInput,
          { color: tokens.text, fontFamily: tokens.font },
          inputStyle,
        ]}
      />
      {value.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={clearLabel}
          onPress={onClear}
          style={styles.clearButton}
          hitSlop={10}
        >
          {clearIcon ?? (
            <Text style={[styles.symbol, { color: tokens.muted }]}>×</Text>
          )}
        </Pressable>
      )}
      {value.length === 0 && idleTrailing}
    </View>
  );
});
