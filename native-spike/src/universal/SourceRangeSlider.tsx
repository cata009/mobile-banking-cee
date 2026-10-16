import React, { useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
export interface SourceRangeProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  color: string;
}
import { sourceRangeValue } from './sourceRangeValue';
export { sourceRangeValue } from './sourceRangeValue';
/** Source 20px browser range geometry, with continuous tap/drag and native accessibility adjustment. */
export function SourceRangeSlider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  color,
}: SourceRangeProps) {
  const [width, setWidth] = useState(0);
  const latest = useRef({ width, min, max, step, onChange });
  latest.current = { width, min, max, step, onChange };
  const update = (position: number) => {
    const p = latest.current;
    p.onChange(sourceRangeValue(position, p.width, p.min, p.max, p.step));
  };
  const progress = Math.max(
    0,
    Math.min(1, (value - min) / Math.max(1, max - min)),
  );
  return (
    <View
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min, max, now: value }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={event =>
        onChange(
          Math.max(
            min,
            Math.min(
              max,
              value +
                (event.nativeEvent.actionName === 'increment' ? step : -step),
            ),
          ),
        )
      }
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={event => update(event.nativeEvent.locationX)}
      onResponderMove={event => update(event.nativeEvent.locationX)}
      style={s.root}
    >
      <View style={s.track} />
      <View
        style={[
          s.fill,
          { width: Math.max(0, width - 16) * progress, backgroundColor: color },
        ]}
      />
      <View
        style={[
          s.thumb,
          { left: Math.max(0, width - 16) * progress, backgroundColor: color },
        ]}
      />
    </View>
  );
}
const s = StyleSheet.create({
  root: { height: 20, width: '100%', position: 'relative' },
  track: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#b2b2b2',
  },
  fill: { position: 'absolute', left: 8, top: 8, height: 4, borderRadius: 2 },
  thumb: {
    position: 'absolute',
    top: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
  },
});
