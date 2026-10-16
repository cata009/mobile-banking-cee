import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import {
  resolveMailboxTabs,
  centeredMailboxScroll,
  type MessagesMailboxTab,
} from '@/app/components/contracts/mailboxTabs';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';

/** Isolated controlled tabs. Native gesture/centering acceptance remains separate. */
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
}) {
  const state = resolveMailboxTabs({ layout, minTabWidth, withTopMargin });
  const moved = useRef(false);
  const rail = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const measured = useRef(new Map<string, { x: number; width: number }>());
  const [viewportWidth, setViewportWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [layoutVersion, setLayoutVersion] = useState(0);
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
  const tabHeight = state.height - (includeBorderInHeight ? 1 : 0);
  const railStyle = { flexDirection: 'row' as const, height: tabHeight };
  const ink = sourceColor('var(--uc-text)', dark);
  const controls = tabs.map(tab => {
    const selected = tab.id === activeTabId;
    const buttonStyle = {
      flex: state.isScrollable ? undefined : 1,
      minWidth: state.isScrollable ? state.minTabWidth : undefined,
      height: tabHeight,
      paddingHorizontal: state.tabPadding,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      position: 'relative' as const,
    };
    const labelStyle = {
      fontFamily: 'UniCredit-bold',
      fontSize: state.fontSize,
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
    >
      {state.isScrollable ? (
        <ScrollView
          ref={rail}
          onLayout={event => setViewportWidth(event.nativeEvent.layout.width)}
          onContentSizeChange={width => setContentWidth(width)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={railStyle}
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
