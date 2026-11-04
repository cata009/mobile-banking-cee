import React, { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from '../../../../../universal/Typography';
import { useDemoViewport } from '../../../../../universal/DemoViewport';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
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
import { ShopSmartCategoryTabs } from './ShopSmartCategoryTabs';

export function ShopSmartHome({ host }: { host: CzechNativeScreenProps }) {
  const [filter, setFilter] = useState<'popular' | ShopSmartOfferCategory>(
    'popular',
  );
  // The app surface, not the browser window: the phone canvas is narrower than the workbench.
  const { width: availableWidth } = useDemoViewport();
  const copy = createEvoTranslations(host.language ?? 'en').shopsmart;
  const offers = getProductsMenuForCountry('CZ').shopSmartOfferCards;
  const visible =
    filter === 'popular'
      ? offers
      : offers.filter(offer => offer.categories.includes(filter));
  const cardWidth = Math.min(288, Math.max(0, availableWidth - 32));
  const rail = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const mouse = useMouseCarousel({
    rail,
    offsets: visible.map((_, index) => index * (cardWidth + 12)),
  });
  if (!offers.length) return null;
  return (
    <View style={s.section}>
      <Text style={t.title}>{copy.heading}</Text>
      <ShopSmartCategoryTabs
        value={filter}
        labels={copy.filters}
        label={copy.categoriesLabel}
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
              accessibilityLabel={`Open ${offer.merchant} offer`}
              onPress={() =>
                host.onNavigate({
                  screen: 'product-detail',
                  params: { offerId: offer.id, title: offer.merchant },
                })
              }
              style={[s.card, { width: cardWidth }]}
            >
              <View style={s.media}>
                <SourcePhoto asset={offer.imageSrc} height={130} />
                {offer.tagLabel && (
                  <View style={s.tag}>
                    <Text style={s.tagText}>{offer.tagLabel}</Text>
                  </View>
                )}
                {offer.pillLabel && (
                  <View
                    style={[
                      s.pill,
                      offer.pillTone === 'white' ? s.pillWhite : s.pillTeal,
                    ]}
                  >
                    <Text
                      style={[
                        s.pillText,
                        offer.pillTone === 'white' ? s.pillTextDark : s.pillTextLight,
                      ]}
                    >
                      {offer.pillLabel}
                    </Text>
                  </View>
                )}
              </View>
              <View style={s.copy}>
                <View>
                  <Text style={s.merchant}>{offer.merchant}</Text>
                  <Text style={s.title}>{offer.title}</Text>
                </View>
                <View style={s.status}>
                  <Text style={s.statusText}>{offer.statusText}</Text>
                  <View style={s.statusTrailing}>
                    {offer.distance && (
                      <Text style={s.distance}>{offer.distance}</Text>
                    )}
                    <View style={s.iconSlot}>
                      <SourceCustomIcon
                        name={
                          offer.trailingIcon === 'partners'
                            ? 'shopsmart-store'
                            : 'contact-website'
                        }
                        size={24}
                        color={tokens.text}
                      />
                    </View>
                  </View>
                </View>
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
    borderWidth: 0,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: tokens.surface,
  },
  media: { height: 130 },
  // Design-system Shopsmart: 16px sides, 9px top, 13px bottom, 16px between blocks.
  copy: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 9,
    paddingBottom: 13,
    gap: 16,
  },
  merchant: {
    fontFamily: tokens.strongFont,
    color: tokens.accent,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  title: {
    fontFamily: tokens.strongFont,
    color: tokens.text,
    fontSize: 18,
    lineHeight: 23,
    letterSpacing: 0.42,
    marginTop: 1,
  },
  status: {
    minHeight: 32,
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusText: {
    flexShrink: 1,
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 14,
    lineHeight: 16,
    letterSpacing: 1,
  },
  statusTrailing: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  distance: {
    fontFamily: tokens.strongFont,
    color: tokens.text,
    fontSize: 14,
    lineHeight: 16,
    letterSpacing: 0.22,
  },
  iconSlot: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tag: {
    position: 'absolute',
    left: 0,
    top: 16,
    height: 24,
    justifyContent: 'center',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    paddingHorizontal: 12,
    backgroundColor: '#F0871D',
  },
  tagText: {
    fontFamily: tokens.strongFont,
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  // Pill straddles the bottom edge of the photo: top 112 + 36 height on a 130 image.
  pill: {
    position: 'absolute',
    right: 7,
    top: 112,
    width: 120,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 4px rgba(0,0,0,0.25)',
  },
  pillWhite: { backgroundColor: tokens.surface },
  pillTeal: { backgroundColor: tokens.accent },
  pillTextDark: { color: tokens.text },
  pillTextLight: { color: '#ffffff' },
  pillText: {
    fontFamily: tokens.strongFont,
    fontSize: 14,
    lineHeight: 18,
  },
});
