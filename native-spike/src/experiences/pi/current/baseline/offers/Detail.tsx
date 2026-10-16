import React, { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import {
  getProductApplyLabel,
  getProductDetailContent,
  getProductDetailImageKey,
  type ProductDetailImageKey,
} from '@/features/products/evoProductDetail';
import activateAccount from '@/assets/products/detail/img_illustration_activateaccount.png';
import activateToken from '@/assets/products/detail/img_illustration_activatetoken.png';
import blocking from '@/assets/products/detail/img_illustration_blocking.png';
import documents from '@/assets/products/detail/img_illustration_documents.png';
import credentials from '@/assets/products/detail/img_illustration_forgottencredentials.png';
import home from '@/assets/products/detail/img_illustration_homeinsurance_RS.png';
import identifier from '@/assets/products/detail/img_illustration_hu_missing_secondary_identifier.png';
import scan from '@/assets/products/detail/img_illustration_scanqrcode.png';
import biometric from '@/assets/products/detail/img_illustration_touchfaceid.png';
import travel from '@/assets/products/detail/img_illustration_travelinsurance_RS.png';
import { BaselinePageHeader } from '../../../../../universal/BaselinePageHeader';
import { BaselineTextField } from '../../../../../universal/BaselineTextField';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';
import type { CurrentScreenProps } from '../../contracts';
import { FaceIdOverlay } from '../FaceIdOverlay';
import { RasterImage } from './RasterImage';

const images: Record<ProductDetailImageKey, string> = {
  'activate-account': activateAccount,
  'activate-token': activateToken,
  blocking,
  documents,
  'forgotten-credentials': credentials,
  'home-insurance': home,
  'hu-missing-secondary-identifier': identifier,
  'scan-qr-code': scan,
  'touch-face-id': biometric,
  'travel-insurance': travel,
};

/** Source StandardSignScreen uses product copy, editable seeded PIN and the shared demo Face ID. */
function ProductSign({
  host,
  title,
  dark,
  onBack,
  onSign,
}: {
  host: CurrentScreenProps;
  title: string;
  dark: boolean;
  onBack: () => void;
  onSign: () => void;
}) {
  const [pin, setPin] = useState('******');
  const [authenticating, setAuthenticating] = useState(false);
  return (
    <View
      testID="ro-product-sign"
      style={[
        styles.screen,
        { backgroundColor: sourceColor('var(--uc-surface)', dark) },
      ]}
    >
      <BaselinePageHeader
        title={`Apply for ${title}`}
        onBack={onBack}
        includeSafeArea
        showHelp={false}
        safeAreaReserve={host.screenTopInset}
        dark={dark}
      />
      <View style={styles.signBody}>
        <BaselineTextField
          label="Mobile banking PIN"
          value={pin}
          onChange={setPin}
          helperText="Confirm you want to send this request."
          visualState="on-focus"
          dark={dark}
        />
      </View>
      <View style={styles.footer}>
        <PrimaryButton
          label="Send request"
          disabled={authenticating}
          dark={dark}
          onPress={() => {
            if (!authenticating) setAuthenticating(true);
          }}
        />
      </View>
      {authenticating ? (
        <FaceIdOverlay
          success={sourceColor('var(--uc-green-success)', dark)}
          onComplete={() => {
            setAuthenticating(false);
            onSign();
          }}
        />
      ) : null}
    </View>
  );
}

/** Source StandardSuccessScreen has no toolbar and finishes through its single CTA. */
function ProductSuccess({
  title,
  dark,
  onDone,
}: {
  title: string;
  dark: boolean;
  onDone: () => void;
}) {
  const text = sourceColor('var(--uc-text)', dark),
    olive = sourceColor('var(--uc-green-olive)', dark);
  return (
    <View
      testID="ro-product-success"
      style={[
        styles.screen,
        { backgroundColor: sourceColor('var(--uc-surface)', dark) },
      ]}
    >
      <View style={styles.successHeading}>
        <Text
          accessibilityRole="header"
          style={[styles.largeTitleText, { color: text }]}
        >
          Request sent
        </Text>
      </View>
      <View style={styles.successBody}>
        <View style={styles.checkPosition}>
          <View style={[styles.check, { borderColor: olive }]}>
            <SourceCustomIcon name="prime-check" size={64} color={olive} />
          </View>
        </View>
        <Text
          style={[styles.successMessage, { color: text }]}
        >{`We received your request for ${title}. You can follow it in My applications.`}</Text>
      </View>
      <View style={styles.footer}>
        <PrimaryButton label="Back to products" onPress={onDone} dark={dark} />
      </View>
    </View>
  );
}

/** RO baseline keeps Source ProductDetailScreen's content helpers, geometry and apply lifecycle. */
export default function Detail(host: CurrentScreenProps) {
  const [step, setStep] = useState<'detail' | 'sign' | 'success'>('detail');
  const [progress, setProgress] = useState(0);
  const presentation = host.productDetailPresentation;
  const params = host.route.params ?? {};
  const title = presentation?.title ?? params.title ?? 'Product';
  const cardId = presentation?.cardId ?? params.cardId;
  const optionId = presentation?.optionId ?? params.optionId;
  const actionLabel = presentation?.actionLabel ?? params.actionLabel;
  const heroImage = presentation?.heroImage ?? params.heroImage;
  const heroImagePosition =
    presentation?.heroImagePosition ?? params.heroImagePosition;
  const headline = presentation?.headline ?? params.headline;
  const intro = presentation?.intro ?? params.intro;
  const includeSafeArea = presentation?.includeSafeArea ?? true;
  const content = getProductDetailContent(optionId, cardId, title);
  const image = heroImage ?? images[getProductDetailImageKey(optionId, cardId)];
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const registerBack = host.onBackHandlerChange;
  useEffect(() => {
    registerBack?.(() => {
      if (step !== 'sign') return false;
      setStep('detail');
      return true;
    });
    return () => registerBack?.(null);
  }, [registerBack, step]);
  if (step === 'sign')
    return (
      <ProductSign
        host={host}
        title={title}
        dark={dark}
        onBack={() => setStep('detail')}
        onSign={() => setStep('success')}
      />
    );
  if (step === 'success')
    return (
      <ProductSuccess
        title={title}
        dark={dark}
        onDone={() => {
          setStep('detail');
          host.onBack();
        }}
      />
    );
  const text = sourceColor('var(--uc-text)', dark);
  return (
    <View
      testID="ro-product-detail"
      style={[
        styles.screen,
        { backgroundColor: sourceColor('var(--uc-surface)', dark) },
      ]}
    >
      <View style={styles.toolbar}>
        <BaselinePageHeader
          title={title}
          onBack={host.onBack}
          includeSafeArea={includeSafeArea}
          safeAreaReserve={includeSafeArea ? host.screenTopInset : 0}
          renderLargeTitle={false}
          collapsedTitleProgress={progress}
          dark={dark}
        />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[
          styles.scroll,
          Platform.OS === 'web'
            ? ({ transform: 'none' } as unknown as ViewStyle)
            : undefined,
        ]}
        scrollEventThrottle={16}
        onScroll={event =>
          setProgress(
            Math.min(1, Math.max(0, event.nativeEvent.contentOffset.y / 64)),
          )
        }
      >
        <View
          style={{ height: (includeSafeArea ? host.screenTopInset : 0) + 48 }}
        />
        <View style={styles.largeTitle}>
          <Text
            accessibilityRole="header"
            numberOfLines={2}
            style={[
              styles.largeTitleText,
              styles.largeTitleChild,
              { color: text, opacity: 1 - progress },
            ]}
          >
            {title}
          </Text>
        </View>
        <View style={styles.main}>
          <View
            testID="ro-product-detail-image-frame"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[
              styles.imageFrame,
              { backgroundColor: sourceColor('var(--uc-surface-muted)', dark) },
            ]}
          >
            {/* Source's percentage height resolves to the illustration's 327x160
                intrinsic ratio; the 12:5 grid clips its bottom rather than centering a crop. */}
            <RasterImage
              source={typeof image === 'number' ? image : { uri: image }}
              resizeMode="cover"
              objectPosition={heroImagePosition ?? 'center'}
              style={[
                styles.image,
                heroImage ? { aspectRatio: 12 / 5 } : undefined,
              ]}
            />
          </View>
          <Text
            accessibilityRole="header"
            style={[styles.heading, { color: text }]}
          >
            {headline ?? content.heading}
          </Text>
          {intro ? (
            <Text
              style={[
                styles.intro,
                { color: sourceColor('var(--uc-text-muted)', dark) },
              ]}
            >
              {intro}
            </Text>
          ) : null}
          {headline && content.heading !== headline ? (
            <Text
              accessibilityRole="header"
              style={[styles.subheading, { color: text }]}
            >
              {content.heading}
            </Text>
          ) : null}
          <View style={styles.paragraphs}>
            {content.body.map(paragraph => (
              <Text key={paragraph} style={[styles.paragraph, { color: text }]}>
                {paragraph}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          label={actionLabel ?? getProductApplyLabel(cardId)}
          dark={dark}
          onPress={() => {
            if (host.onProductDetailAction) host.onProductDetailAction();
            else setStep('sign');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, width: '100%', overflow: 'hidden' },
  toolbar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 },
  scroll: { flex: 1, minHeight: 0 },
  largeTitle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  largeTitleChild: { flexShrink: 1 },
  largeTitleText: { fontFamily: 'UniCredit-bold', fontSize: 28 },
  main: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  imageFrame: {
    width: '100%',
    aspectRatio: 12 / 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    aspectRatio: 327 / 160,
  },
  heading: {
    marginTop: 25,
    fontFamily: 'UniCredit-bold',
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: -0.2,
  },
  intro: {
    marginTop: 10,
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 21,
  },
  subheading: {
    marginTop: 26,
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 20,
  },
  paragraphs: { marginTop: 24, gap: 22 },
  paragraph: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0,
  },
  footer: { paddingHorizontal: 24, paddingBottom: 42 },
  signBody: { flex: 1, minHeight: 0, paddingHorizontal: 24, paddingTop: 150 },
  successHeading: { paddingHorizontal: 24, paddingTop: 84 },
  successBody: { flex: 1, minHeight: 0, paddingHorizontal: 24 },
  checkPosition: { alignItems: 'center', paddingTop: 58 },
  check: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successMessage: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    paddingTop: 58,
  },
});
