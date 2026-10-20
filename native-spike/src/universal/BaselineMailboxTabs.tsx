import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  PanResponder,
  Platform,
  ScrollView,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {
  resolveMailboxTabs,
  centeredMailboxScroll,
  type MessagesMailboxTab,
} from '@/app/components/contracts/mailboxTabs';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';

/** Canonical controlled tabs; equal two-item geometry follows the original Tab source. */
export function BaselineMailboxTabs({
  tabs,
  activeTabId,
  onChange,
  layout = 'equal',
  minTabWidth = 0,
  withTopMargin = true,
  ariaLabel = 'Mailbox tabs',
  dark = false,
  includeBorderInHeight = false,
  labelTextStyle,
  dragScroll = false,
  scrollStyle,
}: {
  tabs: readonly MessagesMailboxTab[];
  activeTabId: string;
  onChange: (id: string) => void;
  layout?: 'equal' | 'scrollable';
  minTabWidth?: number;
  withTopMargin?: boolean;
  ariaLabel?: string;
  dark?: boolean;
  includeBorderInHeight?: boolean;
  labelTextStyle?: StyleProp<TextStyle>;
  dragScroll?: boolean;
  scrollStyle?: StyleProp<ViewStyle>;
}) {
  const state = resolveMailboxTabs({
    layout,
    minTabWidth,
    withTopMargin,
    itemCount: tabs.length,
  });
  const moved = useRef(false);
  const rail = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const measured = useRef(new Map<string, { x: number; width: number }>());
  const [viewportWidth, setViewportWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const position = useRef(0),
    origin = useRef(0),
    suppressUntil = useRef(0);
  const dimensions = useRef({ viewportWidth, contentWidth });
  dimensions.current = { viewportWidth, contentWidth };
  const drag = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) =>
          dragScroll &&
          state.isScrollable &&
          Platform.OS === 'web' &&
          Math.abs(gesture.dx) > state.dragThreshold &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: () => {
          origin.current = position.current;
          suppressUntil.current = Infinity;
        },
        onPanResponderMove: (_event, gesture) =>
          rail.current?.scrollTo({
            x: Math.max(
              0,
              Math.min(
                dimensions.current.contentWidth -
                  dimensions.current.viewportWidth,
                origin.current - gesture.dx,
              ),
            ),
            animated: false,
          }),
        onPanResponderRelease: () => {
          suppressUntil.current = Date.now() + 80;
          moved.current = false;
        },
        onPanResponderTerminate: () => {
          suppressUntil.current = Date.now() + 80;
          moved.current = false;
        },
      }),
    [dragScroll, state.isScrollable, state.dragThreshold],
  );
  useEffect(() => {
    const active = measured.current.get(activeTabId);
    if (!state.isScrollable || !active || !viewportWidth) return;
    rail.current?.scrollTo({
      x: centeredMailboxScroll(
        active.x,
        viewportWidth,
        active.width,
        contentWidth,
      ),
      animated: true,
    });
  }, [
    activeTabId,
    state.isScrollable,
    viewportWidth,
    contentWidth,
    layoutVersion,
  ]);
  const rootStyle = {
    height: state.height,
    marginTop: state.topMargin,
    borderBottomWidth: 1,
    borderBottomColor: sourceColor('var(--uc-border)', dark),
  };
  const tabHeight =
    state.height - (includeBorderInHeight || state.sourceTwoItems ? 1 : 0);
  const railStyle = { flexDirection: 'row' as const, height: tabHeight };
  const ink = sourceColor('var(--uc-text)', dark);
  const controls = tabs.map(tab => {
    const selected = tab.id === activeTabId;
    const buttonStyle = {
      flex: state.isScrollable ? undefined : 1,
      minWidth: state.isScrollable ? state.minTabWidth : undefined,
      height: tabHeight,
      paddingHorizontal: state.tabPadding,
      paddingTop: state.contentInsetTop,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      position: 'relative' as const,
    };
    const labelStyle = {
      fontFamily: 'UniCredit-bold',
      fontSize: state.fontSize,
      lineHeight: state.lineHeight,
      color: selected ? ink : sourceColor('var(--uc-text-muted)', dark),
    };
    const badgeStyle = {
      width: state.badgeSize,
      height: state.badgeSize,
      marginRight: state.badgeGap,
      borderRadius: 999,
      backgroundColor: sourceColor('var(--uc-action)', dark),
    };
    const underlineStyle = {
      position: 'absolute' as const,
      bottom: -1,
      left: 0,
      right: 0,
      height: state.underlineHeight,
      backgroundColor: ink,
    };
    return (
      <Pressable
        key={tab.id}
        onLayout={event => {
          const { x, width } = event.nativeEvent.layout;
          const previous = measured.current.get(tab.id);
          if (previous?.x === x && previous.width === width) return;
          measured.current.set(tab.id, { x, width });
          setLayoutVersion(value => value + 1);
        }}
        accessibilityRole="tab"
        accessibilityLabel={tab.label}
        accessibilityState={{ selected }}
        aria-selected={selected}
        onPress={() => {
          if (Date.now() < suppressUntil.current) return;
          if (moved.current) {
            moved.current = false;
            return;
          }
          onChange(tab.id);
        }}
        style={buttonStyle}
      >
        {tab.hasNewItems ? (
          <View style={badgeStyle} accessibilityElementsHidden />
        ) : null}
        <Text numberOfLines={1} style={[labelStyle, labelTextStyle]}>
          {tab.label}
        </Text>
        {selected ? (
          <View style={underlineStyle} accessibilityElementsHidden />
        ) : null}
      </Pressable>
    );
  });
  return (
    <View
      accessibilityRole="tablist"
      role="tablist"
      accessibilityLabel={ariaLabel}
      style={rootStyle}
      {...(dragScroll ? drag.panHandlers : {})}
    >
      {state.isScrollable ? (
        <ScrollView
          ref={rail}
          style={scrollStyle}
          onLayout={event => setViewportWidth(event.nativeEvent.layout.width)}
          onContentSizeChange={width => setContentWidth(width)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={railStyle}
          onScroll={event => {
            position.current = event.nativeEvent.contentOffset.x;
          }}
          scrollEventThrottle={16}
          onScrollBeginDrag={() => {
            moved.current = true;
          }}
        >
          {controls}
        </ScrollView>
      ) : (
        <View style={railStyle}>{controls}</View>
      )}
    </View>
  );
}
