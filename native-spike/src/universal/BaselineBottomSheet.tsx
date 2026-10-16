import React, { useCallback, useEffect, useRef, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Platform,
} from 'react-native';
import { resolveBottomSheet } from '@/app/components/contracts/bottomSheet';
import { sourceColor } from './sourceColor';
import { Text } from './Typography';
import { SourceCustomIcon } from './SourceCustomIcon';

/** Isolated shell. The host owns device presentation, safe area and focus restoration. */
export function BaselineBottomSheet({
  title,
  children,
  onClose,
  footer,
  subtitle,
  meta,
  width = 375,
  height = 812,
  fillHeight = false,
  maxHeightOffsetPx = 54,
  animated = false,
  reducedMotion = false,
  dark = false,
  showCloseButton = true,
  closeButtonPosition = 'right',
  showDragHandle = false,
  closeLabel = 'Close',
}: {
  title?: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode | ((requestClose: () => void) => ReactNode);
  subtitle?: ReactNode;
  meta?: ReactNode;
  width?: number;
  height?: number;
  fillHeight?: boolean;
  maxHeightOffsetPx?: number;
  animated?: boolean;
  reducedMotion?: boolean;
  dark?: boolean;
  showCloseButton?: boolean;
  closeButtonPosition?: 'left' | 'right';
  showDragHandle?: boolean;
  closeLabel?: string;
}) {
  const c = resolveBottomSheet({
    fillHeight,
    maxHeightOffsetPx,
    animated,
    reducedMotion,
  });
  const animate = animated && !reducedMotion;
  const panelProgress = useRef(new Animated.Value(animate ? 0 : 1)).current;
  const backdropProgress = useRef(new Animated.Value(animate ? 0 : 1)).current;
  const [x1, y1, x2, y2] = c.easing;
  const transition = useCallback(
    (toValue: number) =>
      Animated.parallel([
        Animated.timing(panelProgress, {
          toValue,
          duration: animate ? c.closeDurationMs : 0,
          easing: Easing.bezier(x1, y1, x2, y2),
          useNativeDriver: false,
        }),
        Animated.timing(backdropProgress, {
          toValue,
          duration: animate ? c.backdropDurationMs : 0,
          easing: Easing.bezier(x1, y1, x2, y2),
          useNativeDriver: false,
        }),
      ]),
    [
      panelProgress,
      backdropProgress,
      animate,
      c.closeDurationMs,
      c.backdropDurationMs,
      x1,
      y1,
      x2,
      y2,
    ],
  );
  useEffect(() => {
    const animation = transition(1);
    animation.start();
    return () => animation.stop();
  }, [transition]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const requestClose = useCallback(() => {
    if (timer.current) return;
    if (!c.closeDelay) {
      onClose();
      return;
    }
    transition(0).start();
    timer.current = setTimeout(() => {
      timer.current = null;
      onClose();
    }, c.closeDelay);
  }, [c.closeDelay, onClose, transition]);
  const host = { ...styles.host, width, height };
  const shade = {
    ...styles.shade,
    backgroundColor: sourceColor(c.overlay, dark),
  };
  const panel = {
    ...styles.panel,
    maxHeight: height - maxHeightOffsetPx,
    height: fillHeight ? height - maxHeightOffsetPx : undefined,
    padding: c.padding,
    borderTopLeftRadius: c.radius,
    borderTopRightRadius: c.radius,
    backgroundColor: sourceColor(c.surface, dark),
    boxShadow: `0 -8px 24px ${sourceColor(
      'rgb(var(--uc-shadow-rgb)/0.18)',
      dark,
    )}`,
  };
  const titleStyle = {
    ...styles.title,
    color: sourceColor('var(--uc-text)', dark),
  };
  const supportingStyle = {
    ...styles.supporting,
    color: sourceColor('var(--uc-text-muted)', dark),
  };
  const headingStyle = {
    ...styles.heading,
    justifyContent:
      closeButtonPosition === 'left'
        ? ('flex-start' as const)
        : ('space-between' as const),
  };
  const content =
    typeof children === 'string' || typeof children === 'number' ? (
      <Text>{children}</Text>
    ) : (
      children
    );
  const closeControl = showCloseButton ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={closeLabel}
      onPress={requestClose}
      style={styles.close}
    >
      <SourceCustomIcon
        name="close-x"
        size={c.closeSize}
        color={sourceColor('var(--uc-icon)', dark)}
      />
    </Pressable>
  ) : null;
  const handleColor = {
    ...styles.handleBar,
    backgroundColor: sourceColor('var(--uc-border)', dark),
  };
  return (
    <View style={host}>
      <Animated.View style={[styles.shade, { opacity: backdropProgress }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close sheet"
          onPress={requestClose}
          style={shade}
        />
      </Animated.View>
      <Animated.View
        role="dialog"
        aria-modal
        accessibilityViewIsModal
        style={[
          panel,
          animate
            ? {
                opacity: panelProgress,
                transform: [
                  {
                    translateY: panelProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [c.enteringOffset, 0],
                    }),
                  },
                ],
              }
            : undefined,
        ]}
      >
        {showDragHandle ? (
          <Pressable
            onPress={requestClose}
            accessibilityLabel={closeLabel}
            style={styles.handle}
          >
            <View style={handleColor} />
          </Pressable>
        ) : null}
        <View style={headingStyle}>
          {closeButtonPosition === 'left' ? closeControl : null}
          <View style={styles.titleColumn}>
            <Text style={titleStyle}>{title}</Text>
            {typeof subtitle === 'string' || typeof subtitle === 'number' ? (
              <Text style={supportingStyle}>{subtitle}</Text>
            ) : (
              subtitle
            )}
            {typeof meta === 'string' || typeof meta === 'number' ? (
              <Text style={supportingStyle}>{meta}</Text>
            ) : (
              meta
            )}
          </View>
          {closeButtonPosition === 'right' ? closeControl : null}
        </View>
        <ScrollView
          style={Platform.OS === 'web' ? styles.webScroll : undefined}
          contentContainerStyle={fillHeight ? styles.fillContent : undefined}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
        {typeof footer === 'function' ? footer(requestClose) : footer}
      </Animated.View>
    </View>
  );
}
const styles = StyleSheet.create({
  webScroll: { transform: 'none' },
  fillContent: { flex: 1 },
  supporting: { fontSize: 14 },
  titleColumn: { flexShrink: 1 },
  handle: {
    width: 64,
    height: 16,
    alignSelf: 'center',
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleBar: { width: 32, height: 4, borderRadius: 999 },
  host: { position: 'relative', justifyContent: 'flex-end' },
  shade: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  panel: { width: '100%' },
  heading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 24,
  },
  title: { fontFamily: 'UniCredit-bold', fontSize: 28, flexShrink: 1 },
  close: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
