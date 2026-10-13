import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import { SoftShadow } from '../../../../universal/SoftShadow';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
export default function FloatingOperations({
  onPress,
  card = false,
}: {
  onPress: () => void;
  card?: boolean;
}) {
  return (
    <View
      testID="floating-operations"
      style={[styles.frame, card && styles.cardFrame]}
    >
      <SoftShadow
        width={172}
        height={card ? 64 : 72}
        radius={120}
        offsetY={11}
        blur={17}
        color="#262626"
        opacity={0.36}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Operazioni"
        onPress={onPress}
        style={[styles.button, card && styles.cardButton]}
      >
        <Text style={styles.label}>Operazioni</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  frame: {
    position: 'absolute',
    right: 16,
    bottom: 34,
    width: 172,
    height: 72,
    padding: 4,
    borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.1)',
    boxShadow:
      Platform.OS === 'android'
        ? undefined
        : '0px 11px 17px rgba(38,38,38,0.36)',
  },
  cardFrame: {
    height: 64,
    bottom: 16,
    padding: 0,
    backgroundColor: 'transparent',
  },
  button: {
    flex: 1,
    borderRadius: 120,
    backgroundColor: tokens.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardButton: { borderWidth: 4, borderColor: 'rgba(255,255,255,0.9)' },
  label: {
    fontFamily: tokens.strongFont,
    color: '#fff',
    fontSize: 20,
    lineHeight: 24,
  },
});
