import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { Text } from '../../../../../universal/Typography';
import type { ShopSmartOfferCategory } from '@/app/config/productsMenuConfig';
import { evoTokens as tokens } from './tokens';

export type ShopSmartCategory = 'popular' | ShopSmartOfferCategory;

export const SHOPSMART_CATEGORIES: readonly ShopSmartCategory[] = [
  'popular',
  'eshops',
  'electronics',
  'travel',
  'home',
];

export function ShopSmartCategoryTabs({
  value,
  labels,
  label,
  onChange,
}: {
  value: ShopSmartCategory;
  labels: Record<string, string>;
  label: string;
  onChange: (value: ShopSmartCategory) => void;
}) {
  const rail = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [itemWidths, setItemWidths] = useState<Record<string, number>>({});
  const currentOffset = useRef(0);

  const selectCategory = (category: ShopSmartCategory) => {
    const widthsReady = SHOPSMART_CATEGORIES.every(
      item => itemWidths[item] !== undefined,
    );
    const width = itemWidths[category];
    if (viewportWidth && width !== undefined && widthsReady) {
      const index = SHOPSMART_CATEGORIES.indexOf(category);
      const itemLeft = SHOPSMART_CATEGORIES.slice(0, index).reduce(
        (total, item) => total + itemWidths[item] + 8,
        0,
      );
      const itemRight = itemLeft + width;
      const visibleLeft = itemLeft - currentOffset.current;
      const visibleRight = viewportWidth - (itemRight - currentOffset.current);
      const edgeInset = 24;

      if (visibleLeft < edgeInset || visibleRight < edgeInset) {
        const trailingSpace = Math.max(16, viewportWidth / 2);
        const contentWidth =
          SHOPSMART_CATEGORIES.reduce(
            (total, item) => total + itemWidths[item],
            0,
          ) + (SHOPSMART_CATEGORIES.length - 1) * 8 + trailingSpace;
        const maxOffset = Math.max(0, contentWidth - viewportWidth);
        const centeredOffset = itemLeft + width / 2 - viewportWidth / 2;
        const targetOffset = Math.max(0, Math.min(maxOffset, centeredOffset));

        if (Math.abs(targetOffset - currentOffset.current) > 1) {
          rail.current?.scrollTo({
            x: targetOffset,
            y: 0,
            animated: true,
          });
        }
      }
    }
    onChange(category);
  };

  return (
    <ScrollView
      ref={rail}
      horizontal
      accessibilityLabel={label}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        s.rail,
        { paddingRight: Math.max(16, viewportWidth / 2) },
      ]}
      onLayout={event => setViewportWidth(event.nativeEvent.layout.width)}
      onScroll={event => {
        currentOffset.current = event.nativeEvent.contentOffset.x;
      }}
      scrollEventThrottle={16}
    >
      {SHOPSMART_CATEGORIES.map(category => {
        const selected = value === category;
        return (
          <Pressable
            key={category}
            accessibilityRole="tab"
            accessibilityLabel={labels[category]}
            accessibilityState={{ selected }}
            aria-selected={selected}
            onLayout={event => {
              const width = event.nativeEvent.layout.width;
              setItemWidths(current =>
                current[category] === width
                  ? current
                  : { ...current, [category]: width },
              );
            }}
            onPress={() => selectCategory(category)}
            style={[s.category, selected && s.selectedCategory]}
          >
            <Text style={[s.text, selected && s.selectedText]}>
              {labels[category]}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  rail: { gap: 8, paddingRight: 16 },
  category: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: tokens.border,
    borderRadius: 20,
    backgroundColor: tokens.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCategory: {
    borderColor: tokens.accent,
    backgroundColor: tokens.accent,
  },
  text: {
    color: tokens.muted,
    fontFamily: tokens.font,
    fontSize: 14,
    lineHeight: 18,
  },
  selectedText: { color: '#ffffff', fontFamily: tokens.strongFont },
});
