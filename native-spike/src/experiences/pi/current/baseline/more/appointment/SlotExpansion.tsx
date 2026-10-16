import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

/** Keep natural content measurable while its animated viewport is collapsed. */
export function SlotExpansion({
  expanded,
  children,
}: {
  expanded: boolean;
  children: ReactNode;
}) {
  const progress = useRef(new Animated.Value(expanded ? 1 : 0)).current;
  const [contentHeight, setContentHeight] = useState(0);
  useEffect(() => {
    let disposed = false;
    let animation: Animated.CompositeAnimation | undefined;
    const target = expanded ? 1 : 0;
    progress.stopAnimation(current => {
      if (disposed) return;
      animation = Animated.timing(progress, {
        toValue: target,
        duration: 300 * Math.abs(target - current),
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: false,
      });
      animation.start();
    });
    return () => {
      disposed = true;
      animation?.stop();
    };
  }, [expanded, progress]);
  return (
    <Animated.View
      testID="ro-slot-expansion"
      aria-hidden={!expanded}
      accessibilityElementsHidden={!expanded}
      style={[
        styles.viewport,
        {
          height: Animated.multiply(progress, contentHeight),
          opacity: progress,
        },
      ]}
    >
      <View
        testID="ro-slot-expansion-content"
        onLayout={event => setContentHeight(event.nativeEvent.layout.height)}
        style={styles.content}
      >
        {children}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  viewport: { overflow: 'hidden' },
  content: { flexShrink: 0, paddingTop: 12 },
});
