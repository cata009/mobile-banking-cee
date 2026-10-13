import React, { useRef } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';

/** Same range and step as the source budget input, with native touch/adjustable semantics. */
export function BudgetSlider({
  value,
  onChange,
  hidden = false,
}: {
  value: number;
  onChange: (value: number) => void;
  hidden?: boolean;
}) {
  const width = useRef(1),
    current = useRef(value),
    change = useRef(onChange);
  current.current = value;
  change.current = onChange;
  const bounded = (next: number) =>
    Math.max(0, Math.min(4550, Math.round(next / 10) * 10));
  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: event =>
        change.current(
          bounded((event.nativeEvent.locationX / width.current) * 4550),
        ),
      onPanResponderMove: event =>
        change.current(
          bounded((event.nativeEvent.locationX / width.current) * 4550),
        ),
    }),
  ).current;
  const ratio = Math.max(
    0,
    Math.min(1, hidden ? 0.5 : Number.isFinite(value) ? value / 4550 : 0),
  );
  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="Importo massimo del budget"
      accessibilityValue={
        hidden
          ? { text: 'Importo nascosto' }
          : {
              min: 0,
              max: 4550,
              now: Number.isFinite(value) ? value : 0,
            }
      }
      accessibilityActions={[
        { name: 'increment', label: 'Aumenta di 10 euro' },
        { name: 'decrement', label: 'Riduci di 10 euro' },
      ]}
      onAccessibilityAction={event =>
        change.current(
          bounded(
            current.current +
              (event.nativeEvent.actionName === 'increment' ? 10 : -10),
          ),
        )
      }
      onLayout={event => {
        width.current = event.nativeEvent.layout.width;
      }}
      {...responder.panHandlers}
      style={styles.control}
    >
      <View pointerEvents="none" style={styles.track}>
        <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
      </View>
      <View
        pointerEvents="none"
        style={[styles.thumb, { left: `${ratio * 100}%` }]}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  control: { height: 40, justifyContent: 'center', marginHorizontal: 8 },
  track: { height: 4, backgroundColor: '#ccc', borderRadius: 2 },
  fill: { height: 4, backgroundColor: '#007a91', borderRadius: 2 },
  thumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    marginLeft: -8,
    borderRadius: 8,
    backgroundColor: '#007a91',
  },
});
