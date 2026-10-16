import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Text } from '../../../../universal/Typography';

/** Source FaceIdAnimation's demo timing and original check geometry. */
export function FaceIdOverlay({
  onComplete,
  success = '#2FA358',
}: {
  onComplete: () => void;
  success?: string;
}) {
  const complete = useRef(onComplete);
  complete.current = onComplete;
  const [phase, setPhase] = useState<'scanning' | 'confirming' | 'complete'>(
    'scanning',
  );
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
    const scan = setTimeout(() => setPhase('confirming'), 360),
      confirm = setTimeout(() => setPhase('complete'), 640),
      done = setTimeout(() => complete.current(), 840);
    return () => {
      clearTimeout(scan);
      clearTimeout(confirm);
      clearTimeout(done);
    };
  }, [opacity, scale]);
  return (
    <Animated.View
      testID="source-face-id-animation"
      style={[
        s.overlay,
        {
          opacity,
        },
      ]}
    >
      <View style={s.backdrop} />
      <Animated.View
        style={[
          s.bezel,
          {
            transform: [
              {
                scale,
              },
            ],
          },
        ]}
      >
        {phase === 'scanning' ? (
          <Text
            style={[
              parityStyles.item0,
              {
                color: success,
              },
              parityStyles.item1,
            ]}
          >
            􀎽
          </Text>
        ) : (
          <Svg width={72} height={72} viewBox="0 0 72 72">
            <Circle
              cx={36}
              cy={36}
              r={32}
              stroke={success}
              strokeWidth={3}
              fill="none"
            />
            <Path
              d="M 22 36 L 30 44 L 50 24"
              stroke={success}
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        )}
      </Animated.View>
    </Animated.View>
  );
}
const s = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingTop: 40,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,.4)',
  },
  bezel: {
    width: 150,
    height: 150,
    borderRadius: 42,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 20px 50px rgba(0,0,0,.3)',
  },
});
const parityStyles = StyleSheet.create({
  item0: {
    fontFamily: 'SF_Pro:Light',
    fontSize: 72,
    lineHeight: 86,
  },
  item1: {
    textAlign: 'center',
  },
});
