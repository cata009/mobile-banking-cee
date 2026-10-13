import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { MOBILE_FIRST_TAB_CONTENT } from '@/experiences/pi/it/mobile-first/productTabContent';
import { insuranceAssets as a } from '@/experiences/pi/it/mobile-first/insuranceAssets';
import { Text } from '../../../../universal/Typography';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import { CreditHeader, s } from '../loans/LoanPrimitives';

type Product =
  (typeof MOBILE_FIRST_TAB_CONTENT)['Polizze assicurative']['products'][number];

function CatalogueImage({ product }: { product: Product }) {
  const [width, setWidth] = useState(0);
  const [natural, setNatural] = useState<{ width: number; height: number }>();
  const source = useMemo<ImageSourcePropType>(
    () =>
      typeof product.image === 'number'
        ? product.image
        : { uri: product.image },
    [product.image],
  );
  useEffect(() => {
    const resolved =
      typeof Image.resolveAssetSource === 'function'
        ? Image.resolveAssetSource(source)
        : undefined;
    if (resolved?.width && resolved.height) {
      setNatural({ width: resolved.width, height: resolved.height });
      return;
    }
    const uri =
      resolved?.uri ??
      (typeof source === 'object' && 'uri' in source ? source.uri : undefined);
    if (!uri) return;
    let active = true;
    Image.getSize(
      uri,
      (imageWidth, imageHeight) => {
        if (active) setNatural({ width: imageWidth, height: imageHeight });
      },
      () => {},
    );
    return () => {
      active = false;
    };
  }, [source]);
  const crop = product.crop;
  const imageWidth =
    'width' in crop
      ? (width * parseFloat(crop.width)) / 100
      : natural?.width ?? width;
  const imageHeight =
    'height' in crop
      ? (240 * parseFloat(crop.height)) / 100
      : natural
      ? (imageWidth * natural.height) / natural.width
      : 240;
  return (
    <View
      style={styles.imageClip}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
    >
      {/* Source catalogue images are static; left/top crop offsets have no effect there. */}
      <Image
        accessible={false}
        source={source}
        resizeMode="stretch"
        style={{ width: imageWidth, height: imageHeight }}
      />
    </View>
  );
}

export default function InsuranceCatalogue({
  onBack,
  onDiscover,
}: {
  onBack: () => void;
  onDiscover: (subject: string) => void;
}) {
  return (
    <View style={s.screen}>
      <CreditHeader onBack={onBack} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        contentContainerStyle={s.content}
      >
        <View style={styles.heading}>
          <Text accessibilityRole="header" style={s.title}>
            Le nostre polizze
          </Text>
        </View>
        <View style={styles.catalogue}>
          {MOBILE_FIRST_TAB_CONTENT['Polizze assicurative'].products.map(
            product => (
              <View key={product.title} style={styles.product}>
                <CatalogueImage product={product} />
                <Text accessibilityRole="header" style={styles.productTitle}>
                  {product.title}
                </Text>
                <Text style={s.body}>{product.description}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Scopri di più ${product.title}`}
                  onPress={() => onDiscover(product.title)}
                  style={styles.discover}
                >
                  <Text style={styles.discoverLabel}>SCOPRI DI PIÙ</Text>
                  <AssetGlyph asset={a.forth} size={16} />
                </Pressable>
              </View>
            ),
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { backgroundColor: '#fff', paddingBottom: 24 },
  catalogue: { gap: 40 },
  product: { gap: 16, alignItems: 'flex-start' },
  imageClip: {
    width: '100%',
    height: 240,
    overflow: 'hidden',
    borderRadius: 16,
  },
  productTitle: {
    fontFamily: tokens.strongFont,
    color: tokens.text,
    fontSize: 28,
    lineHeight: 32,
    marginBottom: 16,
  },
  discover: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  discoverLabel: {
    fontFamily: tokens.strongFont,
    color: tokens.accent,
    fontSize: 14,
    lineHeight: 16,
  },
});
