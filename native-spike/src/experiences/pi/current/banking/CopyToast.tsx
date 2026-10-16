import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import { copyDemoText } from '../../../../platform/nativeFiles';
import { sourceColor } from '../../../../universal/sourceColor';

export function useBankingCopy() {
  const [toast, setToast] = useState<{
    message: string;
    visible: boolean;
  } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const copy = async (value: string, label: string) => {
    try {
      await copyDemoText(value);
    } catch {
      /* Source still confirms the demo copy intent. */
    }
    if (timer.current) clearTimeout(timer.current);
    setToast({ message: `${label} successfully copied`, visible: true });
    timer.current = setTimeout(
      () =>
        setToast(current => (current ? { ...current, visible: false } : null)),
      1400,
    );
  };
  return { copy, toast };
}
export function BankingCopyToast({
  toast,
  font,
}: {
  toast: { message: string; visible: boolean } | null;
  font: string;
}) {
  const visibility = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(visibility, {
      toValue: toast?.visible ? 1 : 0,
      duration: 300,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [toast?.visible, visibility]);
  if (!toast) return null;
  return (
    <View
      pointerEvents="none"
      role="status"
      accessibilityLiveRegion="polite"
      style={s.overlay}
    >
      <Animated.View
        accessibilityLiveRegion="polite"
        style={[
          s.pill,
          {
            opacity: visibility,
            transform: [
              {
                translateY: visibility.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text numberOfLines={1} style={[s.text, { fontFamily: font }]}>
          {toast.message}
        </Text>
      </Animated.View>
    </View>
  );
}
const s = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 18,
    zIndex: 60,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  pill: {
    height: 34,
    width: 343,
    maxWidth: '100%',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 48,
    backgroundColor: sourceColor('var(--uc-static-black)'),
    boxShadow: '0 12px 26px rgba(0,0,0,.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontSize: 14, lineHeight: 20, color: '#ffffff', textAlign: 'center' },
});
