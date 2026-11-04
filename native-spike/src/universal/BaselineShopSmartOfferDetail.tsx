import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { ShopSmartOfferCard } from '@/app/config/productsMenuConfig';
import { BaselineNavigationRow } from './BaselineNavigationRow';
import { BaselinePageHeader } from './BaselinePageHeader';
import { DuoReadable } from './DuoPreview';
import { RasterImage } from '../experiences/pi/current/baseline/offers/RasterImage';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';
import type { CurrentScreenProps } from '../experiences/pi/current/contracts';

function offerCopy(title: string) {
  const normalized = title.replace(/\s+/g, ' ').trim();
  const condition = normalized.match(
    /\s+(peste|over|above|on selected|on home|on tech|for selected)\s+(.+)$/i,
  );
  if (!condition || condition.index === undefined)
    return { headline: normalized, condition: '' };
  return {
    headline: normalized.slice(0, condition.index).trim(),
    condition: `${condition[1]} ${condition[2]}`,
  };
}

function Section({
  label,
  children,
  dark,
}: {
  label: string;
  children: React.ReactNode;
  dark: boolean;
}) {
  const text = sourceColor('var(--uc-text)', dark);
  return (
    <View style={s.section}>
      <Text accessibilityRole="header" style={[s.sectionLabel, { color: text }]}>
        {label}
      </Text>
      {children}
    </View>
  );
}

/** Shared detail page for ShopSmart and Partner offers in the current design system. */
export function BaselineShopSmartOfferDetail({
  host,
  offer,
}: {
  host: CurrentScreenProps;
  offer: ShopSmartOfferCard;
}) {
  const dark = host.tokens.background === '#121212';
  const text = sourceColor('var(--uc-text)', dark);
  const details = host.t(
    'runtime.productsMenu.offerDetail.details',
    'Offer terms and eligibility apply. Check the partner’s current conditions before purchase.',
  );
  const aboutPartner = host.t(
    'runtime.productsMenu.offerDetail.aboutPartner',
    `Learn more about ${offer.merchant} and its available products and services.`,
  );
  const { headline, condition } = offerCopy(offer.title);
  const expiry = offer.statusText.replace(/^until\s+/i, '').replace(/-/g, ' ');
  const imageSource =
    typeof offer.imageSrc === 'number'
      ? offer.imageSrc
      : { uri: offer.imageSrc };

  return (
    <DuoReadable>
      <View
        testID="shopsmart-offer-detail"
        style={[s.screen, { backgroundColor: sourceColor('var(--uc-surface)', dark) }]}
      >
        <BaselinePageHeader
          title={offer.merchant}
          onBack={host.onBack}
          includeSafeArea
          safeAreaReserve={host.screenTopInset}
          showHelp={false}
          largeTitleGutter={24}
          dark={dark}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.content}
        >
          <View
            testID="shopsmart-offer-detail-image"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={s.imageFrame}
          >
            <RasterImage
              accessibilityLabel={offer.merchant}
              source={imageSource}
              resizeMode="cover"
              style={s.image}
            />
          </View>
          <Section
            label={host.t('runtime.productsMenu.offerDetail.offer', 'OFFER')}
            dark={dark}
          >
            <Text style={[s.detailText, s.detailEmphasis, { color: text }]}>
              {headline}
            </Text>
            {condition ? (
              <Text style={[s.detailText, { color: text }]}>{condition}</Text>
            ) : null}
          </Section>
          <Section
            label={host.t(
              'runtime.productsMenu.offerDetail.expiringDate',
              'EXPIRING DATE',
            )}
            dark={dark}
          >
            <Text style={[s.detailText, { color: text }]}>{expiry}</Text>
          </Section>
          <Section
            label={host.t('runtime.productsMenu.offerDetail.detailsLabel', 'DETAILS')}
            dark={dark}
          >
            <Text style={[s.detailText, { color: text }]}>{details}</Text>
          </Section>
          <Section
            label={host.t(
              'runtime.productsMenu.offerDetail.aboutPartnerLabel',
              'ABOUT PARTNER',
            )}
            dark={dark}
          >
            <Text style={[s.detailText, { color: text }]}>{aboutPartner}</Text>
          </Section>
        </ScrollView>
        <View style={s.footer}>
          <BaselineNavigationRow
            title={host.t(
              'runtime.productsMenu.offerDetail.seeShops',
              'SEE THE LIST OF SHOPS',
            )}
            leadingIconName="shopsmart-store"
            trailingAccessory="chevron"
            rowHeight={80}
            style={s.shopListRow}
            titleStyle={s.shopListLabel}
            dark={dark}
            onPress={() =>
              host.onNavigate({ screen: 'products', params: { view: 'shopsmart' } })
            }
          />
        </View>
      </View>
    </DuoReadable>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, width: '100%', overflow: 'hidden' },
  content: {
    width: '100%',
    maxWidth: 375,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 24,
  },
  imageFrame: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  section: { alignItems: 'flex-start' },
  sectionLabel: {
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
    lineHeight: 20,
  },
  detailText: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 20,
  },
  detailEmphasis: { fontFamily: 'UniCredit-bold' },
  footer: { paddingBottom: 54 },
  shopListRow: { paddingLeft: 16, paddingRight: 12 },
  shopListLabel: { fontSize: 16 },
});
