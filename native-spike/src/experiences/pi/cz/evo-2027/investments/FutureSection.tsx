import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BaselineNavigationRow } from '../../../../../universal/BaselineNavigationRow';
import { BaselineStatusTag } from '../../../../../universal/BaselineStatusTag';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { Text } from '../../../../../universal/Typography';
import type { CurrentScreenProps } from '../../../current/contracts';
import {
  investmentColor,
  investmentDark,
} from '../../../current/investments/baseline/Frame';

/**
 * Shared building blocks of the Evo 2027 Explore and More pages: one section title, one card surface (white, hairline
 * border, radius 12), one grouped list of Design System navigation rows. The page title lives in the header, so a page
 * never repeats it as a big heading.
 */
export function FutureSectionTitle({
  host,
  title,
  caption,
}: {
  host: CurrentScreenProps;
  title: string;
  caption?: string;
}) {
  return (
    <View style={s.title}>
      <Text
        accessibilityRole="header"
        style={[s.titleText, { color: host.tokens.text }]}
      >
        {title}
      </Text>
      {caption ? (
        <Text style={[s.caption, { color: host.tokens.muted }]}>{caption}</Text>
      ) : null}
    </View>
  );
}

export interface FutureListItem {
  id: string;
  title: string;
  description?: string;
  icon: string;
  onPress: () => void;
}

/** A grouped list: one bordered card, rows from the library, hairlines inset to the text. */
export function FutureList({
  host,
  items,
}: {
  host: CurrentScreenProps;
  items: readonly FutureListItem[];
}) {
  const dark = investmentDark(host);
  const border = investmentColor(host, '--uc-border');
  // One row height per list, so the rhythm never changes inside a group.
  const rowHeight = items.some(item => item.description) ? 80 : 64;
  return (
    <View
      style={[
        s.card,
        s.list,
        {
          borderColor: border,
          backgroundColor: investmentColor(host, '--uc-surface'),
        },
      ]}
    >
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 ? (
            <View style={[s.hairline, { backgroundColor: border }]} />
          ) : null}
          <BaselineNavigationRow
            title={item.title}
            description={item.description}
            descriptionStyle={[s.description, { color: host.tokens.muted }]}
            leadingVisual={
              <View
                style={[
                  s.tile,
                  { backgroundColor: investmentColor(host, '--uc-surface-muted') },
                ]}
              >
                <SourceCustomIcon
                  name={item.icon}
                  size={20}
                  color={investmentColor(host, '--uc-text')}
                />
              </View>
            }
            trailingAccessory="chevron"
            rowHeight={rowHeight}
            onPress={item.onPress}
            dark={dark}
          />
        </React.Fragment>
      ))}
    </View>
  );
}

/** One recommended product: name, two quiet tags (class and currency) and a chevron. */
export function FutureRecommendationCard({
  host,
  title,
  tags,
  onPress,
}: {
  host: CurrentScreenProps;
  title: string;
  tags: readonly string[];
  onPress: () => void;
}) {
  const dark = investmentDark(host);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        s.card,
        s.recommendation,
        {
          borderColor: investmentColor(host, '--uc-border'),
          backgroundColor: investmentColor(host, '--uc-surface'),
          opacity: pressed ? 0.65 : 1,
        },
      ]}
    >
      <View style={s.recommendationCopy}>
        <Text style={[s.productName, { color: host.tokens.text }]}>
          {title}
        </Text>
        <View style={s.tags}>
          {tags.map(tag => (
            <BaselineStatusTag
              key={tag}
              label={tag}
              tone="neutral"
              dot={false}
              dark={dark}
            />
          ))}
        </View>
      </View>
      <View style={s.chevron}>
        <SourceCustomIcon
          name="chevron-link"
          color={investmentColor(host, '--uc-text')}
        />
      </View>
    </Pressable>
  );
}

export const futureSectionStyles = StyleSheet.create({
  page: { padding: 16, gap: 24 },
  group: { gap: 12 },
});

const s = StyleSheet.create({
  title: { gap: 4 },
  titleText: { fontFamily: 'UniCredit-bold', fontSize: 20, lineHeight: 28 },
  caption: { fontFamily: 'UniCredit-regular', fontSize: 14, lineHeight: 20 },
  card: { borderWidth: 1, borderRadius: 12 },
  list: { overflow: 'hidden' },
  description: { fontSize: 14, lineHeight: 20 },
  hairline: { height: 1, marginLeft: 72 },
  tile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingLeft: 16,
    paddingRight: 8,
  },
  recommendationCopy: { flex: 1, minWidth: 0, gap: 8 },
  productName: { fontFamily: 'UniCredit-bold', fontSize: 16, lineHeight: 22 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chevron: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
