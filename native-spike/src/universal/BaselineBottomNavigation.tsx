import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import {
  BOTTOM_NAVIGATION_CONTRACT as geometry,
  resolveBottomNavigation,
  resolveNavigationSelection,
  type NavItem,
} from '@/app/components/contracts/bottomNavigation';
import { SourceCustomIcon } from './SourceCustomIcon';
import { sourceColor } from './sourceColor';
import { Text } from './Typography';

/** Baseline leaf only: Evo and country composition stay with their existing hosts. */
export function BaselineBottomNavigation({
  activeTab: controlledTab,
  items,
  myBanker = false,
  labels,
  iconOverrides,
  onTabChange,
  dark = false,
}: {
  activeTab?: NavItem;
  items?: readonly NavItem[];
  myBanker?: boolean;
  labels: Partial<Record<NavItem, string>>;
  iconOverrides?: Partial<Record<NavItem, string>>;
  onTabChange?: (tab: NavItem) => void;
  dark?: boolean;
}) {
  const [internalTab, setInternalTab] = useState<NavItem>('home');
  const activeTab = controlledTab ?? internalTab;
  const activate = (tab: NavItem) => {
    const selection = resolveNavigationSelection(
      internalTab,
      tab,
      Boolean(onTabChange),
    );
    if (onTabChange) {
      onTabChange(tab);
      return;
    }
    setInternalTab(selection.internalTab);
  };
  const barStyle = {
    width: geometry.width,
    height: geometry.height,
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: geometry.gap,
    paddingHorizontal: geometry.paddingHorizontal,
    paddingBottom: geometry.paddingBottom,
  };
  const buttonStyle = {
    flex: 1,
    height: '100%' as const,
    alignItems: 'center' as const,
    borderRadius: geometry.buttonRadius,
  };
  const slotStyle = {
    width: geometry.iconSlotSize,
    height: geometry.iconSlotSize,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };
  const iconLabelStyle = { alignItems: 'center' as const, gap: 0 };
  return (
    <View style={barStyle}>
      {resolveBottomNavigation({ items, myBanker }).map(item => {
        const selected = activeTab === item.id;
        const activeColor = sourceColor(`var(${geometry.activeToken})`, dark);
        const textStyle = {
          fontFamily: 'UniCredit-regular',
          fontSize: geometry.fontSize,
          lineHeight: geometry.lineHeight,
          textAlign: 'center' as const,
          color: selected
            ? activeColor
            : sourceColor(`var(${geometry.labelMutedToken})`, dark),
        };
        return (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityLabel={labels[item.id] ?? item.labelKey}
            accessibilityState={{ selected }}
            onPress={() => activate(item.id)}
            style={buttonStyle}
          >
            <View
              style={{
                width: geometry.indicatorWidth,
                height: geometry.indicatorHeight,
              }}
            >
              {selected && (
                <View
                  style={{
                    width: geometry.indicatorWidth,
                    height: geometry.indicatorHeight,
                    borderTopLeftRadius: geometry.indicatorRadius,
                    borderTopRightRadius: geometry.indicatorRadius,
                    backgroundColor: activeColor,
                  }}
                />
              )}
            </View>
            <View style={iconLabelStyle}>
              <View style={slotStyle}>
                <SourceCustomIcon
                  name={iconOverrides?.[item.id] ?? item.icon}
                  size={20}
                  color={
                    selected
                      ? activeColor
                      : sourceColor(`var(${geometry.iconMutedToken})`, dark)
                  }
                />
              </View>
              <Text style={textStyle}>{labels[item.id] ?? item.labelKey}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
