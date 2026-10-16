import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import {
  resolveToggleButton,
  type ToggleButtonVariant,
} from '@/app/components/contracts/toggleButton';
import { TOGGLE_ARTWORK } from '@/app/components/contracts/toggleArtwork';
import { sourceColor } from './sourceColor';

/** Isolated contract renderer. Existing Native demo screens do not import it. */
export function ToggleButton({
  checked,
  disabled = false,
  variant = 'baseline',
  onToggle,
  ariaLabel,
  dark = false,
}: {
  checked: boolean;
  disabled?: boolean;
  variant?: ToggleButtonVariant;
  onToggle?: (checked: boolean) => void;
  ariaLabel?: string;
  dark?: boolean;
}) {
  const state = resolveToggleButton({
    checked,
    disabled,
    variant,
    interactive: Boolean(onToggle),
  });
  const left = useRef(new Animated.Value(state.knobLeft)).current;
  const [easeX1, easeY1, easeX2, easeY2] = state.easing;
  useEffect(() => {
    const animation = Animated.timing(left, {
      toValue: state.knobLeft,
      duration: state.movementDurationMs,
      easing: Easing.bezier(easeX1, easeY1, easeX2, easeY2),
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [
    left,
    state.knobLeft,
    state.movementDurationMs,
    easeX1,
    easeY1,
    easeX2,
    easeY2,
  ]);
  const frameStyle = {
    width: state.width,
    height: state.height,
    opacity: state.opacity,
  };
  const knobStyle = {
    top: state.knobTop,
    left,
    width: state.knobSize,
    height: state.knobSize,
  };
  const paint = (
    <View
      style={[styles.frame, frameStyle]}
      accessibilityElementsHidden
      aria-hidden
      importantForAccessibility="no-hide-descendants"
    >
      {
        <Svg
          width={state.width}
          height={state.height}
          viewBox="0 0 60 30"
          style={styles.track}
        >
          {checked ? (
            <Path
              d={TOGGLE_ARTWORK.checkedTrackPath}
              fill={sourceColor(state.trackColor, dark)}
              stroke={sourceColor(state.borderColor, dark)}
              strokeWidth={state.borderWidth}
            />
          ) : (
            <Rect
              x={1}
              y={1}
              width={58}
              height={28}
              rx={14}
              fill={sourceColor(state.trackColor, dark)}
              stroke={sourceColor(state.borderColor, dark)}
              strokeWidth={state.borderWidth}
            />
          )}
        </Svg>
      }
      <Animated.View style={[styles.knob, knobStyle]}>
        {
          <Svg
            width={state.knobSize}
            height={state.knobSize}
            viewBox="0 0 22 22"
          >
            {checked ? (
              <Path
                d={TOGGLE_ARTWORK.checkedKnobPath}
                fill={sourceColor(state.knobColor, dark)}
                fillRule="evenodd"
                clipRule="evenodd"
              />
            ) : (
              <Circle
                cx={11}
                cy={11}
                r={11}
                fill={sourceColor(state.knobColor, dark)}
              />
            )}
          </Svg>
        }
      </Animated.View>
    </View>
  );
  if (!onToggle) return paint;
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={ariaLabel}
      accessibilityState={{ checked, disabled }}
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={() => {
        if (!disabled) onToggle(!checked);
      }}
      style={styles.control}
    >
      {paint}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  frame: { position: 'relative', overflow: 'hidden' },
  track: { position: 'absolute', left: 0, top: 0 },
  knob: { position: 'absolute' },
  control: { borderRadius: 999 },
});
