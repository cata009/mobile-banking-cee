import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import { SoftShadow } from '../../../../universal/SoftShadow';
import { tokens } from './Primitives';

/** Source mf-floating-investi: 66px button centered in its 72px glass frame. */
export function FloatingInvestments({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.frame}>
      <SoftShadow
        width={172}
        height={72}
        radius={120}
        offsetY={11}
        blur={17}
        color="#262626"
        opacity={0.36}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Investi"
        onPress={onPress}
        style={styles.button}
      >
        <Text style={styles.label}>Investi</Text>
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
    justifyContent: 'flex-start',
    padding: 4,
    borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.1)',
    boxShadow:
      Platform.OS === 'android'
        ? undefined
        : '0px 11px 17px rgba(38,38,38,0.36)',
  },
  button: {
    height: 66,
    borderRadius: 120,
    backgroundColor: '#01315c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: tokens.strongFont,
    fontSize: 20,
    lineHeight: 24,
    color: '#fff',
  },
});
