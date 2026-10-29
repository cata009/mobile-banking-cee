import React, { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { Text } from '../../../../../universal/Typography';
import { Tabs } from '../../../../../universal/controls';
import {
  getProductsMenuForCountry,
  type ShopSmartOfferCategory,
} from '@/app/config/productsMenuConfig';
import { createEvoTranslations } from '@/translations/evo';
import type { CzechNativeScreenProps } from '../contracts';
import { SourcePhoto } from '../products/SourcePhoto';
import { evoTokens as tokens } from './tokens';
import { textStyles as t } from './Primitives';
import { useMouseCarousel } from '../mouseCarousel';

export function ShopSmartHome({ host }: { host: CzechNativeScreenProps }) {
  const [filter, setFilter] = useState<'popular' | ShopSmartOfferCategory>(
    'popular',
  );
  const { width } = useWindowDimensions();
  const copy = createEvoTranslations(host.language ?? 'en').shopsmart;
  const offers = getProductsMenuForCountry('CZ').shopSmartOfferCards;
  const visible =
    filter === 'popular'
      ? offers
      : offers.filter(offer => offer.categories.includes(filter));
  const cardWidth = Math.min(528, width - 32) - 24;
  const rail = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const mouse = useMouseCarousel({
    rail,
    offsets: visible.map((_, index) => index * (cardWidth + 12)),
  });
  if (!offers.length) return null;
  return (
    <View style={s.section}>
      <Text style={t.title}>{copy.heading}</Text>
      <Tabs
        tokens={{ ...tokens, background: tokens.surface }}
        value={filter}
        label={copy.categoriesLabel}
        items={(
          ['popular', 'eshops', 'electronics', 'travel', 'home'] as const
        ).map(value => ({ value, label: copy.filters[value] }))}
        onChange={setFilter}
      />
      <View ref={mouse.containerRef} {...mouse.panHandlers}>
        <ScrollView
          ref={rail}
          key={filter}
          horizontal
          accessibilityLabel={copy.offersLabel}
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardWidth + 12}
          decelerationRate="fast"
          contentContainerStyle={s.rail}
          onScroll={event =>
            mouse.trackOffset(event.nativeEvent.contentOffset.x)
          }
          scrollEventThrottle={16}
        >
          {visible.map(offer => (
            <Pressable
              key={offer.id}
              accessibilityRole="button"
              accessibilityLabel={offer.title}
              onPress={() => host.onNavigate({ screen: 'products' })}
              style={[s.card, { width: cardWidth }]}
            >
              <View>
                <SourcePhoto asset={offer.imageSrc} height={130} />
                {offer.tagLabel && (
                  <View style={s.tag}>
                    <Text style={s.tagText}>{offer.tagLabel}</Text>
                  </View>
                )}
              </View>
              <View style={s.copy}>
                <Text style={[t.body, t.strong]}>{offer.merchant}</Text>
                <Text style={s.title}>{offer.title}</Text>
                {offer.pillLabel && (
                  <Text style={[t.body, t.strong, s.pill]}>
                    {offer.pillLabel}
                  </Text>
                )}
                <Text style={[t.body, t.muted]}>{offer.statusText}</Text>
                {offer.distance && (
                  <Text style={[t.body, t.muted]}>{offer.distance}</Text>
                )}
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  section: { gap: 12 },
  rail: { gap: 12 },
  card: {
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: tokens.surface,
  },
  copy: { padding: 16, gap: 8 },
  title: {
    fontFamily: tokens.strongFont,
    color: tokens.text,
    fontSize: 22,
    lineHeight: 26,
  },
  tag: {
    position: 'absolute',
    right: 12,
    top: 12,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: tokens.accent,
  },
  tagText: {
    fontFamily: tokens.strongFont,
    color: tokens.inverse,
    fontSize: 13,
    lineHeight: 16,
  },
  pill: { color: tokens.accent },
});
