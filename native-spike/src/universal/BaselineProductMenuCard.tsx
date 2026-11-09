import React, { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  resolveProductMenuCard,
  type MarketingCardVariant,
} from '@/app/components/contracts/marketingCard';
import { sourceColor } from './sourceColor';
import { Text } from './Typography';

/** Original raster references or caller-supplied original artwork; no fallback illustrations are redrawn. */
export function BaselineProductMenuCard({
  card,
  variant = 'standard',
  badgeCount,
  onPress,
  artwork,
  dark = false,
  testID,
  accessibilityLabel,
  titleLineHeight,
}: {
  card: {
    id: string;
    title: string;
    background: string;
    imageSrc?: string | number;
  };
  variant?: MarketingCardVariant;
  badgeCount?: number;
  onPress?: (card: {
    id: string;
    title: string;
    background: string;
    imageSrc?: string | number;
  }) => void;
  artwork?: React.ReactNode;
  dark?: boolean;
  testID?: string;
  accessibilityLabel?: string;
  /** Explicit title line height in px; the contract default follows the platform. */
  titleLineHeight?: number;
}) {
  const contract = resolveProductMenuCard({ id: card.id, variant, badgeCount });
  const rootStyle: ViewStyle = {
    width: '100%',
    height: contract.height,
    maxHeight: contract.height,
    padding: contract.padding,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: contract.gap,
    overflow: 'hidden',
    borderRadius: contract.radius,
    backgroundColor: sourceColor(card.background, dark),
  };
  const titleStyle = {
    zIndex: 10,
    flexShrink: 1,
    fontFamily: 'UniCredit-bold',
    fontSize: contract.titleFontSize,
    ...(titleLineHeight === undefined ? {} : { lineHeight: titleLineHeight }),
    color: sourceColor('var(--uc-text-inverse)', dark),
  };
  const imageStyle = { position: 'absolute' as const, ...contract.image };
  const badgeStyle = {
    zIndex: 10,
    padding: 2,
    borderRadius: 2,
    flexShrink: 0,
    backgroundColor: sourceColor('var(--uc-brand)', dark),
  };
  const badgeTextStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 14,
    color: sourceColor('var(--uc-static-white)', dark),
  };
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? card.title.replace(/\n/g, ' ')}
      onPress={() => onPress?.(card)}
      style={rootStyle}
    >
      <Text style={titleStyle}>{card.title}</Text>
      {contract.badgeText !== null && (
        <View style={badgeStyle}>
          <Text style={badgeTextStyle}>{contract.badgeText}</Text>
        </View>
      )}
      {card.imageSrc ? (
        <Image
          source={
            typeof card.imageSrc === 'number'
              ? card.imageSrc
              : { uri: card.imageSrc }
          }
          resizeMode="contain"
          style={imageStyle}
        />
      ) : (
        artwork
      )}
    </Pressable>
  );
}

/**
 * The menu-card grid: cards share the row width (no fixed pixel width), and the number of columns follows the width
 * the grid is given, so it also works on foldables and wide phones. `columns` forces a count (1 = full-width cards).
 */
export function BaselineProductMenuGrid({
  children,
  columns,
  minCardWidth = 148,
  gap = 12,
  style,
}: {
  children: React.ReactNode;
  columns?: number;
  minCardWidth?: number;
  gap?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const [width, setWidth] = useState(0);
  const onLayout = (event: LayoutChangeEvent) =>
    setWidth(event.nativeEvent.layout.width);
  const items = React.Children.toArray(children);
  const count =
    columns ??
    Math.max(
      2,
      Math.min(4, Math.floor((width + gap) / (minCardWidth + gap)) || 2),
    );
  const rows: React.ReactNode[][] = [];
  for (let i = 0; i < items.length; i += count)
    rows.push(items.slice(i, i + count));
  return (
    <View onLayout={onLayout} style={[{ gap }, style]}>
      {rows.map((row, rowIndex) => (
        <View
          key={rowIndex}
          testID="product-menu-grid-row"
          style={[styles.row, { gap }]}
        >
          {row.map((item, index) => (
            <View key={index} style={styles.cell}>
              {item}
            </View>
          ))}
          {Array.from({ length: count - row.length }, (_, index) => (
            <View key={`spacer-${index}`} style={styles.cell} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  cell: { flex: 1, minWidth: 0 },
});
