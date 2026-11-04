import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PrimaryButton } from './PrimaryButton';
import { SourceCustomIcon } from './SourceCustomIcon';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';

/** Shared no-toolbar success screen used by standard baseline journeys. */
export function BaselineStandardSuccess({
  title,
  message,
  actionLabel,
  onDone,
  dark = false,
  testID,
  checkTestID,
}: {
  title: string;
  message: string;
  actionLabel: string;
  onDone: () => void;
  dark?: boolean;
  testID?: string;
  checkTestID?: string;
}) {
  const text = sourceColor('var(--uc-text)', dark);
  const olive = sourceColor('var(--uc-green-olive)', dark);
  return (
    <View
      testID={testID}
      style={[styles.screen, { backgroundColor: sourceColor('var(--uc-surface)', dark) }]}
    >
      <View style={styles.heading}>
        <Text accessibilityRole="header" style={[styles.title, { color: text }]}>
          {title}
        </Text>
      </View>
      <View style={styles.body}>
        <View style={styles.checkPosition}>
          <View
            testID={checkTestID}
            style={[styles.check, { borderColor: olive }]}
          >
            <SourceCustomIcon name="prime-check" size={64} color={olive} />
          </View>
        </View>
        <Text style={[styles.message, { color: text }]}>{message}</Text>
      </View>
      <View style={styles.footer}>
        <PrimaryButton label={actionLabel} onPress={onDone} dark={dark} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, width: '100%', overflow: 'hidden' },
  heading: { paddingHorizontal: 24, paddingTop: 84 },
  title: { fontFamily: 'UniCredit-bold', fontSize: 28 },
  body: { flex: 1, minHeight: 0, paddingHorizontal: 24 },
  checkPosition: { alignItems: 'center', paddingTop: 58 },
  check: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: { fontFamily: 'UniCredit-regular', fontSize: 16, paddingTop: 58 },
  footer: { paddingHorizontal: 24, paddingBottom: 42 },
});
