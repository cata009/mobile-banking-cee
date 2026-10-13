import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Typography';
import type { Themed } from './types';

export function SuggestionChip({
  tokens,
  label,
  icon,
  onPress,
}: Themed & {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: tokens.surface, opacity: pressed ? 0.65 : 1 },
      ]}
    >
      <View style={styles.icon}>{icon}</View>
      <Text
        style={[
          styles.label,
          { fontFamily: tokens.strongFont, color: tokens.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  chip: {
    minHeight: 40,
    padding: 8,
    borderRadius: 120,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  icon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 16, lineHeight: 18, paddingVertical: 3 },
});
