import React, { useId, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import {
  ACCOUNT_OPTION_ITEMS,
  ACCOUNT_PRODUCT_OPTIONS,
} from '@/data/accountDetails';
import type { CurrentScreenProps } from '../contracts';
import { copy } from '../banking/model';
import { optionArt } from '../banking/assets';
import { BaselinePageHeader } from '../../../../universal/BaselinePageHeader';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { Text } from '../../../../universal/Typography';
import { sourceColor } from '../../../../universal/sourceColor';

/** Original account options are presentation-only; their missing callbacks stay inert. */
export default function RoBaselineAccountOptions(host: CurrentScreenProps) {
  const [progress, setProgress] = useState(0),
    shadeId = useId().replace(/:/g, '');
  const title = copy(host, 'runtime.accountOptions.title', 'Account options');
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true),
    surface = sourceColor('var(--uc-surface)', dark);
  return (
    <View style={[styles.root, { backgroundColor: surface }]}>
      <ScrollView
        testID="ro-account-options-page"
        stickyHeaderIndices={[0]}
        style={Platform.OS === 'web' ? styles.webScroll : undefined}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={event =>
          setProgress(
            Math.min(1, Math.max(0, event.nativeEvent.contentOffset.y / 64)),
          )
        }
      >
        <BaselinePageHeader
          title={title}
          onBack={host.onBack}
          showHelp={false}
          renderLargeTitle={false}
          includeSafeArea
          safeAreaReserve={host.screenTopInset}
          collapsedTitleProgress={progress}
          dark={dark}
        />
        <View style={[styles.titleFrame, { opacity: 1 - progress }]}>
          <Text
            accessibilityRole="header"
            style={[styles.title, { color: host.tokens.text }]}
          >
            {title}
          </Text>
        </View>
        <View style={styles.content}>
          <View style={styles.menu}>
            {ACCOUNT_OPTION_ITEMS.map(item => (
              <Pressable
                key={item.id}
                testID={`ro-account-option-${item.id}`}
                accessibilityRole="button"
                accessibilityLabel={copy(
                  host,
                  `runtime.accountOptions.items.${item.id}.title`,
                  item.title,
                )}
                style={styles.option}
              >
                <View style={styles.icon}>
                  <SourceCustomIcon
                    name={`account-option-${
                      item.id === 'share-account-info'
                        ? 'share-info'
                        : item.id === 'account-statement'
                        ? 'statement'
                        : item.id === 'change-account-name'
                        ? 'change-name'
                        : item.id
                    }`}
                    size={20}
                    color={host.tokens.text}
                  />
                </View>
                <View style={styles.description}>
                  <Text style={[styles.menuTitle, { color: host.tokens.text }]}>
                    {copy(
                      host,
                      `runtime.accountOptions.items.${item.id}.title`,
                      item.title,
                    ).toUpperCase()}
                  </Text>
                  <Text
                    style={[
                      styles.menuDescription,
                      { color: host.tokens.muted },
                    ]}
                  >
                    {copy(
                      host,
                      `runtime.accountOptions.items.${item.id}.description`,
                      item.description,
                    )}
                  </Text>
                </View>
                <View style={styles.icon}>
                  <SourceCustomIcon
                    name="chevron-link"
                    size={32}
                    color={host.tokens.text}
                  />
                </View>
              </Pressable>
            ))}
          </View>
          <View style={styles.products}>
            <Text
              accessibilityRole="header"
              style={[
                styles.productsTitle,
                { color: host.tokens.text, borderColor: host.tokens.border },
              ]}
            >
              {copy(
                host,
                'runtime.productsMenu.title',
                'Products',
              ).toUpperCase()}
            </Text>
            <View style={styles.offers}>
              {ACCOUNT_PRODUCT_OPTIONS.map(product => (
                <Pressable
                  key={product.id}
                  testID={`ro-account-offer-${product.id}`}
                  accessibilityRole="button"
                  accessibilityLabel={copy(
                    host,
                    `runtime.accountOptions.products.${product.id}.title`,
                    product.title,
                  )}
                  style={[
                    styles.offer,
                    {
                      boxShadow: `0 12px 22px ${sourceColor(
                        'rgb(var(--uc-shadow-rgb)/0.18)',
                        dark,
                      )}`,
                    },
                  ]}
                >
                  {Platform.OS === 'web' ? (
                    React.createElement('img', {
                      src:
                        optionArt[product.image]?.uri ??
                        optionArt[product.image],
                      alt: '',
                      style: {
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      },
                    })
                  ) : (
                    <Image
                      source={optionArt[product.image]}
                      style={styles.fill}
                      resizeMode="cover"
                    />
                  )}
                  {Platform.OS === 'web' ? (
                    <View
                      style={[
                        styles.fill,
                        {
                          backgroundImage:
                            'linear-gradient(to right, oklab(0 0 0 / 0.7) 0%, oklab(0 0 0 / 0.32) 50%, oklab(0 0 0 / 0.1) 100%)',
                        } as never,
                      ]}
                    />
                  ) : (
                    <Svg width="100%" height="100%" style={styles.fill}>
                      <Defs>
                        <LinearGradient
                          id={`${shadeId}-${product.id}`}
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <Stop offset="0" stopColor="#000" stopOpacity={0.7} />
                          <Stop
                            offset={0.5}
                            stopColor="#000"
                            stopOpacity={0.32}
                          />
                          <Stop offset="1" stopColor="#000" stopOpacity={0.1} />
                        </LinearGradient>
                      </Defs>
                      <Rect
                        width="100%"
                        height="100%"
                        fill={`url(#${shadeId}-${product.id})`}
                      />
                    </Svg>
                  )}
                  <View style={styles.offerContent}>
                    <Text style={styles.offerTitle}>
                      {copy(
                        host,
                        `runtime.accountOptions.products.${product.id}.title`,
                        product.title,
                      )}
                    </Text>
                    <Text style={styles.offerDescription}>
                      {copy(
                        host,
                        `runtime.accountOptions.products.${product.id}.description`,
                        product.description,
                      )}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  webScroll: { transform: 'none' },
  titleFrame: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: { fontFamily: 'UniCredit-bold', fontSize: 28, lineHeight: 31 },
  content: { paddingHorizontal: 24, paddingTop: 30, paddingBottom: 32 },
  menu: { gap: 28 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  icon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: { flex: 1, minWidth: 0 },
  menuTitle: { fontFamily: 'UniCredit-bold', fontSize: 14, lineHeight: 15 },
  menuDescription: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 15,
    marginTop: 2,
  },
  products: { paddingTop: 28 },
  productsTitle: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 17,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  offers: { paddingTop: 16, gap: 16 },
  offer: { height: 119, borderRadius: 6, overflow: 'hidden' },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  offerContent: {
    height: '100%',
    paddingHorizontal: 16,
    paddingVertical: 18,
    justifyContent: 'space-between',
  },
  offerTitle: {
    fontFamily: 'UniCredit-bold',
    fontSize: 26,
    lineHeight: 28,
    color: '#FFF',
  },
  offerDescription: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 15,
    maxWidth: 250,
    color: '#FFF',
  },
});
