import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type {
  ProductsCard,
  ProductsOffer,
  ShopSmartOfferCard,
} from '@/app/config/productsMenuConfig';
import { getProductBannerTone } from '@/app/config/productBannerVariants';
import flowers from '@/assets/612ac7960c2d43bfdada538aae6f3cf27be44d99.png';
import { Text } from '../../../../universal/Typography';
import { sourceColor } from '../../../../universal/sourceColor';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
const source = (uri: string) => (typeof uri === 'number' ? uri : { uri });
const placement: Record<
  string,
  { width: number; height: number; bottom: number; right: number }
> = {
  account: { width: 72, height: 92, bottom: -2, right: 0 },
  cards: { width: 78, height: 70, bottom: 0, right: 0 },
  'mortgages-loans': { width: 78, height: 74, bottom: 0, right: 0 },
  insurance: { width: 72, height: 76, bottom: -2, right: -2 },
  'investments-savings': { width: 58, height: 100, bottom: -2, right: 0 },
  'market-hedging': { width: 76, height: 74, bottom: -1, right: 0 },
  shopsmart: { width: 74, height: 74, bottom: -1, right: 0 },
  'partner-offers': { width: 70, height: 78, bottom: -1, right: 0 },
};
function PositionedImage({
  uri,
  box,
}: {
  uri: string;
  box: { width: number; height: number; bottom: number; right: number };
}) {
  const [natural, setNatural] = useState<{
    width: number;
    height: number;
  } | null>(null);
  useEffect(() => {
    let alive = true;
    const resolved =
      typeof uri === 'number' ? Image.resolveAssetSource(uri) : null;
    if (resolved?.width && resolved.height)
      setNatural({ width: resolved.width, height: resolved.height });
    else
      Image.getSize(
        uri,
        (width, height) => {
          if (alive) setNatural({ width, height });
        },
        () => {},
      );
    return () => {
      alive = false;
    };
  }, [uri]);
  const ratio = natural
    ? Math.min(box.width / natural.width, box.height / natural.height)
    : 1;
  return (
    <Image
      source={source(uri)}
      resizeMode="contain"
      style={[
        s.art,
        box,
        natural
          ? { width: natural.width * ratio, height: natural.height * ratio }
          : undefined,
      ]}
    />
  );
}
export function SourceMenuCard({
  card,
  width,
  onPress,
  dark = false,
}: {
  card: ProductsCard;
  width: number;
  onPress: () => void;
  dark?: boolean;
}) {
  const color = sourceColor('var(--uc-text-inverse)', dark);
  return (
    <Pressable
      testID={`source-menu-card-${card.id}`}
      accessibilityRole="button"
      accessibilityLabel={card.title.replace(/\n/g, ' ')}
      onPress={onPress}
      style={[
        s.menu,
        { width, backgroundColor: sourceColor(card.background, dark) },
      ]}
    >
      <Text style={[s.menuTitle, { color }]}>{card.title}</Text>
      {card.imageSrc ? (
        <PositionedImage
          uri={card.imageSrc}
          box={
            placement[card.id] ?? { width: 78, height: 74, bottom: 0, right: 0 }
          }
        />
      ) : card.illustration === 'flowers' ? (
        <Image
          source={source(flowers)}
          resizeMode="cover"
          style={[s.art, exactSourceStyles.inline1]}
        />
      ) : card.illustration === 'bag' ? (
        <View style={[s.art, exactSourceStyles.inline2]}>
          <SourceCustomIcon
            name="shopping-bag"
            size={86}
            color={sourceColor('var(--uc-primary-main)', dark)}
          />
        </View>
      ) : card.illustration === 'pillow' ? (
        <View
          style={[
            s.art,
            ...[
              exactSourceStyles.inline3,
              { backgroundColor: sourceColor('var(--uc-peach-100)', dark) },
            ],
          ]}
        />
      ) : card.illustration === 'umbrella' ? (
        <View
          style={[
            s.art,
            ...[
              exactSourceStyles.inline4,
              { backgroundColor: sourceColor('var(--uc-teal-soft)', dark) },
            ],
          ]}
        >
          <View
            style={[
              exactSourceStyles.inline5,
              { backgroundColor: sourceColor('var(--uc-text)', dark) },
            ]}
          />
          <View
            style={[exactSourceStyles.inline6, { backgroundColor: color }]}
          />
        </View>
      ) : card.illustration === 'branch' ? (
        <View style={[s.art, exactSourceStyles.inline7]}>
          <View
            style={[
              exactSourceStyles.inline8,
              { backgroundColor: sourceColor('var(--uc-product-brown)', dark) },
            ]}
          />
          <View
            style={[
              exactSourceStyles.inline9,
              { backgroundColor: sourceColor('var(--uc-product-brown)', dark) },
            ]}
          />
          <View
            style={[
              exactSourceStyles.inline10,
              { backgroundColor: sourceColor('var(--uc-product-pink)', dark) },
            ]}
          />
          <View
            style={[
              exactSourceStyles.inline11,
              { backgroundColor: sourceColor('var(--uc-yellow-muted)', dark) },
            ]}
          />
        </View>
      ) : (
        <View style={[s.art, exactSourceStyles.inline12]}>
          <SourceCustomIcon name="arrow-right" size={20} color={color} />
        </View>
      )}
    </Pressable>
  );
}
export function SourceOfferCard({
  offer,
  onPress,
  dark = false,
}: {
  offer: ProductsOffer;
  onPress?: () => void;
  dark?: boolean;
}) {
  const tone = getProductBannerTone(
    offer.colorFamily ?? 'green',
    offer.lightVersion ?? false,
  );
  const color = sourceColor(tone.textColor, dark);
  return (
    <Pressable
      testID={`source-offer-${offer.id}`}
      accessibilityRole="button"
      accessibilityLabel={offer.title.replace(/\n/g, ' ')}
      onPress={onPress}
      style={[
        s.offer,
        { backgroundColor: sourceColor(tone.backgroundColor, dark) },
      ]}
    >
      <Svg width={161} height={157} viewBox="0 0 161 157" style={s.chevrons}>
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          fill={sourceColor(tone.chevronColor, dark)}
          d="M41.828 -36L160.486 78L41.828 192C24.9191 176.767 24.9191 152.064 41.828 136.824L103.055 78L41.828 19.176C24.9191 3.9356 24.9191 -20.7596 41.828 -36ZM-65.9884 -36L52.6697 78L-65.9884 192C-82.8971 176.767 -82.8971 152.064 -65.9884 136.824L-4.76076 78L-65.9884 19.176C-82.8971 3.9356 -82.8971 -20.7596 -65.9884 -36Z"
        />
      </Svg>
      <Image
        source={source(tone.imageSrc)}
        resizeMode="cover"
        style={s.offerPhoto}
      />
      <View style={s.offerCopy}>
        <Text numberOfLines={2} style={[s.offerTitle, { color }]}>
          {offer.title}
        </Text>
        <Text numberOfLines={3} style={[s.offerDescription, { color }]}>
          {offer.description}
        </Text>
      </View>
    </Pressable>
  );
}
export function SourceShopSmartCard({
  offer,
  dark = false,
}: {
  offer: ShopSmartOfferCard;
  dark?: boolean;
}) {
  const text = sourceColor('var(--uc-text)', dark);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {}}
      style={[
        exactSourceStyles.inline13,
        { backgroundColor: sourceColor('var(--uc-surface)', dark) },
      ]}
    >
      <Image
        source={source(offer.imageSrc)}
        resizeMode="cover"
        style={exactSourceStyles.inline14}
      />
      {offer.tagLabel && (
        <View style={exactSourceStyles.inline15}>
          <Svg width={15} height={15} viewBox="0 0 16 16">
            <Path
              fill="#fff"
              d="M3 7h10v7H3V7Zm4.35 0h1.3v7h-1.3V7ZM2 4.75A1.75 1.75 0 0 1 3.75 3H5.1A2.2 2.2 0 0 1 8 1.05 2.2 2.2 0 0 1 10.9 3h1.35A1.75 1.75 0 0 1 14 4.75V6H2V4.75ZM5.1 4.3H3.75a.45.45 0 0 0-.45.45v.05h3.2A1.4 1.4 0 0 0 5.1 4.3Zm2.25.5V3.25A.95.95 0 1 0 6.4 4.2c.34.3.73.49.95.6Zm1.3 0c.22-.11.61-.3.95-.6a.95.95 0 1 0-.95-.95V4.8Zm.85 0h3.2v-.05a.45.45 0 0 0-.45-.45H10.9a1.4 1.4 0 0 0-1.4.5Z"
            />
          </Svg>
          <Text style={exactSourceStyles.inline16}>{offer.tagLabel}</Text>
        </View>
      )}
      {offer.pillLabel && (
        <View
          style={[
            exactSourceStyles.inline17,
            {
              backgroundColor: sourceColor(
                offer.pillTone === 'white'
                  ? 'var(--uc-surface)'
                  : 'var(--uc-action-strong)',
                dark,
              ),
            },
          ]}
        >
          <Text
            style={[
              exactSourceStyles.inline18,
              { color: offer.pillTone === 'white' ? text : sourceColor('var(--uc-static-white)',dark) },
            ]}
          >
            {offer.pillLabel}
          </Text>
        </View>
      )}
      <View style={exactSourceStyles.inline19}>
        <View>
          <Text
            style={[
              exactSourceStyles.inline20,
              { color: sourceColor('var(--uc-action)', dark) },
            ]}
          >
            {offer.merchant}
          </Text>
          <Text style={[exactSourceStyles.inline21, { color: text }]}>
            {offer.title}
          </Text>
        </View>
        <View style={exactSourceStyles.inline22}>
          <Text style={[exactSourceStyles.inline23, { color: text }]}>
            {offer.statusText}
          </Text>
          <View style={exactSourceStyles.inline24}>
            {offer.distance && (
              <Text style={[exactSourceStyles.inline25, { color: text }]}>
                {offer.distance}
              </Text>
            )}
            <View style={exactSourceStyles.inline26}>
              <SourceCustomIcon
                name={
                  offer.trailingIcon === 'partners'
                    ? 'shopsmart-store'
                    : 'contact-website'
                }
                size={24}
                color={text}
              />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
const s = StyleSheet.create({
  menu: {
    height: 120,
    padding: 16,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'flex-start',
    gap: 10,
  },
  menuTitle: {
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
    lineHeight: 20,
    zIndex: 1,
  },
  art: { position: 'absolute' },
  offer: {
    width: 327,
    height: 157,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  chevrons: { position: 'absolute', left: -14, top: 0 },
  offerPhoto: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 100,
    height: 157,
  },
  offerCopy: {
    height: 157,
    paddingLeft: 20,
    paddingRight: 116,
    justifyContent: 'center',
    gap: 8,
  },
  offerTitle: { fontFamily: 'UniCredit-bold', fontSize: 22, lineHeight: 24 },
  offerDescription: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 20,
  },
});

const exactSourceStyles = StyleSheet.create({
  inline1: { bottom: -40, right: -34, width: 96, height: 110 },
  inline2: { bottom: -10, right: -8, opacity: 0.35 },
  inline3: {
    bottom: -14,
    right: -8,
    width: 70,
    height: 72,
    transform: [{ rotate: '-4deg' }],
    borderTopLeftRadius: 30,
    borderTopRightRadius: 8,
  },
  inline4: { bottom: -28, right: -28, width: 96, height: 96, borderRadius: 48 },
  inline5: {
    position: 'absolute',
    left: 45,
    top: 4,
    width: 1,
    height: 80,
    transform: [{ rotate: '-18deg' }],
  },
  inline6: {
    position: 'absolute',
    left: 28,
    top: 22,
    width: 1,
    height: 76,
    transform: [{ rotate: '18deg' }],
    opacity: 0.3,
  },
  inline7: { bottom: -14, right: -4, width: 54, height: 98 },
  inline8: {
    position: 'absolute',
    bottom: 0,
    left: 25,
    width: 3,
    height: 92,
    borderRadius: 2,
    transform: [{ rotate: '16deg' }],
  },
  inline9: {
    position: 'absolute',
    bottom: 30,
    left: 12,
    width: 3,
    height: 34,
    borderRadius: 2,
    transform: [{ rotate: '-42deg' }],
  },
  inline10: {
    position: 'absolute',
    bottom: 54,
    left: 22,
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  inline11: {
    position: 'absolute',
    bottom: 70,
    left: 34,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  inline12: {
    bottom: 8,
    right: 4,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline13: { borderRadius: 8, overflow: 'hidden', position: 'relative' },
  inline14: { height: 130, width: '100%' },
  inline15: {
    position: 'absolute',
    left: 0,
    top: 16,
    height: 24,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: '#F0871D',
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  inline16: {
    fontFamily: 'UniCredit-bold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1,
    color: '#fff',
    textTransform: 'uppercase',
  },
  inline17: {
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
  inline18: { fontFamily: 'UniCredit-bold', fontSize: 14, lineHeight: 18 },
  inline19: {
    paddingHorizontal: 16,
    paddingTop: 9,
    paddingBottom: 13,
    gap: 16,
  },
  inline20: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  inline21: {
    marginTop: 1,
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
    lineHeight: 23,
    letterSpacing: 0.42,
  },
  inline22: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  inline23: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 16,
    letterSpacing: 1,
    flex: 1,
  },
  inline24: { height: 32, flexDirection: 'row', gap: 4, alignItems: 'center' },
  inline25: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 16,
    letterSpacing: 0.22,
  },
  inline26: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
