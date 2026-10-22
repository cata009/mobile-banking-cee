import React, { useId } from 'react';
import { Image, Pressable, View, type TextStyle } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Path,
  Ellipse,
  Line,
  G,
  ClipPath,
  Pattern,
  Image as SvgImage,
} from 'react-native-svg';
import {
  getCatalogCompositionSource,
  CATALOG_INVESTMENT_SOURCE_ROWS,
  CATALOG_CAMPAIGN_SOURCE_SCENES,
  CATALOG_ORIGINAL_CONTENT_PHOTOS,
  type CatalogCampaignScene,
  type OriginalContentPhotoLayer,
  type SourceGraphScene,
  type SourceGraphMark,
  type SourcePaint,
} from '@/app/components/contracts/catalogCompositions';
import primeTexture from '@/assets/6f8736f05a24b87b9ef5508cfd9021e9a466bf48.png';
import originalCampaignPhoto from '@/assets/ff8ceb68dca76c1b631e7455a244d68e3ea1f7d6.png';
import { getArtworkAsset } from './images/artworkAssets';
import { BaselinePaymentImage } from './BaselinePaymentImage';
import { BaselinePaymentHero } from './BaselinePaymentHero';
import { BaselineProductOfferCard } from './BaselineProductOfferCard';
import { BaselineAccountActionBar } from './BaselineAccountActionBar';
import { BaselineInvestmentProductRow } from './BaselineInvestmentProductRow';
import { BaselineBanner } from './BaselineBanner';
import { VectorArtworkLayer } from './VectorArtworkLayer';
import { Text, TextInput } from './Typography';

import art0 from '@/assets/design-system/compositions/source-7467-13122-0.svg';
import art1 from '@/assets/design-system/compositions/source-8038-6624-1.svg';
import art2 from '@/assets/design-system/compositions/source-8038-6624-2.svg';
import art3 from '@/assets/design-system/compositions/source-8038-6624-3.svg';
import art4 from '@/assets/design-system/compositions/source-8038-6624-4.svg';
import art5 from '@/assets/design-system/compositions/source-303-24751-0.svg';
import art6 from '@/assets/design-system/compositions/source-290-13357-0.svg';
import art7 from '@/assets/design-system/compositions/source-290-13357-1.svg';
import art8 from '@/assets/design-system/compositions/source-290-13357-2.svg';
import art9 from '@/assets/design-system/compositions/source-290-13357-3.svg';
import art10 from '@/assets/design-system/compositions/source-8889-204-0.svg';
import art11 from '@/assets/design-system/compositions/source-1093-8625-0.svg';
import art12 from '@/assets/design-system/compositions/source-9365-16188-0.svg';
import art13 from '@/assets/design-system/compositions/source-1923-1532-0.svg';
import art14 from '@/assets/design-system/compositions/source-1923-1532-1.svg';
import art15 from '@/assets/design-system/compositions/source-1923-1532-3.svg';
import art16 from '@/assets/design-system/compositions/family-310-9061-1.svg';
import art17 from '@/assets/design-system/compositions/family-310-9061-2.svg';
import art18 from '@/assets/design-system/compositions/family-310-9061-3.svg';
import art19 from '@/assets/design-system/compositions/family-310-9061-4.svg';
import art20 from '@/assets/design-system/compositions/family-310-9061-5.svg';
import art21 from '@/assets/design-system/compositions/family-310-9061-6.svg';
import art22 from '@/assets/design-system/compositions/family-310-9061-12.svg';
import art23 from '@/assets/design-system/compositions/family-243-8097-0.svg';
import art24 from '@/assets/design-system/compositions/family-243-8097-1.svg';
import art25 from '@/assets/design-system/compositions/variant-1518-3435-0.svg';
import art26 from '@/assets/design-system/compositions/variant-1518-3435-1.svg';
import art27 from '@/assets/design-system/compositions/variant-815-5402-0.svg';
import art28 from '@/assets/design-system/compositions/variant-825-5493-0.svg';
import art29 from '@/assets/design-system/compositions/variant-8889-251-0.svg';
import art30 from '@/assets/design-system/compositions/variant-1093-8672-0.svg';
import art31 from '@/assets/design-system/compositions/variant-9365-16235-0.svg';
import rowArtwork0 from '@/assets/design-system/compositions/source-303-24751-0.svg';
import rowArtwork1 from '@/assets/design-system/compositions/row-310-8985-0.svg';
import rowArtwork2 from '@/assets/design-system/compositions/family-310-9061-2.svg';
import rowArtwork3 from '@/assets/design-system/compositions/family-310-9061-3.svg';
import rowArtwork4 from '@/assets/design-system/compositions/family-310-9061-4.svg';
import rowArtwork5 from '@/assets/design-system/compositions/family-310-9061-5.svg';
import rowArtwork6 from '@/assets/design-system/compositions/family-310-9061-6.svg';
import rowArtwork7 from '@/assets/design-system/compositions/row-303-24358-0.svg';
import rowArtwork8 from '@/assets/design-system/compositions/row-303-24408-1.svg';
import rowArtwork9 from '@/assets/design-system/compositions/row-303-24378-0.svg';
import rowArtwork10 from '@/assets/design-system/compositions/family-310-9061-12.svg';
const rowArtworkAssets: Readonly<Record<string, string | number>> = {
  'source-303-24751-0.svg': rowArtwork0,
  'row-310-8985-0.svg': rowArtwork1,
  'family-310-9061-2.svg': rowArtwork2,
  'family-310-9061-3.svg': rowArtwork3,
  'family-310-9061-4.svg': rowArtwork4,
  'family-310-9061-5.svg': rowArtwork5,
  'family-310-9061-6.svg': rowArtwork6,
  'row-303-24358-0.svg': rowArtwork7,
  'row-303-24408-1.svg': rowArtwork8,
  'row-303-24378-0.svg': rowArtwork9,
  'family-310-9061-12.svg': rowArtwork10,
};
import photograph0 from '@/assets/design-system/compositions/photos/1522f33794c134d83d662fd2fbb4c9f195e5f44e.png';
import photograph2 from '@/assets/design-system/compositions/photos/edcba91c37adb05deb0a05f3a303fabf60cfa09f.png';
import photograph3 from '@/assets/design-system/compositions/photos/52f0b74fc5514876138a58023ca6c8710d0db3a8.png';
import photograph4 from '@/assets/design-system/compositions/photos/b7cf1d8f79545e151d558b270b41e7ce9bfb932b.png';
import photograph5 from '@/assets/design-system/compositions/photos/a1100374f41efc6eebb88a42a630ae11d11d46b7.png';
import photograph6 from '@/assets/design-system/compositions/photos/8bf47e8592cbf7929143b9a8033355e0430fc1c8.png';
import photograph7 from '@/assets/design-system/compositions/photos/062388f55867b58a1549c579e0f837b94ffc925c.png';
import photograph8 from '@/assets/design-system/compositions/photos/7c9ccbb5be7f4058f6af8d50ced765919f64c000.png';
import photograph9 from '@/assets/design-system/compositions/photos/0f85ac34904b2dd13edbaf72e1c056c0185899a5.jpg';
import photograph10 from '@/assets/design-system/compositions/photos/e94cd17b3ad327cd430fe6319a1d583b7ed93ed8.png';
import photograph11 from '@/assets/design-system/compositions/photos/075bb08e86f2145ad6e9192c37d9c4d24de7f168.png';
import photograph12 from '@/assets/design-system/compositions/photos/d052c13c7d88ebd85c61f0cff801a6b025924292.png';
import photograph13 from '@/assets/design-system/compositions/photos/888c0b8f6db8e2ed47fb230a3e319945852d803c.png';
import photograph14 from '@/assets/design-system/compositions/photos/e400269e12a467c40d1e214740e78c2d5efa9a73.png';
import photograph15 from '@/assets/design-system/compositions/photos/97420d93298e277c42046cfc4a87bcf25be5d8ea.png';
import photograph17 from '@/assets/ff8ceb68dca76c1b631e7455a244d68e3ea1f7d6.png';
const originalContentPhotographs: Readonly<Record<string, string | number>> = {
  '1522f33794c134d83d662fd2fbb4c9f195e5f44e': photograph0,
  edcba91c37adb05deb0a05f3a303fabf60cfa09f: photograph2,
  '52f0b74fc5514876138a58023ca6c8710d0db3a8': photograph3,
  b7cf1d8f79545e151d558b270b41e7ce9bfb932b: photograph4,
  a1100374f41efc6eebb88a42a630ae11d11d46b7: photograph5,
  '8bf47e8592cbf7929143b9a8033355e0430fc1c8': photograph6,
  '062388f55867b58a1549c579e0f837b94ffc925c': photograph7,
  '7c9ccbb5be7f4058f6af8d50ced765919f64c000': photograph8,
  '0f85ac34904b2dd13edbaf72e1c056c0185899a5': photograph9,
  e94cd17b3ad327cd430fe6319a1d583b7ed93ed8: photograph10,
  '075bb08e86f2145ad6e9192c37d9c4d24de7f168': photograph11,
  d052c13c7d88ebd85c61f0cff801a6b025924292: photograph12,
  '888c0b8f6db8e2ed47fb230a3e319945852d803c': photograph13,
  e400269e12a467c40d1e214740e78c2d5efa9a73: photograph14,
  '97420d93298e277c42046cfc4a87bcf25be5d8ea': photograph15,
  ff8ceb68dca76c1b631e7455a244d68e3ea1f7d6: photograph17,
};
const originalArtwork: Readonly<
  Record<string, { asset: string | number; width: number; height: number }>
> = {
  '7467:13095:imgCommonPremium': { asset: art0, width: 16.0, height: 16.0 },
  '8038:6624:imgPath': { asset: art1, width: 78.685, height: 138.677 },
  '8038:6624:imgPath1': { asset: art2, width: 78.7702, height: 138.53 },
  '8038:6624:imgVector': { asset: art3, width: 365.171, height: 335.698 },
  '8038:6624:imgCredit': { asset: art4, width: 22.9398, height: 5.85889 },
  '310:9061:imgGroup2': { asset: art5, width: 32.0, height: 32.0 },
  '290:13357:imgIcNavigationRestyleEBillsContracts': {
    asset: art6,
    width: 32.0,
    height: 32.0,
  },
  '290:13357:imgIcNavigationRestyleDirectDebitBlack': {
    asset: art7,
    width: 32.0,
    height: 32.0,
  },
  '290:13357:imgIcNavigationRestyleExanteCosts': {
    asset: art8,
    width: 32.0,
    height: 32.0,
  },
  '290:13357:imgIcNavigationRestyleTemplateBlack': {
    asset: art9,
    width: 32.0,
    height: 32.0,
  },
  '8889:203:img9ImagesPlaceHolderHomepage': {
    asset: art10,
    width: 329.0,
    height: 159.0,
  },
  '1093:8624:imgTypeBottomBannerStyleYellowLightVersionNo': {
    asset: art11,
    width: 329.0,
    height: 159.0,
  },
  '9365:16187:imgTypeBottomBannerStyleYellowLightVersionNo': {
    asset: art12,
    width: 329.0,
    height: 159.0,
  },
  '1923:1532:imgGroup': { asset: art13, width: 8.4058, height: 9.93412 },
  '1923:1532:imgHomeBankingAndPaymentsExpenseLimit': {
    asset: art14,
    width: 20.0,
    height: 7.46263,
  },
  '1923:1532:imgIcNavigationHelperClose': {
    asset: art15,
    width: 32.0,
    height: 32.0,
  },
  '310:9061:imgIcNavigationTabbarAccountInactive': {
    asset: art16,
    width: 32.0,
    height: 32.0,
  },
  '310:9061:imgIcToolbarRefreshBlack': {
    asset: art17,
    width: 18.0,
    height: 18.0,
  },
  '310:9061:imgIcNavigationChevronrightBlack': {
    asset: art18,
    width: 32.0,
    height: 32.0,
  },
  '310:9061:imgOval': { asset: art19, width: 8.0, height: 8.0 },
  '310:9061:imgIcActionbarBuyBlu': { asset: art20, width: 32.0, height: 32.0 },
  '310:9061:imgIcActionbarSellRed': { asset: art21, width: 32.0, height: 32.0 },
  '310:9061:imgIcActionbarSellRed1': {
    asset: art22,
    width: 32.0,
    height: 32.0,
  },
  '243:8097:imgProperty2UnconfirmedCategory': {
    asset: art23,
    width: 16.0,
    height: 16.0,
  },
  '243:8097:imgProperty2Triangle': {
    asset: art24,
    width: 47.9997,
    height: 54.3174,
  },
  '1518:3435:imgEllipse1': { asset: art25, width: 52.0, height: 52.0 },
  '1518:3435:imgBankTouchpointAndCustomerCareContacts': {
    asset: art26,
    width: 32.0,
    height: 32.0,
  },
  '1518:3464:imgEllipse1': { asset: art25, width: 52.0, height: 52.0 },
  '1518:3464:imgBankTouchpointAndCustomerCareContacts': {
    asset: art26,
    width: 32.0,
    height: 32.0,
  },
  '815:5402:img9ImagesPlaceHolderHomepage': {
    asset: art27,
    width: 343.0,
    height: 157.0,
  },
  '825:5493:img9ImagesPlaceHolderHomepage': {
    asset: art28,
    width: 343.0,
    height: 157.0,
  },
  '8889:251:img9ImagesPlaceHolderHomepage': {
    asset: art29,
    width: 329.0,
    height: 159.0,
  },
  '1093:8672:imgTypeBottomBannerStyleYellowLightVersionYes': {
    asset: art30,
    width: 329.0,
    height: 159.0,
  },
  '9365:16235:imgTypeBottomBannerStyleYellowLightVersionYes': {
    asset: art31,
    width: 329.0,
    height: 159.0,
  },
};
function Artwork({
  source,
  x = 0,
  y = 0,
}: {
  source: string;
  x?: number;
  y?: number;
}) {
  const a = originalArtwork[source];
  if (!a) throw new Error(`Unmapped original glyph: ${source}`);
  return (
    <VectorArtworkLayer
      asset={a.asset}
      width={a.width}
      height={a.height}
      x={x}
      y={y}
    />
  );
}
const text = (size = 14, bold = false, color = '#262626'): TextStyle => ({
  fontFamily: bold ? 'UniCredit-bold' : 'UniCredit-regular',
  fontSize: size,
  color,
});

export function BaselineCompanySelection({
  value,
  label = 'YOUR COMPANY',
  editLabel = 'EDIT',
  onEdit,
  variantId = '1517:13081',
}: {
  value: string;
  label?: string;
  editLabel?: string;
  onEdit?: () => void;
  variantId?: string;
}) {
  return (
    <View
      testID="canonical-company-selection"
      style={{
        width: 327,
        minHeight: 56,
        paddingHorizontal: 16,
        paddingVertical: 11,
        borderRadius: 4,
        backgroundColor: variantId === '1517:13087' ? '#E5E5E5' : '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      }}
    >
      <View style={{ maxWidth: 248, flexShrink: 1, gap: 4 }}>
        <Text style={[text(14, true), { lineHeight: 15 }]}>{label}</Text>
        <Text style={[text(), { lineHeight: 15 }]}>{value}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Edit company"
        onPress={onEdit}
        hitSlop={14}
      >
        <Text style={[text(14, true, '#007A91'), { lineHeight: 15 }]}>
          {editLabel}
        </Text>
      </Pressable>
    </View>
  );
}

function PaymentPaint({ sme }: { sme: boolean }) {
  const id = `payment-${useId().replace(/\W/g, '')}`;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', inset: 0 }}>
      <Svg width="100%" height={120}>
        <Defs>
          <LinearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0" stopColor={sme ? '#CCCCCC' : '#F5F5F5'} />
            <Stop offset="1" stopColor={sme ? '#F5F5F5' : '#CCCCCC'} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height={120} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
export function BaselineCanonicalPaymentHero({
  variantId,
  title,
  description,
  onPress,
}: {
  variantId: string;
  title: string;
  description: string;
  onPress?: () => void;
}) {
  const source = getCatalogCompositionSource(variantId);
  if (!source || source.status !== 'implemented') return null;
  const sme = source.name.includes('SME');
  const two = source.name.includes('Title 2');
  const artwork = sme ? (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 275,
        top: 34,
        width: 52,
        height: 52,
      }}
    >
      <Artwork source="1518:3435:imgEllipse1" />
      <Artwork
        source="1518:3435:imgBankTouchpointAndCustomerCareContacts"
        x={10}
        y={10}
      />
    </View>
  ) : (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', right: 0, bottom: 0 }}
    >
      <BaselinePaymentImage
        variant="MakePayment"
        asset={getArtworkAsset('0:10883')}
      />
    </View>
  );
  return (
    <View style={{ width: 343, height: 120 }}>
      <BaselinePaymentHero
        item={{ id: variantId, title, description }}
        onSelect={onPress}
        artwork={artwork}
        presentation={{
          paddingHorizontal: 16,
          titleWidth: sme ? 251 : two ? 214 : 215,
          descriptionWidth: sme ? 251 : two ? 214 : 183,
          descriptionMargin: sme ? 8 : 16,
          titleLineHeight: 26,
          descriptionLineHeight: 15,
          background: <PaymentPaint sme={sme} />,
        }}
      />
    </View>
  );
}

export function BaselineCanonicalInvestmentActions({
  labels,
  onAction,
}: {
  labels: readonly string[];
  onAction?: (index: number) => void;
}) {
  const glyphs = [
    'imgIcNavigationRestyleEBillsContracts',
    'imgIcNavigationRestyleDirectDebitBlack',
    'imgIcNavigationRestyleExanteCosts',
    'imgIcNavigationRestyleTemplateBlack',
  ];
  return (
    <View style={{ width: 375, minHeight: 55 }}>
      <BaselineAccountActionBar
        items={labels.slice(0, 4).map((label, i) => ({
          id: String(i),
          label,
          icon: (
            <View style={{ width: 32, height: 32 }}>
              <Artwork source={`290:13357:${glyphs[i]}`} />
            </View>
          ),
          onPress: () => onAction?.(i),
        }))}
        presentation={{
          paddingVertical: 4,
          itemWidth: 70,
          itemGap: 0,
          stretch: false,
        }}
      />
    </View>
  );
}

export function BaselineCanonicalCampaign({
  variantId,
  title,
  description,
  caption,
  onPress,
}: {
  variantId: string;
  title: string;
  description: string;
  caption?: string;
  onPress?: () => void;
}) {
  const source = getCatalogCompositionSource(variantId),
    scene = CATALOG_CAMPAIGN_SOURCE_SCENES.find(s => s.variantId === variantId);
  if (!source || source.status !== 'implemented' || !scene) return null;
  const [heading, body, note] = scene.texts;
  if (!heading || !body)
    return <BaselineCanonicalCampaignPhoto variantId={variantId} />;
  const h = heading.segments[0],
    b = body.segments[0];
  const hs = h.fontSize,
    bs = b.fontSize;
  const hl =
      h.lineHeight.unit === 'PIXELS'
        ? h.lineHeight.value!
        : Math.round(hs * 1.1),
    bl =
      b.lineHeight.unit === 'PIXELS'
        ? b.lineHeight.value!
        : Math.round(bs * 1.1);
  return (
    <BaselineProductOfferCard
      offer={{
        id: variantId,
        title,
        description,
        caption: note ? caption : undefined,
      }}
      variant={note ? 'compact' : 'standard'}
      tone={{
        backgroundColor: 'transparent',
        textColor: sourcePaintColor(h.fills[0]),
        chevronColor: 'transparent',
        imageSrc: originalCampaignPhoto,
      }}
      onPress={onPress}
      artwork={<SourceCampaignArtwork scene={scene} />}
      presentation={{
        width: scene.width,
        height: scene.height,
        radius: 8,
        paddingLeft: heading.transform[4],
        paddingRight: scene.width - heading.transform[4] - heading.w,
        paddingTop: heading.transform[5],
        paddingBottom: 0,
        titleFontSize: hs,
        titleLineHeight: hl,
        titleLines: Math.max(1, Math.round(heading.h / hl)),
        descriptionFontSize: bs,
        descriptionLineHeight: bl,
        descriptionLines: Math.max(1, Math.round(body.h / bl)),
        captionFontSize: note?.segments[0].fontSize,
        captionLineHeight: note
          ? Math.round(note.segments[0].fontSize * 1.1)
          : undefined,
      }}
    />
  );
}
export function BaselineCanonicalCampaignPhoto({
  variantId,
  label,
}: {
  variantId: string;
  label?: string;
}) {
  const scene = CATALOG_CAMPAIGN_SOURCE_SCENES.find(
    s => s.variantId === variantId,
  );
  return scene &&
    getCatalogCompositionSource(variantId)?.status === 'implemented' ? (
    <View
      accessible={Boolean(label)}
      accessibilityRole={label ? 'image' : undefined}
      accessibilityLabel={label}
      style={{ width: scene.width, height: scene.height }}
    >
      <SourceCampaignArtwork scene={scene} />
    </View>
  ) : null;
}

export function BaselineTimelineAtom({
  variantId,
  day = '1',
  month = 'OCT',
}: {
  variantId: string;
  day?: string;
  month?: string;
}) {
  if (variantId === '0:9211')
    return (
      <View style={{ width: 1, height: 48 }}>
        <View
          testID="canonical-timeline-connector"
          style={{ width: 0.5, height: 48, backgroundColor: '#E5E5E5' }}
        />
      </View>
    );
  if (variantId === '0:9213')
    return (
      <View style={{ minWidth: 25, gap: 2, alignItems: 'center' }}>
        <Text
          testID="canonical-timeline-day"
          style={[text(18, true), { lineHeight: 16 }]}
        >
          {day}
        </Text>
        <Text
          style={[
            text(13, true, '#CCCCCC'),
            { letterSpacing: 1, lineHeight: 14 },
          ]}
        >
          {month}
        </Text>
      </View>
    );
  if (variantId === '0:9238')
    return (
      <View style={{ width: 16, height: 16 }}>
        <Artwork source="243:8097:imgProperty2UnconfirmedCategory" />
      </View>
    );
  if (variantId === '0:9284')
    return (
      <View style={{ width: 25, height: 25 }}>
        <Artwork
          source="243:8097:imgProperty2Triangle"
          x={-11.4825}
          y={-14.7175}
        />
      </View>
    );
  return null;
}

export function BaselinePrimeAdvisory({
  variantId = '7467:13122',
  onPress,
}: {
  variantId?: string;
  onPress?: () => void;
}) {
  const sme = variantId === '8969:3993',
    width = sme ? 97 : 78;
  const prefix = `prime-${useId().replace(/\W/g, '')}`;
  const angle =
      ((sme ? 184.41457377207342 : 185.48400004009136) * Math.PI) / 180,
    dx = Math.sin(angle),
    dy = -Math.cos(angle),
    length = Math.abs(width * dx) + Math.abs(32 * dy);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={sme ? 'My advisor' : 'Prime advisory'}
      onPress={onPress}
      style={{
        width,
        height: 32,
        borderRadius: 16,
        overflow: 'hidden',
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View pointerEvents="none" style={{ position: 'absolute', inset: 0 }}>
        <Svg width={width} height={32} viewBox={`0 0 ${width} 32`}>
          <Defs>
            <LinearGradient
              id={`${prefix}-linear`}
              gradientUnits="userSpaceOnUse"
              x1={width / 2 - (dx * length) / 2}
              y1={16 - (dy * length) / 2}
              x2={width / 2 + (dx * length) / 2}
              y2={16 + (dy * length) / 2}
            >
              <Stop offset={0.32305} stopColor="#7497C0" />
              <Stop offset={0.60005} stopColor="#262626" />
            </LinearGradient>
            <RadialGradient
              id={`${prefix}-blue`}
              cx={0}
              cy={0}
              r={10}
              gradientUnits="userSpaceOnUse"
              gradientTransform={
                sme
                  ? 'matrix(-0.012933 1.5982 -5.9995 -0.0009487 48.629 16.018)'
                  : 'matrix(-0.0104 1.5982 -4.8243 -0.0009487 39.104 16.018)'
              }
            >
              <Stop offset={0} stopColor="#134097" />
              <Stop offset={0.25} stopColor="#0F3071" />
              <Stop offset={0.5} stopColor="#0A204B" />
              <Stop offset={0.75} stopColor="#051026" />
              <Stop offset={0.875} stopColor="#020813" />
              <Stop offset={0.9375} stopColor="#010409" />
              <Stop offset={1} stopColor="#000000" />
            </RadialGradient>
            <RadialGradient
              id={`${prefix}-shade`}
              cx={0}
              cy={0}
              r={10}
              gradientUnits="userSpaceOnUse"
              gradientTransform={
                sme
                  ? 'matrix(-1.94 2.2725 -3.602 -0.060085 67.9 9.2746)'
                  : 'matrix(-1.56 2.2725 -2.8965 -0.060085 54.6 9.2746)'
              }
            >
              <Stop offset={0} stopColor="#171420" stopOpacity={0} />
              <Stop offset={1} stopColor="#262626" />
            </RadialGradient>
          </Defs>
          <Rect width={width} height={32} fill={`url(#${prefix}-linear)`} />
          <G style={{ mixBlendMode: 'soft-light' }}>
            <Rect
              width={width}
              height={32}
              fill={`url(#${prefix}-blue)`}
              opacity={0.2}
            />
          </G>
          <Rect
            width={width}
            height={32}
            fill={`url(#${prefix}-shade)`}
            opacity={0.2}
          />
        </Svg>
        <Image
          source={
            typeof primeTexture === 'number'
              ? primeTexture
              : { uri: primeTexture }
          }
          resizeMode="cover"
          style={{
            position: 'absolute',
            inset: 0,
            width,
            height: 32,
            opacity: 0.1,
            mixBlendMode: 'soft-light',
          }}
        />
        <View
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,.2)',
          }}
        />
      </View>
      {!sme ? (
        <View style={{ width: 16, height: 16 }}>
          <Artwork source="7467:13095:imgCommonPremium" />
        </View>
      ) : null}
      <Text style={[text(14, true, '#FFFFFF'), { lineHeight: 16 }]}>
        {sme ? 'MY ADVISOR' : 'Prime'}
      </Text>
    </Pressable>
  );
}

export function BaselineCardType14({ label }: { label?: string }) {
  const id = `card14-${useId().replace(/\W/g, '')}`;
  return (
    <View
      accessible={Boolean(label)}
      accessibilityLabel={label}
      accessibilityRole={label ? 'image' : undefined}
      style={{
        width: 219,
        height: 138,
        borderRadius: 5.630000114440918,
        overflow: 'hidden',
      }}
    >
      <Svg
        width={234.15744}
        height={152.08786}
        style={{ position: 'absolute' }}
      >
        <Defs>
          <LinearGradient id={id} x1="100%" y1="0%" x2="0%" y2="0%">
            {[
              ['.029999', '#12110C'],
              ['.26499', '#161410'],
              ['.49058', '#22201C'],
              ['.71617', '#373430'],
              ['.94176', '#544F4D'],
              ['.96996', '#55504E'],
            ].map(([offset, color]) => (
              <Stop key={offset} offset={Number(offset)} stopColor={color} />
            ))}
          </LinearGradient>
        </Defs>
        <Rect width={234.15744} height={152.08786} fill={`url(#${id})`} />
      </Svg>
      <Artwork source="8038:6624:imgPath" x={-27} />
      <Artwork source="8038:6624:imgPath1" x={31.436} y={0.063} />
      <Artwork source="8038:6624:imgVector" x={-82.1195} y={-66.0576} />
      <Artwork source="8038:6624:imgCredit" x={185.8081} y={69.9373} />
    </View>
  );
}

export function BaselineCanonicalSticky({
  message,
  onClose,
  icon = true,
}: {
  message: string;
  onClose?: () => void;
  icon?: boolean;
}) {
  const glyph = (
    <View style={{ width: 32, height: 32 }}>
      <Artwork source="1923:1532:imgGroup" x={11.6016} y={15.6667} />
      <Artwork
        source="1923:1532:imgHomeBankingAndPaymentsExpenseLimit"
        x={6}
        y={7}
      />
    </View>
  );
  return (
    <BaselineBanner
      variant="helper"
      title={message}
      iconNode={icon ? glyph : <View />}
      dismissible
      onClose={onClose}
      presentation={{
        radius: 5.7,
        titleFont: 'UniCredit-regular',
        titleSize: 18,
        titleLineHeight: 20,
        contentWidth: 255,
        contentPaddingRight: 0,
        closeSize: 32,
        closeRight: 0,
        closeTop: 0,
        closeNode: (
          <View style={{ width: 32, height: 32 }}>
            <Artwork source="1923:1532:imgIcNavigationHelperClose" />
          </View>
        ),
      }}
    />
  );
}

function sourcePaintColor(p?: SourcePaint) {
  if (!p || p.type !== 'SOLID' || !p.color) return 'none';
  const c = p.color;
  return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(
    c.b * 255,
  )},${c.a ?? 1})`;
}
function sourceLinearGradient(m: SourceGraphMark, p: SourcePaint, id: string) {
  const t = p.gradientTransform;
  if (!t) return null;
  const a = t[0][0],
    b = t[1][0],
    c = t[0][1],
    d = t[1][1],
    e = t[0][2],
    f = t[1][2],
    det = a * d - b * c;
  if (!det) return null;
  const pt = (x: number, y: number) => ({
    x: ((d * (x - e) - c * (y - f)) / det) * m.w,
    y: ((-b * (x - e) + a * (y - f)) / det) * m.h,
  });
  const start = pt(0, 0.5),
    end = pt(1, 0.5);
  return (
    <LinearGradient
      key={id}
      id={id}
      gradientUnits="userSpaceOnUse"
      x1={start.x}
      y1={start.y}
      x2={end.x}
      y2={end.y}
    >
      {p.gradientStops?.map((s, i) => (
        <Stop
          key={i}
          offset={s.position}
          stopColor={`rgb(${Math.round(s.color.r * 255)},${Math.round(
            s.color.g * 255,
          )},${Math.round(s.color.b * 255)})`}
          stopOpacity={s.color.a}
        />
      ))}
    </LinearGradient>
  );
}
/** Original content image bytes with Figma's crop/mask transforms. No image is a rendered control. */
function SourceCampaignArtwork({ scene }: { scene: CatalogCampaignScene }) {
  const prefix = `campaign-${useId().replace(/\W/g, '')}`,
    key = (id: string) => `${prefix}-${id.replace(/\W/g, '')}`;
  const value = (m: SourceGraphMark, p: SourcePaint | undefined, i: number) =>
    p?.type === 'GRADIENT_LINEAR'
      ? `url(#${key(m.id)}-paint-${i})`
      : sourcePaintColor(p);
  const photoImage = (photo: OriginalContentPhotoLayer) => {
    const fill = photo.images[0],
      metadata = CATALOG_ORIGINAL_CONTENT_PHOTOS[fill.imageHash],
      asset = originalContentPhotographs[fill.imageHash];
    if (!metadata || asset === undefined)
      throw new Error(`Missing original content photo ${fill.imageHash}`);
    const href = typeof asset === 'number' ? asset : { uri: asset };
    let image: React.ReactNode;
    if (fill.scaleMode === 'TILE')
      image = (
        <Rect
          width={photo.w}
          height={photo.h}
          fill={`url(#${key(photo.id)}-tile)`}
        />
      );
    else if (fill.scaleMode === 'CROP' && fill.imageTransform) {
      const t = fill.imageTransform,
        a = t[0][0],
        b = t[1][0],
        c = t[0][1],
        d = t[1][1],
        e = t[0][2],
        f = t[1][2],
        det = a * d - b * c;
      if (!det) return null;
      const matrix = [
        d / det,
        ((-b / det) * photo.h) / photo.w,
        ((-c / det) * photo.w) / photo.h,
        a / det,
        ((c * f - d * e) / det) * photo.w,
        ((b * e - a * f) / det) * photo.h,
      ];
      image = (
        <SvgImage
          href={href}
          width={photo.w}
          height={photo.h}
          preserveAspectRatio="none"
          transform={`matrix(${matrix.join(' ')})`}
        />
      );
    } else
      image = (
        <SvgImage
          href={href}
          width={photo.w}
          height={photo.h}
          preserveAspectRatio={
            fill.scaleMode === 'FIT' ? 'xMidYMid meet' : 'xMidYMid slice'
          }
        />
      );
    let element = (
      <G
        transform={`matrix(${photo.transform.join(' ')})`}
        opacity={photo.opacity * (fill.opacity ?? 1)}
      >
        <G clipPath={`url(#${key(photo.id)}-clip)`}>{image}</G>
      </G>
    );
    for (const mask of photo.masks)
      element = <G clipPath={`url(#${key(mask)})`}>{element}</G>;
    return element;
  };
  return (
    <Svg
      testID="canonical-campaign-artwork"
      pointerEvents="none"
      width={scene.width}
      height={scene.height}
      viewBox={`0 0 ${scene.width} ${scene.height}`}
      style={{ position: 'absolute', left: 0, top: 0 }}
    >
      <Defs>
        {scene.marks.flatMap(m =>
          [...m.fill, ...m.stroke].map((p, i) =>
            p.type === 'GRADIENT_LINEAR'
              ? sourceLinearGradient(m, p, `${key(m.id)}-paint-${i}`)
              : null,
          ),
        )}
        {scene.marks
          .filter(m => m.isMask)
          .map(m => (
            <ClipPath key={m.id} id={key(m.id)}>
              <SourceGraphShape
                mark={m}
                fill="#FFFFFF"
                stroke="none"
                transform={`matrix(${m.transform.join(' ')})`}
              />
            </ClipPath>
          ))}
        {scene.photos.map(p => (
          <ClipPath key={p.id} id={`${key(p.id)}-clip`}>
            <Rect width={p.w} height={p.h} rx={p.radius} />
          </ClipPath>
        ))}
        {scene.photos
          .filter(p => p.images[0].scaleMode === 'TILE')
          .map(p => {
            const fill = p.images[0],
              meta = CATALOG_ORIGINAL_CONTENT_PHOTOS[fill.imageHash],
              asset = originalContentPhotographs[fill.imageHash],
              scale = fill.scalingFactor ?? 1;
            return (
              <Pattern
                key={p.id}
                id={`${key(p.id)}-tile`}
                patternUnits="userSpaceOnUse"
                width={meta.width * scale}
                height={meta.height * scale}
              >
                <SvgImage
                  href={typeof asset === 'number' ? asset : { uri: asset }}
                  width={meta.width * scale}
                  height={meta.height * scale}
                  preserveAspectRatio="none"
                />
              </Pattern>
            );
          })}
      </Defs>
      {scene.order.map(layer => {
        if (layer.kind === 'photo') {
          const p = scene.photos.find(p => p.id === layer.id);
          return p ? <G key={layer.id}>{photoImage(p)}</G> : null;
        }
        const m = scene.marks.find(m => m.id === layer.id);
        if (!m || m.isMask) return null;
        let shape = (
          <G transform={`matrix(${m.transform.join(' ')})`} opacity={m.opacity}>
            <SourceGraphShape
              mark={m}
              fill={value(m, m.fill[0], 0)}
              stroke={value(m, m.stroke[0], m.fill.length)}
            />
          </G>
        );
        for (const mask of m.masks)
          shape = <G clipPath={`url(#${key(mask)})`}>{shape}</G>;
        return <G key={m.id}>{shape}</G>;
      })}
    </Svg>
  );
}
function roundedSourceRect(w: number, h: number, r: readonly number[] = []) {
  const [tl = 0, tr = tl, br = tl, bl = tl] = r;
  return `M${tl} 0H${w - tr}A${tr} ${tr} 0 0 1 ${w} ${tr}V${
    h - br
  }A${br} ${br} 0 0 1 ${w - br} ${h}H${bl}A${bl} ${bl} 0 0 1 0 ${
    h - bl
  }V${tl}A${tl} ${tl} 0 0 1 ${tl} 0Z`;
}
function SourceGraphShape({
  mark,
  fill,
  stroke,
  transform,
}: {
  mark: SourceGraphMark;
  fill: string;
  stroke: string;
  transform?: string;
}) {
  const common = {
    transform,
    fill,
    stroke,
    strokeWidth: mark.strokeWidth,
    strokeDasharray: mark.dashes,
    strokeLinecap:
      mark.strokeCap === 'ROUND' ? ('round' as const) : ('butt' as const),
  };
  if (mark.kind === 'path')
    return (
      <>
        {mark.paths?.map((p, i) => (
          <Path
            key={i}
            d={p.data}
            {...common}
            fill={p.sourceFill ?? fill}
            stroke={p.sourceStroke ?? stroke}
            strokeWidth={p.sourceStrokeWidth ?? mark.strokeWidth}
            fillRule={p.windingRule === 'EVENODD' ? 'evenodd' : 'nonzero'}
          />
        ))}
      </>
    );
  if (mark.kind === 'ellipse')
    return (
      <Ellipse
        cx={mark.w / 2}
        cy={mark.h / 2}
        rx={mark.w / 2}
        ry={mark.h / 2}
        {...common}
      />
    );
  if (mark.kind === 'line')
    return <Line x1={0} y1={0} x2={mark.w} y2={mark.h} {...common} />;
  return <Path d={roundedSourceRect(mark.w, mark.h, mark.radii)} {...common} />;
}

/** Individual original graph elements, controlled by geometry/labels/state. No financial data or policies. */
export function BaselineSourcePfmGraph({
  scene,
  labels = {},
  selectedId,
  onSelect,
  selectionPath,
  interactiveMarks = [],
}: {
  scene: SourceGraphScene;
  labels?: Readonly<Record<string, string>>;
  selectedId?: string;
  onSelect?: (id: string) => void;
  selectionPath?: string;
  interactiveMarks?: readonly { id: string; label: string }[];
}) {
  const prefix = `pfm-${useId().replace(/\W/g, '')}`;
  const key = (id: string) => `${prefix}-${id.replace(/\W/g, '')}`;
  const gradient = (m: SourceGraphMark, p: SourcePaint, i: number) =>
    sourceLinearGradient(m, p, `${key(m.id)}-paint-${i}`);
  const paint = (m: SourceGraphMark, p: SourcePaint | undefined, i: number) =>
    p?.type === 'GRADIENT_LINEAR'
      ? `url(#${key(m.id)}-paint-${i})`
      : sourcePaintColor(p);
  return (
    <View style={{ gap: 8 }}>
      <View
        testID="canonical-pfm-graph"
        style={{
          width: scene.width,
          height: scene.height,
          position: 'relative',
        }}
      >
        <Svg
          width={scene.width}
          height={scene.height}
          viewBox={`0 0 ${scene.width} ${scene.height}`}
        >
          <Defs>
            {scene.marks.flatMap(m =>
              [...m.fill, ...m.stroke].map((p, i) =>
                p.type === 'GRADIENT_LINEAR' ? gradient(m, p, i) : null,
              ),
            )}
            {scene.marks
              .filter(m => m.isMask)
              .map(m => (
                <ClipPath key={m.id} id={key(m.id)}>
                  <SourceGraphShape
                    mark={m}
                    fill="#FFFFFF"
                    stroke="none"
                    transform={`matrix(${m.transform.join(' ')})`}
                  />
                </ClipPath>
              ))}
          </Defs>
          {scene.marks
            .filter(m => !m.isMask)
            .map(m => {
              const fill = paint(m, m.fill[0], 0),
                stroke = paint(m, m.stroke[0], m.fill.length);
              const interactive =
                Boolean(onSelect) && interactiveMarks.some(s => s.id === m.id);
              let element = (
                <G
                  testID={`canonical-pfm-mark-${m.id}`}
                  transform={`matrix(${m.transform.join(' ')})`}
                  opacity={m.opacity}
                  onPress={interactive ? () => onSelect?.(m.id) : undefined}
                  accessible={false}
                >
                  <SourceGraphShape mark={m} fill={fill} stroke={stroke} />
                </G>
              );
              for (const mask of m.masks)
                element = <G clipPath={`url(#${key(mask)})`}>{element}</G>;
              return <G key={m.id}>{element}</G>;
            })}
          {selectionPath ? (
            <Path
              d={selectionPath}
              fill="none"
              stroke="#007A91"
              strokeWidth={1}
              strokeDasharray="2 4"
            />
          ) : null}
        </Svg>
        {scene.texts.map(t => {
          const first = t.segments?.[0];
          const size = t.fontSize ?? first?.fontSize ?? 14;
          const style = t.fontName?.style ?? first?.fontName.style ?? 'Regular';
          const line = t.lineHeight ?? first?.lineHeight;
          const spacing = t.letterSpacing ?? first?.letterSpacing;
          return (
            <Text
              key={t.id}
              numberOfLines={t.h <= size * 1.5 ? 1 : undefined}
              ellipsizeMode="clip"
              style={{
                position: 'absolute',
                left: t.transform[4],
                top: t.transform[5],
                width: t.w,
                overflow: 'visible',
                fontFamily:
                  style === 'Bold' ? 'UniCredit-bold' : 'UniCredit-regular',
                fontSize: size,
                lineHeight: line?.unit === 'PIXELS' ? line.value : undefined,
                letterSpacing:
                  spacing?.unit === 'PIXELS'
                    ? spacing.value
                    : spacing
                    ? (size * spacing.value) / 100
                    : undefined,
                textAlign:
                  t.align === 'CENTER'
                    ? 'center'
                    : t.align === 'RIGHT'
                    ? 'right'
                    : 'left',
                color: sourcePaintColor(t.fills[0] ?? first?.fills[0]),
                opacity: t.opacity,
              }}
            >
              {labels[t.id] ??
                (t.segments
                  ? t.segments.map((s, i) => (
                      <Text
                        key={i}
                        style={{
                          fontFamily:
                            s.fontName.style === 'Bold'
                              ? 'UniCredit-bold'
                              : 'UniCredit-regular',
                          fontSize: s.fontSize,
                          color: sourcePaintColor(s.fills[0]),
                        }}
                      >
                        {s.value}
                      </Text>
                    ))
                  : t.value)}
            </Text>
          );
        })}
      </View>
      {onSelect && interactiveMarks.length ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {interactiveMarks.map(mark => (
            <Pressable
              key={mark.id}
              accessibilityRole="button"
              accessibilityLabel={mark.label}
              accessibilityState={{ selected: mark.id === selectedId }}
              aria-pressed={mark.id === selectedId}
              onPress={() => onSelect(mark.id)}
              style={{
                minHeight: 44,
                padding: 10,
                borderWidth: 1,
                borderRadius: 4,
                borderColor: mark.id === selectedId ? '#007A91' : '#CCCCCC',
              }}
            >
              <Text style={text(14, mark.id === selectedId)}>{mark.label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
/** Other authored row structures share source slots; values and input/accordion decisions stay controlled. */
export function BaselineCanonicalInvestmentRow({
  variantId,
  values = {},
  inputValue,
  onValueChange,
  onPress,
  expanded,
  children,
}: {
  variantId: string;
  values?: Readonly<Record<string, string>>;
  inputValue?: string;
  onValueChange?: (value: string) => void;
  onPress?: () => void;
  expanded?: boolean;
  children?: React.ReactNode;
}) {
  const source = getCatalogCompositionSource(variantId),
    row = CATALOG_INVESTMENT_SOURCE_ROWS.find(s => s.variantId === variantId);
  if (!source || source.status !== 'implemented' || !row) return null;
  if (variantId === '310:8609' || variantId === '303:24340') {
    const by = (id: string, fallback: string) => values[id] ?? fallback;
    const positive = variantId === '303:24340';
    return (
      <View style={{ width: 375 }}>
        <BaselineInvestmentProductRow
          title={by(positive ? '303:21744' : '310:8604', 'Investment product')}
          value={by('value', '123 453,00 CZK')}
          performance={{
            integer: by('performanceInteger', positive ? '+1 500' : '-1 500'),
            decimal: by('performanceMinor', ',00'),
            currency: by('currency', 'CZK'),
          }}
          contribution={by('contribution', 'RECURRENT')}
          percent={by('percent', positive ? '+1,8%' : '-1,8%')}
          percentColor={positive ? '#3D7D43' : '#E2001A'}
          paddingRight={16}
          onPress={onPress}
        />
      </View>
    );
  }
  const editable = variantId === '303:24358',
    accordion = variantId === '303:24408';
  const content = (
    <View
      testID="canonical-investment-source-row"
      style={{ width: row.width, height: row.height, position: 'relative' }}
    >
      {row.shapes.map(s => (
        <View
          key={s.id}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: s.x,
            top: s.y,
            width: s.width,
            height: s.height,
            borderRadius: s.radius,
            backgroundColor: sourcePaintColor(s.fill[0]),
          }}
        />
      ))}
      {row.glyphs.map((g, i) => (
        <VectorArtworkLayer
          key={i}
          asset={rowArtworkAssets[g.file]}
          x={g.x}
          y={g.y}
          width={g.width}
          height={g.height}
        />
      ))}
      {row.texts.map(t => {
        const segment = t.segments[0],
          size = segment.fontSize;
        const style: TextStyle = {
          position: 'absolute',
          left: t.x,
          top: t.y,
          width: t.width,
          fontFamily:
            segment.fontName.style === 'Bold'
              ? 'UniCredit-bold'
              : 'UniCredit-regular',
          fontSize: size,
          lineHeight:
            segment.lineHeight.unit === 'PIXELS'
              ? segment.lineHeight.value
              : undefined,
          letterSpacing:
            segment.letterSpacing.unit === 'PIXELS'
              ? segment.letterSpacing.value
              : (size * segment.letterSpacing.value) / 100,
          textAlign:
            t.align === 'RIGHT'
              ? 'right'
              : t.align === 'CENTER'
              ? 'center'
              : 'left',
          color: sourcePaintColor(segment.fills[0]),
        };
        if (editable && t.id === '303:24349')
          return (
            <TextInput
              key={t.id}
              testID="canonical-investment-input"
              accessibilityLabel="Debit current account"
              value={inputValue ?? values[t.id] ?? t.value}
              onChangeText={onValueChange}
              style={[style, { height: t.height, padding: 0 }]}
            />
          );
        return (
          <Text
            key={t.id}
            testID={`canonical-investment-text-${t.id}`}
            style={style}
          >
            {values[t.id] ??
              t.segments.map((s, i) => (
                <Text
                  key={i}
                  style={{
                    fontFamily:
                      s.fontName.style === 'Bold'
                        ? 'UniCredit-bold'
                        : 'UniCredit-regular',
                    fontSize: s.fontSize,
                    color: sourcePaintColor(s.fills[0]),
                  }}
                >
                  {s.value}
                </Text>
              ))}
          </Text>
        );
      })}
    </View>
  );
  if (editable) return content;
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          values.accessibilityLabel ?? source.name.replace('Type=', '')
        }
        accessibilityState={accordion ? { expanded } : undefined}
        onPress={onPress}
      >
        {content}
      </Pressable>
      {accordion && expanded ? children : null}
    </View>
  );
}
