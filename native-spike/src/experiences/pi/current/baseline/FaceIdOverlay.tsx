import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Text } from '../../../../universal/Typography';
import { sourceColor } from '../../../../universal/sourceColor';

const AnimatedCircle = Animated.createAnimatedComponent(Circle),
  AnimatedPath = Animated.createAnimatedComponent(Path),
  AnimatedText = Animated.createAnimatedComponent(Text);
const circleLength = 201.06193,
  pathLength = 39.59798;
const easeOut = Easing.bezier(0, 0, 0.58, 1),
  easeInOut = Easing.bezier(0.42, 0, 0.58, 1),
  sourceEase = Easing.bezier(0.25, 0.1, 0.25, 1);
type WebMotionStyle = ViewStyle & {
  animationName?: string;
  animationDuration?: string;
  animationTimingFunction?: string;
  animationDelay?: string;
  animationFillMode?: string;
  backdropFilter?: string;
};
const webGlyphFont: TextStyle & { fontVariationSettings: string } = {
  fontVariationSettings: "'wdth' 100",
};
function shadowColor(color: string, alpha: number) {
  const rgb = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(color);
  return rgb
    ? `rgba(${parseInt(rgb[1]!, 16)},${parseInt(rgb[2]!, 16)},${parseInt(
        rgb[3]!,
        16,
      )},${alpha})`
    : color;
}
function motion(
  name: string,
  duration: number,
  ease: string,
  delay = 0,
): WebMotionStyle | undefined {
  return Platform.OS === 'web'
    ? {
        animationName: name,
        animationDuration: `${duration}ms`,
        animationTimingFunction: ease,
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
      }
    : undefined;
}

/** Source animation, including AnimatePresence's 150ms exit before drawing the confirmation. */
export function FaceIdOverlay({
  onComplete,
  success = sourceColor('var(--uc-green-success)'),
}: {
  onComplete: () => void;
  success?: string;
}) {
  const complete = useRef(onComplete);
  complete.current = onComplete;
  const [phase, setPhase] = useState<'scanning' | 'confirming' | 'complete'>(
      'scanning',
    ),
    [showCheck, setShowCheck] = useState(false);
  const alpha = useRef(new Animated.Value(0)).current,
    backdropAlpha = useRef(new Animated.Value(0)).current,
    bezelAlpha = useRef(new Animated.Value(0)).current,
    bezelScale = useRef(new Animated.Value(0.8)).current,
    pulseAlpha = useRef(new Animated.Value(1)).current,
    glowRadius = useRef(new Animated.Value(8)).current,
    glyphAlpha = useRef(new Animated.Value(1)).current,
    glyphScale = useRef(new Animated.Value(1)).current,
    checkAlpha = useRef(new Animated.Value(0)).current,
    checkScale = useRef(new Animated.Value(0.8)).current,
    svgAlpha = useRef(new Animated.Value(0)).current,
    circleProgress = useRef(new Animated.Value(0)).current,
    pathProgress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const driver = Platform.OS !== 'web',
      running: Animated.CompositeAnimation[] = [];
    const start = (animation: Animated.CompositeAnimation) => {
      running.push(animation);
      animation.start();
    };
    start(
      Animated.parallel([
        Animated.timing(alpha, {
          toValue: 1,
          duration: 200,
          easing: easeOut,
          useNativeDriver: driver,
        }),
        Animated.timing(backdropAlpha, {
          toValue: 1,
          duration: 150,
          easing: easeOut,
          useNativeDriver: driver,
        }),
        Animated.timing(bezelAlpha, {
          toValue: 1,
          duration: 200,
          easing: sourceEase,
          useNativeDriver: driver,
        }),
        Animated.timing(bezelScale, {
          toValue: 1,
          duration: 200,
          easing: sourceEase,
          useNativeDriver: driver,
        }),
        Animated.sequence([
          Animated.timing(pulseAlpha, {
            toValue: 0.7,
            duration: 400,
            easing: easeInOut,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAlpha, {
            toValue: 1,
            duration: 400,
            easing: easeInOut,
            useNativeDriver: false,
          }),
        ]),
        Animated.sequence([
          Animated.timing(glowRadius, {
            toValue: 12,
            duration: 400,
            easing: easeInOut,
            useNativeDriver: false,
          }),
          Animated.timing(glowRadius, {
            toValue: 8,
            duration: 400,
            easing: easeInOut,
            useNativeDriver: false,
          }),
        ]),
      ]),
    );
    const scan = setTimeout(() => {
      setPhase('confirming');
      start(
        Animated.parallel([
          Animated.timing(glyphAlpha, {
            toValue: 0,
            duration: 150,
            easing: easeOut,
            useNativeDriver: driver,
          }),
          Animated.timing(glyphScale, {
            toValue: 0.9,
            duration: 150,
            easing: easeOut,
            useNativeDriver: driver,
          }),
        ]),
      );
    }, 360);
    const check = setTimeout(() => {
      setShowCheck(true);
      start(
        Animated.parallel([
          Animated.timing(checkAlpha, {
            toValue: 1,
            duration: 150,
            easing: sourceEase,
            useNativeDriver: driver,
          }),
          Animated.timing(checkScale, {
            toValue: 1,
            duration: 150,
            easing: sourceEase,
            useNativeDriver: driver,
          }),
          Animated.timing(svgAlpha, {
            toValue: 1,
            duration: 100,
            easing: easeOut,
            useNativeDriver: driver,
          }),
          Animated.timing(circleProgress, {
            toValue: 1,
            duration: 300,
            easing: easeOut,
            useNativeDriver: false,
          }),
          Animated.sequence([
            Animated.delay(100),
            Animated.timing(pathProgress, {
              toValue: 1,
              duration: 400,
              easing: sourceEase,
              useNativeDriver: false,
            }),
          ]),
        ]),
      );
    }, 510);
    const confirming = setTimeout(() => setPhase('complete'), 640),
      done = setTimeout(() => complete.current(), 840);
    return () => {
      [scan, check, confirming, done].forEach(clearTimeout);
      running.forEach(animation => animation.stop());
    };
  }, [
    alpha,
    backdropAlpha,
    bezelAlpha,
    bezelScale,
    pulseAlpha,
    glowRadius,
    glyphAlpha,
    glyphScale,
    checkAlpha,
    checkScale,
    svgAlpha,
    circleProgress,
    pathProgress,
  ]);
  const black = sourceColor('var(--uc-static-black)'),
    glowColor = `color-mix(in srgb, ${success} 60%, transparent)`;
  const css = `
 @keyframes ro-face-alpha{from{opacity:0}to{opacity:1}}
 @keyframes ro-face-entry{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
 @keyframes ro-face-exit{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.9)}}
 @keyframes ro-face-pulse{0%,100%{opacity:1;filter:drop-shadow(0 0 8px ${glowColor})}50%{opacity:.7;filter:drop-shadow(0 0 12px color-mix(in srgb, ${success} 80%, transparent))}}
 @keyframes ro-face-circle{from{stroke-dashoffset:${circleLength}}to{stroke-dashoffset:0}}
 @keyframes ro-face-path{from{stroke-dashoffset:${pathLength}}to{stroke-dashoffset:0}}`;
  const drawingCss =
    '#ro-face-id-circle{animation:ro-face-circle 300ms ease-out both}#ro-face-id-path{animation:ro-face-path 400ms cubic-bezier(.25,.1,.25,1) 100ms both}';
  return (
    <Animated.View
      testID="source-face-id-animation"
      style={[
        styles.overlay,
        { opacity: alpha },
        motion('ro-face-alpha', 200, 'ease-out'),
      ]}
    >
      {Platform.OS === 'web'
        ? React.createElement('style', null, css + drawingCss)
        : null}
      <Animated.View
        style={[
          styles.backdrop,
          { opacity: backdropAlpha },
          Platform.OS === 'web' ? styles.webBlur : undefined,
          motion('ro-face-alpha', 150, 'ease-out'),
        ]}
      />
      <Animated.View
        testID={`ro-face-id-${phase}`}
        style={[
          styles.bezel,
          {
            backgroundColor: black,
            opacity: bezelAlpha,
            transform: [{ scale: bezelScale }],
          },
          motion('ro-face-entry', 200, 'cubic-bezier(.25,.1,.25,1)'),
        ]}
      >
        {!showCheck ? (
          <Animated.View
            testID={
              phase === 'scanning'
                ? 'ro-face-id-glyph'
                : 'ro-face-id-exiting-glyph'
            }
            style={[
              styles.glyphPosition,
              { opacity: glyphAlpha, transform: [{ scale: glyphScale }] },
              phase !== 'scanning'
                ? motion('ro-face-exit', 150, 'ease-out')
                : undefined,
            ]}
          >
            <AnimatedText
              style={[
                styles.glyph,
                { color: success, opacity: pulseAlpha },
                Platform.OS === 'web'
                  ? webGlyphFont
                  : {
                      textShadowColor: glowRadius.interpolate({
                        inputRange: [8, 12],
                        outputRange: [
                          shadowColor(success, 0.6),
                          shadowColor(success, 0.8),
                        ],
                      }),
                      textShadowRadius: glowRadius,
                      textShadowOffset: { width: 0, height: 0 },
                    },
                motion('ro-face-pulse', 800, 'ease-in-out'),
              ]}
            >
              􀎽
            </AnimatedText>
          </Animated.View>
        ) : (
          <Animated.View
            testID="ro-face-id-check"
            style={[
              styles.check,
              { opacity: checkAlpha, transform: [{ scale: checkScale }] },
              motion('ro-face-entry', 150, 'cubic-bezier(.25,.1,.25,1)'),
            ]}
          >
            <Animated.View
              style={[
                { opacity: svgAlpha },
                motion('ro-face-alpha', 100, 'ease-out'),
              ]}
            >
              <Svg width={72} height={72} viewBox="0 0 72 72" fill="none">
                <AnimatedCircle
                  id="ro-face-id-circle"
                  cx={36}
                  cy={36}
                  r={32}
                  stroke={success}
                  strokeWidth={3}
                  fill="none"
                  strokeDasharray={[circleLength, circleLength]}
                  strokeDashoffset={circleProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [circleLength, 0],
                  })}
                />
                <AnimatedPath
                  id="ro-face-id-path"
                  d="M 22 36 L 30 44 L 50 24"
                  stroke={success}
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  strokeDasharray={[pathLength, pathLength]}
                  strokeDashoffset={pathProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [pathLength, 0],
                  })}
                />
              </Svg>
            </Animated.View>
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
    backgroundColor: 'rgba(38,38,38,.4)',
  },
  webBlur: { backdropFilter: 'blur(4px)' } as WebMotionStyle,
  bezel: {
    width: 150,
    height: 150,
    borderRadius: 42,
    boxShadow: '0 0 0 0 #262626, 0 20px 50px rgba(0,0,0,.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphPosition: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    fontFamily: 'SF_Pro:Light',
    fontSize: 72,
    textAlign: 'center',
    lineHeight: 86,
  },
  check: { position: 'absolute', width: 72, height: 72 },
});
