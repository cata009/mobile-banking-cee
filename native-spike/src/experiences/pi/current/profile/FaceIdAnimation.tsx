import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Text } from '../../../../universal/Typography';
import { sourceColor } from '../../../../universal/sourceColor';
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
/** Exact Source mobile demonstration phases; this animation never reports device biometric authentication. */
export default function FaceIdAnimation({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<'scanning' | 'confirming' | 'complete'>(
    'scanning',
  );
  const alpha = useRef(new Animated.Value(0)).current,
    scale = useRef(new Animated.Value(0.8)).current,
    backdropAlpha = useRef(new Animated.Value(0)).current,
    glyphAlpha = useRef(new Animated.Value(1)).current,
    glyphScale = useRef(new Animated.Value(1)).current,
    checkAlpha = useRef(new Animated.Value(0)).current,
    checkScale = useRef(new Animated.Value(0.8)).current,
    circleProgress = useRef(new Animated.Value(0)).current,
    pathProgress = useRef(new Animated.Value(0)).current;
  const [showCheck, setShowCheck] = useState(false);
  useEffect(() => {
    Animated.parallel([
      Animated.timing(alpha, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      Animated.timing(backdropAlpha, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(glyphAlpha, {
          toValue: 0.7,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glyphAlpha, {
          toValue: 1,
          duration: 400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [alpha, scale, backdropAlpha, glyphAlpha]);
  useEffect(() => {
    const scanning = setTimeout(() => {
        setPhase('confirming');
        glyphAlpha.stopAnimation();
        Animated.parallel([
          Animated.timing(glyphAlpha, {
            toValue: 0,
            duration: 150,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glyphScale, {
            toValue: 0.9,
            duration: 150,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
      }, 360),
      check = setTimeout(() => {
        setShowCheck(true);
        Animated.parallel([
          Animated.timing(checkAlpha, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(checkScale, {
            toValue: 1,
            duration: 150,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: true,
          }),
          Animated.timing(circleProgress, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.sequence([
            Animated.delay(100),
            Animated.timing(pathProgress, {
              toValue: 1,
              duration: 400,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
              useNativeDriver: false,
            }),
          ]),
        ]).start();
      }, 510),
      confirming = setTimeout(() => setPhase('complete'), 640),
      complete = setTimeout(onComplete, 840);
    return () => {
      clearTimeout(scanning);
      clearTimeout(check);
      clearTimeout(confirming);
      clearTimeout(complete);
    };
  }, [
    onComplete,
    glyphAlpha,
    glyphScale,
    checkAlpha,
    checkScale,
    circleProgress,
    pathProgress,
  ]);
  const green = sourceColor('var(--uc-green-success)');
  return (
    <Animated.View
      testID={`source-face-id-${phase}`}
      style={[styles.overlay, { opacity: alpha }]}
    >
      <Animated.View style={[styles.backdrop, { opacity: backdropAlpha }]} />
      <Animated.View style={[styles.bezel, { transform: [{ scale }] }]}>
        {!showCheck ? (
          <Animated.View
            testID={
              phase === 'scanning'
                ? 'source-face-id-glyph'
                : 'source-face-id-exiting-glyph'
            }
            style={{ opacity: glyphAlpha, transform: [{ scale: glyphScale }] }}
          >
            <Text style={[styles.glyph, { color: green }]}>􀎽</Text>
          </Animated.View>
        ) : (
          <Animated.View
            testID="source-face-id-check"
            style={{ opacity: checkAlpha, transform: [{ scale: checkScale }] }}
          >
            <Svg width={72} height={72} viewBox="0 0 72 72">
              <AnimatedCircle
                cx={36}
                cy={36}
                r={32}
                stroke={green}
                strokeWidth={3}
                fill="none"
                strokeDasharray={[201.06193, 201.06193]}
                strokeDashoffset={circleProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [201.06193, 0],
                })}
              />
              <AnimatedPath
                d="M 22 36 L 30 44 L 50 24"
                stroke={green}
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                strokeDasharray={[39.59798, 39.59798]}
                strokeDashoffset={pathProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [39.59798, 0],
                })}
              />
            </Svg>
          </Animated.View>
        )}
      </Animated.View>
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    alignItems: 'center',
    paddingTop: 40,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(38,38,38,0.4)',
  },
  bezel: {
    width: 150,
    height: 150,
    borderRadius: 42,
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
  },
  glyph: { fontFamily: 'SF_Pro:Light', fontSize: 72, textAlign: 'center' },
});
