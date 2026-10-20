import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ImageStyle,
} from 'react-native';
import { resolveProductMenuCard } from '@/app/components/contracts/marketingCard';
import {
  getProductsMenuForCountry,
  type ProductsCard,
  type ProductsOffer,
} from '@/app/config/productsMenuConfig';
import { getProductBannerTone } from '@/app/config/productBannerVariants';
import type { CurrentScreenProps } from '../../contracts';
import { getFutureGainProductOffers } from '@/features/investments/future-gain/offers';
import { futureGainEnabled } from '../../future-gain/model';
import type {
  NativeProductsPreview,
  NativeProductsPreviewAction,
} from '@/features/demo-native/productsPreviewContracts';
import { BaselineProductOfferCard } from '../../../../../universal/BaselineProductOfferCard';
import { BaselineProductMenuCard } from '../../../../../universal/BaselineProductMenuCard';
import { BaselineSectionDivider } from '../../../../../universal/BaselineSectionDivider';
import { useDemoViewport } from '../../../../../universal/DemoViewport';
import { sourceColor } from '../../../../../universal/sourceColor';
import { RasterImage } from './RasterImage';

const CARD_WIDTH = 327;
const CARD_GAP = 12;
const EDGE_GUTTER = 24;

export function localized(
  host: Pick<CurrentScreenProps, 't'>,
  key: string,
  fallback: string,
) {
  const value = host.t(key, fallback);
  return value === key ? fallback : value;
}

export function localizeProductCard(
  host: Pick<CurrentScreenProps, 't'>,
  card: ProductsCard,
): ProductsCard {
  if (card.translationKey === null) return card;
  const normalized = card.title.replace(/\n/g, ' ').toLowerCase();
  const translationId =
    card.translationKey ??
    (
      {
        electronics: 'electronics',
        travel: 'travel',
        'home and living': 'home-living',
        fashion: 'fashion',
      } as Record<string, string>
    )[normalized] ??
    card.id;
  return {
    ...card,
    title: localized(
      host,
      `runtime.productsMenu.cards.${translationId}`,
      card.title,
    ),
  };
}

/** Source centers the interior cards and aligns the last card to its 24px edge. */
export function offerSnapOffsets(
  count: number,
  viewportWidth: number,
): number[] {
  const contentWidth =
    count * CARD_WIDTH + Math.max(0, count - 1) * CARD_GAP + EDGE_GUTTER * 3;
  const maximum = Math.max(0, contentWidth - viewportWidth);
  const clamp = (value: number) => Math.max(0, Math.min(maximum, value));
  return Array.from({ length: count }, (_, index) => {
    if (index === 0) return 0;
    const offset = EDGE_GUTTER + index * (CARD_WIDTH + CARD_GAP);
    return clamp(
      index === count - 1
        ? offset + CARD_WIDTH + EDGE_GUTTER - viewportWidth
        : offset - (viewportWidth - CARD_WIDTH) / 2,
    );
  });
}

export function RoOffersSectionHeading({
  host,
  title,
}: {
  host: CurrentScreenProps;
  title: string;
}) {
  if (!title) return null;
  return (
    <View style={s.heading}>
      <BaselineSectionDivider
        title={title}
        dark={host.tokens.background === sourceColor('var(--uc-app-bg)', true)}
      />
    </View>
  );
}

/** Source object-right-bottom anchors the aspect-fitted raster at its outer edge. */
function MenuArtwork({ card }: { card: ProductsCard }) {
  const natural: Record<string, readonly [number, number]> = {
    account: [118, 164],
    cards: [150, 98],
    'mortgages-loans': [102, 110],
    insurance: [71, 77],
    'investments-savings': [69, 165],
  };
  const image = resolveProductMenuCard({ id: card.id }).image;
  const dimensions = natural[card.id];
  if (!card.imageSrc || !dimensions) return null;
  const scale = Math.min(
    image.width / dimensions[0],
    image.height / dimensions[1],
  );
  const imageStyle: ImageStyle = {
    position: 'absolute',
    bottom: image.bottom,
    right: image.right,
    width: Platform.OS === 'web' ? image.width : dimensions[0] * scale,
    height: Platform.OS === 'web' ? image.height : dimensions[1] * scale,
  };
  return (
    <RasterImage
      source={
        typeof card.imageSrc === 'number'
          ? card.imageSrc
          : { uri: card.imageSrc }
      }
      resizeMode="contain"
      objectPosition="right bottom"
      style={imageStyle}
    />
  );
}

export function RoOfferCard({
  host,
  offer,
  onPress,
}: {
  host: CurrentScreenProps;
  offer: ProductsOffer;
  onPress: () => void;
}) {
  const tone = getProductBannerTone(
    offer.colorFamily ?? 'green',
    offer.lightVersion ?? false,
  );
  return (
    <BaselineProductOfferCard
      offer={offer}
      tone={tone}
      dark={host.tokens.background === sourceColor('var(--uc-app-bg)', true)}
      onPress={() => onPress()}
    />
  );
}

function OffersRail({
  host,
  offers,
  onOfferPress,
}: {
  host: CurrentScreenProps;
  offers: readonly ProductsOffer[];
  onOfferPress?: (offer: ProductsOffer) => void;
}) {
  const viewport = useDemoViewport();
  const [width, setWidth] = useState(viewport.width);
  const rail = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const offset = useRef(0);
  const pressed = useRef(false);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const offsets = useMemo(
    () => offerSnapOffsets(offers.length, width),
    [offers.length, width],
  );
  const settle = useRef(() => {});
  settle.current = () => {
    const nearest = offsets.reduce(
      (best, next) =>
        Math.abs(next - offset.current) < Math.abs(best - offset.current)
          ? next
          : best,
      offsets[0] ?? 0,
    );
    rail.current?.scrollTo({ x: nearest, animated: true });
  };
  const clearIdle = () => {
    if (idle.current !== null) {
      clearTimeout(idle.current);
      idle.current = null;
    }
  };
  useEffect(() => {
    offset.current = 0;
    rail.current?.scrollTo({ x: 0, animated: false });
    return clearIdle;
  }, [offers]);
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const node = rail.current?.getScrollableNode() as HTMLElement | undefined;
    if (!node?.addEventListener || offers.length <= 1) return;
    let startX = 0,
      startScroll = 0,
      moved = false,
      suppressUntil = 0;
    const finish = () => {
      if (!pressed.current) return;
      pressed.current = false;
      if (moved) {
        suppressUntil = Date.now() + 80;
        settle.current();
      }
      node.style.cursor = 'grab';
    };
    const down = (event: MouseEvent) => {
      if (event.button !== 0) return;
      clearIdle();
      pressed.current = true;
      moved = false;
      startX = event.clientX;
      startScroll = node.scrollLeft;
    };
    const move = (event: MouseEvent) => {
      if (!pressed.current) return;
      if (event.buttons !== 1) {
        finish();
        return;
      }
      const delta = event.clientX - startX;
      if (!moved && Math.abs(delta) < 4) return;
      moved = true;
      event.preventDefault();
      node.style.cursor = 'grabbing';
      node.scrollLeft = startScroll - delta / viewport.scale;
      offset.current = node.scrollLeft;
    };
    const click = (event: MouseEvent) => {
      if (moved && Date.now() < suppressUntil) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    const preventDrag = (event: Event) => event.preventDefault();
    node.style.cursor = 'grab';
    node.addEventListener('mousedown', down);
    node.addEventListener('click', click, true);
    node.addEventListener('dragstart', preventDrag);
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', finish);
    return () => {
      pressed.current = false;
      node.removeEventListener('mousedown', down);
      node.removeEventListener('click', click, true);
      node.removeEventListener('dragstart', preventDrag);
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', finish);
    };
  }, [offers.length, viewport.scale]);
  return (
    <ScrollView
      ref={rail}
      testID="ro-offers-rail"
      horizontal
      style={Platform.OS === 'web' ? s.webScroll : undefined}
      showsHorizontalScrollIndicator={false}
      snapToOffsets={offsets}
      snapToStart
      snapToEnd={false}
      decelerationRate="fast"
      contentContainerStyle={s.rail}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
      onScroll={event => {
        offset.current = event.nativeEvent.contentOffset.x;
        if (pressed.current) return;
        clearIdle();
        idle.current = setTimeout(() => settle.current(), 120);
      }}
      scrollEventThrottle={16}
      onScrollBeginDrag={() => {
        pressed.current = true;
        clearIdle();
      }}
      onScrollEndDrag={() => {
        pressed.current = false;
      }}
      onMomentumScrollEnd={event => {
        offset.current = event.nativeEvent.contentOffset.x;
        clearIdle();
        settle.current();
      }}
    >
      {offers.map((offer, index) => (
        <RoOfferCard
          key={offer.id}
          offer={offer}
          host={host}
          onPress={() =>
            onOfferPress
              ? onOfferPress(offer)
              : rail.current?.scrollTo({
                  x: offsets[index] ?? 0,
                  animated: true,
                })
          }
        />
      ))}
      <View style={s.trailingSpace} />
    </ScrollView>
  );
}

export function RoOffersCatalog({
  host,
  onProductCardPress,
  preview,
  onPreviewAction,
}: {
  host: CurrentScreenProps;
  onProductCardPress: (card: ProductsCard) => void;
  preview?: Extract<NativeProductsPreview, { region: 'products-banking' }>;
  onPreviewAction?: (action: NativeProductsPreviewAction) => void;
}) {
  const config = getProductsMenuForCountry(host.country);
  const viewport = useDemoViewport();
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const t = host.t;
  const offers = useMemo(() => {
    if (preview) return preview.offers;
    const localizedOffers = config.offers.map(offer => ({
      ...offer,
      title: localized(
        { t },
        `runtime.productsMenu.offers.${offer.id}.title`,
        offer.title,
      ),
      description: localized(
        { t },
        `runtime.productsMenu.offers.${offer.id}.description`,
        offer.description,
      ),
    }));
    return getFutureGainProductOffers(
      { product: 'PI', country: host.country, release: host.release },
      localizedOffers,
    );
  }, [config.offers, preview, t, host.country, host.release]);
  const products = preview?.products ?? config.products;
  const otherSolutions = preview?.otherSolutions ?? config.otherSolutions;
  const offersTitle = preview
    ? preview.offersTitle
    : localized(host, 'runtime.productsMenu.offersForYou', config.offersTitle);
  const productsTitle = preview
    ? preview.productsTitle
    : localized(host, 'runtime.productsMenu.ourProducts', config.productsTitle);
  const otherSolutionsTitle = preview
    ? preview.otherSolutionsTitle
    : localized(
        host,
        'runtime.productsMenu.otherSolutionsForYou',
        config.otherSolutionsTitle,
      );
  const offersHeadingVariant = preview?.offersHeadingVariant ?? 'section';
  const card = (item: ProductsCard, full = false) => {
    const localizedCard = preview ? item : localizeProductCard(host, item);
    return (
      <View
        key={item.id}
        style={{
          width: full ? viewport.width - 48 : (viewport.width - 60) / 2,
        }}
      >
        <BaselineProductMenuCard
          card={{ ...localizedCard, imageSrc: undefined }}
          artwork={<MenuArtwork card={localizedCard} />}
          dark={dark}
          onPress={() => onProductCardPress(localizedCard)}
        />
      </View>
    );
  };
  return (
    <>
      {offers.length > 0 && (
        <View
          style={
            preview?.offersHeadingVariant === 'none'
              ? s.sectionWithoutTopPadding
              : s.section
          }
        >
          {offersHeadingVariant === 'none' ? null : (
            <RoOffersSectionHeading host={host} title={offersTitle} />
          )}
          <OffersRail
            host={host}
            offers={offers}
            onOfferPress={
              preview
                ? offer =>
                    onPreviewAction?.({ type: 'offer-open', offerId: offer.id })
                : futureGainEnabled(host)
                ? offer => {
                    if (offer.id === 'future-gain-products-for-you')
                      host.onNavigate({ screen: 'peer-insights' });
                    if (offer.id === 'future-gain-smart-investment')
                      host.onNavigate({ screen: 'smart-investment' });
                  }
                : undefined
            }
          />
        </View>
      )}
      <View style={s.section} testID="ro-offers-banking-shelf">
        {productsTitle ? (
          <RoOffersSectionHeading host={host} title={productsTitle} />
        ) : null}
        <View style={s.grid}>{products.map(item => card(item))}</View>
      </View>
      {otherSolutions.length > 0 && (
        <View style={s.section}>
          <RoOffersSectionHeading host={host} title={otherSolutionsTitle} />
          <View style={s.grid}>
            {otherSolutions.map(item => card(item, true))}
          </View>
        </View>
      )}
    </>
  );
}

const s = StyleSheet.create({
  section: { paddingTop: 16 },
  sectionWithoutTopPadding: { paddingTop: 0 },
  heading: { paddingHorizontal: 24 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  rail: { gap: 12, paddingHorizontal: 24, paddingTop: 16 },
  trailingSpace: { width: 12 },
  webScroll: { transform: 'none' },
});
