import React, { useMemo, useState } from 'react';
import { Platform, type ViewStyle } from 'react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { getProductsMenuForCountry } from '@/app/config/productsMenuConfig';
import type { CurrentScreenProps } from '../../contracts';
import type {
  NativeProductsPreview,
  NativeProductsPreviewAction,
} from '@/features/demo-native/productsPreviewContracts';
import { BaselineSearchBar } from '../../../../../universal/BaselineSearchBar';
import { BaselineSectionDivider } from '../../../../../universal/BaselineSectionDivider';
import { BaselineShopsmartOfferCard } from '../../../../../universal/BaselineShopsmartOfferCard';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { sourceColor } from '../../../../../universal/sourceColor';
import { Text } from '../../../../../universal/Typography';
import {
  DuoReadable,
  useDuoPreview,
} from '../../../../../universal/DuoPreview';
import { RasterImage } from './RasterImage';

/** Source ShopSmartContent: the shelf host owns tabs and scrolling. */
export default function ShopSmart({
  host,
  preview,
  onPreviewAction,
}: {
  host: CurrentScreenProps;
  preview?: Extract<NativeProductsPreview, { region: 'products-shopsmart' }>;
  onPreviewAction?: (action: NativeProductsPreviewAction) => void;
}) {
  const config = getProductsMenuForCountry(host.country);
  const duo = useDuoPreview();
  const summary = preview?.summary ?? config.shopSmartSummary;
  const offerCards = preview?.offerCards ?? config.shopSmartOfferCards;
  const [searchQuery, setSearchQuery] = useState('');
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const visibleOffers = useMemo(
    () =>
      offerCards.filter(offer => {
        if (!normalizedSearchQuery) return true;
        const searchableText = [
          offer.merchant,
          offer.title,
          offer.statusText,
          offer.pillLabel,
          offer.tagLabel,
          offer.partnerTagLabel,
          offer.distance,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return searchableText.includes(normalizedSearchQuery);
      }),
    [offerCards, normalizedSearchQuery],
  );
  const dark = host.tokens.background === '#121212';
  const stickySearchStyle =
    Platform.OS === 'web'
      ? ({
          position: 'sticky',
          top: preview?.stickySearchTop ?? 0,
          zIndex: 1,
          backgroundColor: sourceColor('var(--uc-surface)', dark),
        } as unknown as ViewStyle)
      : undefined;
  return (
    <DuoReadable>
      <View testID="ro-offers-shopsmart-content" style={styles.content}>
        {preview?.showSummary === false ? null : (
          <Pressable
            testID="ro-offers-shopsmart-summary"
            accessibilityRole="button"
            onPress={() => {}}
            style={styles.summary}
          >
            <View style={styles.summaryCopy}>
              <Text style={[styles.activated, { color: host.tokens.muted }]}>
                ACTIVATED OFFERS:{summary.activatedOffers}
              </Text>
              <Text style={[styles.savedLabel, { color: host.tokens.text }]}>
                {summary.totalSavedLabel}
              </Text>
              <Text style={[styles.savedAmount, { color: host.tokens.text }]}>
                {summary.totalSavedAmount}
              </Text>
            </View>
            <View style={styles.iconSlot}>
              <SourceCustomIcon
                name="chevron-link"
                size={32}
                color={host.tokens.text}
              />
            </View>
          </Pressable>
        )}
        <View style={styles.offersContent}>
          <View style={styles.heading}>
            <BaselineSectionDivider
              title={host.t('runtime.productsMenu.allOffers', 'ALL OFFERS')}
              dark={dark}
            />
          </View>
          <View
            style={[
              styles.searchBand,
              preview?.searchSurface && Platform.OS !== 'web'
                ? { backgroundColor: sourceColor('var(--uc-surface)', dark) }
                : null,
              stickySearchStyle,
            ]}
          >
            <BaselineSearchBar
              dark={dark}
              value={searchQuery}
              onValueChange={query => {
                setSearchQuery(query);
                if (preview)
                  onPreviewAction?.({ type: 'search-change', query });
              }}
              onFilterClick={() => {}}
              placeholder={host.t('runtime.actions.search', 'Search')}
              trailingLabel={host.t('runtime.actions.filters', 'Filters')}
            />
          </View>
          <View testID="ro-offers-shopsmart-offers" style={styles.offers}>
            {visibleOffers.map(offer => (
              <View
                key={offer.id}
                testID={`ro-offers-${offer.id}`}
                style={
                  duo
                    ? { width: '100%', maxWidth: 375, alignSelf: 'center' }
                    : undefined
                }
              >
                <BaselineShopsmartOfferCard
                  merchant={offer.merchant}
                  title={offer.title}
                  statusText={offer.statusText}
                  imageSrc={offer.imageSrc}
                  imageHeight={130}
                  imageLayer={
                    <RasterImage
                      accessibilityLabel={offer.merchant}
                      source={
                        typeof offer.imageSrc === 'number'
                          ? offer.imageSrc
                          : { uri: offer.imageSrc }
                      }
                      style={styles.image}
                      resizeMode="cover"
                    />
                  }
                  pillLabel={offer.pillLabel}
                  pillTone={offer.pillTone}
                  tagLabel={offer.tagLabel}
                  distance={offer.distance}
                  trailingIcon={offer.trailingIcon}
                  variant="default"
                  onPress={() => {
                    if (preview)
                      onPreviewAction?.({
                        type: 'offer-open',
                        offerId: offer.id,
                      });
                  }}
                  dark={dark}
                />
              </View>
            ))}
            {visibleOffers.length === 0 && (
              <Text style={[styles.empty, { color: host.tokens.muted }]}>
                {host.t(
                  'runtime.productsMenu.noOffersFound',
                  'No offers found',
                )}
              </Text>
            )}
          </View>
        </View>
      </View>
    </DuoReadable>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: '100%' },
  content: { paddingTop: 16, gap: 16 },
  summary: {
    minHeight: 80,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  summaryCopy: { flex: 1, minWidth: 0 },
  activated: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  savedLabel: {
    marginTop: 2,
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
    lineHeight: 24,
  },
  savedAmount: {
    marginTop: 1,
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 20,
  },
  iconSlot: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offersContent: { gap: 16 },
  heading: { paddingHorizontal: 24 },
  searchBand: { paddingHorizontal: 16, paddingVertical: 2 },
  offers: { paddingHorizontal: 24, gap: 16 },
  empty: {
    paddingVertical: 24,
    textAlign: 'center',
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 18,
  },
});
