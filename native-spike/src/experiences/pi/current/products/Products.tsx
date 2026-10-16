import { futureGainEnabled } from '../future-gain/model';
import { getFutureGainProductOffers } from '@/features/investments/future-gain/offers';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useDemoViewport } from '../../../../universal/DemoViewport';
import {
  getProductsMenuForCountry,
  getProductCardSheetConfig,
  type ProductsCard,
  type ProductsCardId,
  type ProductsMenuTab,
} from '@/app/config/productsMenuConfig';
import { NavigationRow, SearchField } from '../../../../universal/controls';
import { Text } from '../../../../universal/Typography';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import PrimaryHeader from '../PrimaryHeader';
import {
  SourceMenuCard,
  SourceOfferCard,
  SourceShopSmartCard,
} from './SourceCards';
import { SourceBottomSheet } from '../../../../universal/SourceBottomSheet';
import type { CurrentAdapter, CurrentScreenProps } from '../contracts';
function SectionTitle({
  host,
  children,
}: {
  host: CurrentScreenProps;
  children: string;
}) {
  if (!children) return null;
  return (
    <View style={exactSourceStyles.inline1}>
      <Text
        style={[
          exactSourceStyles.inline2,
          { fontFamily: host.tokens.strongFont, color: host.tokens.muted },
        ]}
      >
        {children}
      </Text>
      <View
        style={[
          exactSourceStyles.inline3,
          { backgroundColor: host.tokens.border },
        ]}
      />
    </View>
  );
}
export function localized(
  host: CurrentScreenProps,
  key: string,
  fallback: string,
) {
  const value = host.t(key);
  return value === key ? fallback : value;
}
export default function Products(host: CurrentScreenProps) {
  const config = getProductsMenuForCountry(host.country);
  const [tab, setTab] = useState<ProductsMenuTab>('banking');
  const [selected, setSelected] = useState<ProductsCard | null>(null);
  const [query, setQuery] = useState('');
  const useWidth = useDemoViewport().width;
  const width = 327;
  const offers = tab === 'banking'
    ? getFutureGainProductOffers({ product: 'PI', country: host.country, release: host.release }, config.offers)
    : config.shopSmartOffers;
  useEffect(() => {
    const focus = host.route.params?.focus;
    if (!focus) return;
    const item = config.products.find(card => card.id === focus);
    if (item) {
      setTab('banking');
      setSelected(item);
    }
  }, [host.route.params?.focus, config.products]);
  const openCard = (card: ProductsCard) => {
    setSelected(localizeCard(card));
  };
  const localizeCard = (item: ProductsCard) => ({
    ...item,
    title:
      item.translationKey === null
        ? item.title
        : localized(
            host,
            `runtime.productsMenu.cards.${
              item.translationKey ??
              {
                electronics: 'electronics',
                travel: 'travel',
                'home and living': 'home-living',
                fashion: 'fashion',
              }[item.title.replace(/\n/g, ' ').toLowerCase()] ??
              item.id
            }`,
            item.title,
          ),
  });
  const card = (item: ProductsCard, fullWidth = false) => (
    <SourceMenuCard
      key={item.id}
      dark={host.tokens.background === '#121212'}
      width={fullWidth ? useWidth - 48 : (useWidth - 60) / 2}
      card={localizeCard(item)}
      onPress={() => openCard(item)}
    />
  );
  const filtered = useMemo(
    () =>
      config.shopSmartOfferCards.filter(offer =>
        `${offer.merchant} ${offer.title} ${offer.statusText} ${
          offer.pillLabel ?? ''
        } ${offer.tagLabel ?? ''} ${offer.partnerTagLabel ?? ''} ${
          offer.distance ?? ''
        }`
          .toLocaleLowerCase()
          .includes(query.trim().toLocaleLowerCase()),
      ),
    [config, query],
  );
  return (
    <View
      style={[
        exactSourceStyles.inline4,
        { backgroundColor: host.tokens.background },
      ]}
    >
      <PrimaryHeader
        host={host}
        title={localized(host, 'runtime.productsMenu.title', config.title)}
      />
      {config.hasShopSmartTab && (
        <View style={exactSourceStyles.inline5}>
          {[
            {
              value: 'banking',
              label: localized(
                host,
                'runtime.productsMenu.banking',
                config.bankingTabLabel,
              ),
            },
            {
              value: 'shopsmart',
              label: localized(
                host,
                'runtime.productsMenu.shopSmart',
                config.shopSmartTabLabel,
              ),
            },
          ].map(item => (
            <Pressable
              key={item.value}
              accessibilityRole="tab"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: tab === item.value }}
              onPress={() => setTab(item.value as ProductsMenuTab)}
              style={[
                exactSourceStyles.inline6,
                tab === item.value ? s.tabActive : s.tabInactive,
                {
                  borderBottomColor:
                    tab === item.value ? host.tokens.text : host.tokens.muted,
                },
              ]}
            >
              <Text
                style={[
                  exactSourceStyles.inline7,
                  {
                    fontFamily: host.tokens.strongFont,
                    color:
                      tab === item.value ? host.tokens.text : host.tokens.muted,
                  },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      <ScrollView
        style={exactSourceStyles.inline8}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {offers.length > 0 && (
          <>
            <SectionTitle host={host}>
              {localized(
                host,
                'runtime.productsMenu.offersForYou',
                config.offersTitle,
              )}
            </SectionTitle>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={width + 12}
              decelerationRate="fast"
              contentContainerStyle={s.offerRail}
            >
              {offers.map(offer => (
                <SourceOfferCard
                  offer={{
                    ...offer,
                    title: localized(
                      host,
                      `runtime.productsMenu.offers.${offer.id}.title`,
                      offer.title,
                    ),
                    description: localized(
                      host,
                      `runtime.productsMenu.offers.${offer.id}.description`,
                      offer.description,
                    ),
                  }}
                  dark={host.tokens.background === '#121212'}
                  onPress={
                    futureGainEnabled(host)
                      ? () => {
                          if (offer.id === 'future-gain-products-for-you')
                            host.onNavigate({ screen: 'peer-insights' });
                          if (offer.id === 'future-gain-smart-investment')
                            host.onNavigate({ screen: 'smart-investment' });
                        }
                      : undefined
                  }
                  key={offer.id}
                />
              ))}
            </ScrollView>
          </>
        )}
        {tab === 'banking' ? (
          <>
            <SectionTitle host={host}>
              {config.productsTitle
                ? localized(
                    host,
                    'runtime.productsMenu.ourProducts',
                    config.productsTitle,
                  )
                : ''}
            </SectionTitle>
            <View style={s.grid}>
              {config.products.map(item => card(item))}
            </View>
            {config.otherSolutions.length > 0 && (
              <>
                <SectionTitle host={host}>
                  {localized(
                    host,
                    'runtime.productsMenu.otherSolutionsForYou',
                    config.otherSolutionsTitle,
                  )}
                </SectionTitle>
                <View style={s.grid}>
                  {config.otherSolutions.map(item => card(item, true))}
                </View>
              </>
            )}
          </>
        ) : (
          <>
            <View style={exactSourceStyles.inline9}>
              <Pressable
                accessibilityRole="button"
                onPress={() => {}}
                style={exactSourceStyles.inline10}
              >
                <View style={exactSourceStyles.inline11}>
                  <Text
                    style={[
                      exactSourceStyles.inline12,
                      {
                        fontFamily: host.tokens.strongFont,
                        color: host.tokens.muted,
                      },
                    ]}
                  >
                    ACTIVATED OFFERS:{config.shopSmartSummary.activatedOffers}
                  </Text>
                  <Text
                    style={[
                      exactSourceStyles.inline13,
                      {
                        fontFamily: host.tokens.strongFont,
                        color: host.tokens.text,
                      },
                    ]}
                  >
                    {config.shopSmartSummary.totalSavedLabel}
                  </Text>
                  <Text
                    style={[
                      exactSourceStyles.inline14,
                      { fontFamily: host.tokens.font, color: host.tokens.text },
                    ]}
                  >
                    {config.shopSmartSummary.totalSavedAmount}
                  </Text>
                </View>
                <SourceCustomIcon
                  name="chevron-link"
                  size={32}
                  color={host.tokens.text}
                />
              </Pressable>
              <SectionTitle host={host}>
                {localized(
                  host,
                  'runtime.productsMenu.allOffers',
                  'ALL OFFERS',
                )}
              </SectionTitle>
              <View style={exactSourceStyles.inline15}>
                <SearchField
                  tokens={{
                    ...host.tokens,
                    searchBackground: host.tokens.background,
                    searchRadius: 10,
                    searchPaddingHorizontal: 0,
                    searchGap: 8,
                  }}
                  label={localized(host, 'runtime.actions.search', 'Search')}
                  onSubmit={() => undefined}
                  value={query}
                  placeholder={localized(
                    host,
                    'runtime.actions.search',
                    'Search',
                  )}
                  icon={
                    <View style={exactSourceStyles.inline16}>
                      <SourceCustomIcon
                        name="search"
                        size={20}
                        color={host.tokens.text}
                      />
                    </View>
                  }
                  clearLabel="Clear search results"
                  clearIcon={
                    <SourceCustomIcon
                      name="clear-results"
                      size={20}
                      color={host.tokens.text}
                    />
                  }
                  idleTrailing={
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={localized(
                        host,
                        'runtime.actions.filters',
                        'Filters',
                      )}
                      onPress={() => {}}
                      style={exactSourceStyles.inline17}
                    >
                      <SourceCustomIcon
                        name="filters"
                        size={20}
                        color={host.tokens.text}
                      />
                    </Pressable>
                  }
                  containerStyle={s.searchRow}
                  inputStyle={[s.searchInput,{
                    fontFamily: host.tokens.strongFont,
                  }]}
                  onChange={setQuery}
                  onClear={() => setQuery('')}
                />
              </View>
              <View style={exactSourceStyles.inline18}>
                {filtered.map(offer => (
                  <SourceShopSmartCard
                    key={offer.id}
                    offer={offer}
                    dark={host.tokens.background === '#121212'}
                  />
                ))}
                {!filtered.length && (
                  <Text
                    style={[
                      exactSourceStyles.inline19,
                      {
                        fontFamily: host.tokens.strongFont,
                        color: host.tokens.muted,
                      },
                    ]}
                  >
                    {localized(
                      host,
                      'runtime.productsMenu.noOffersFound',
                      'No offers found',
                    )}
                  </Text>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
      {selected && (
        <SourceBottomSheet
          dark={host.tokens.background === '#121212'}
          title={
            getProductCardSheetConfig(selected.id, host.country).title ??
            selected.title
          }
          onClose={() => setSelected(null)}
        >
          {getProductCardSheetConfig(selected.id, host.country).options.map(
            option => (
              <NavigationRow
                key={option.id}
                tokens={host.tokens}
                borderWidth={0}
                titleStyle={[s.optionTitle,{
                  fontFamily: host.tokens.strongFont,
                }]}
                containerStyle={s.optionRow}
                trailing={
                  <View style={exactSourceStyles.inline20}>
                    <SourceCustomIcon
                      name="chevron-link"
                      size={32}
                      color={host.tokens.text}
                    />
                  </View>
                }
                title={option.title}
                payload={option}
                onSelect={() => {
                  setSelected(null);
                  host.onNavigate({
                    screen: 'product-detail',
                    params: {
                      cardId: selected.id,
                      optionId: option.id,
                      title: option.title,
                    },
                  });
                }}
              />
            ),
          )}
        </SourceBottomSheet>
      )}
    </View>
  );
}
export const currentProductSearch: NonNullable<
  CurrentAdapter['searchEntries']
> = context =>
  getProductsMenuForCountry(context.country).products.flatMap(card =>
    getProductCardSheetConfig(card.id, context.country).options.map(option => ({
      id: `current-product-${card.id}-${option.id}`,
      label: option.title,
      subtitle: card.title,
      keywords: [card.title, option.title],
      target: {
        screen: 'product-detail',
        params: {
          cardId: card.id as ProductsCardId,
          optionId: option.id,
          title: option.title,
        },
      },
    })),
  );
const s = StyleSheet.create({
  tabActive:{borderBottomWidth:3},tabInactive:{borderBottomWidth:1},scrollContent:{paddingBottom:92},
  searchRow:{height:32,minHeight:32},searchInput:{fontSize:14,lineHeight:15,height:32,padding:0},
  optionTitle:{fontSize:18,lineHeight:20,letterSpacing:.3},optionRow:{paddingLeft:24,paddingRight:16,paddingVertical:24,minHeight:80},
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  product: {
    width: '47%',
    minHeight: 144,
    padding: 16,
    borderRadius: 8,
    gap: 8,
    justifyContent: 'space-between',
  },
  productImage: { width: '100%', height: 64, borderRadius: 4 },
  cardTitle: { fontSize: 20, lineHeight: 24, fontFamily: 'UniCredit-bold' },
  offerRail: { gap: 12, paddingHorizontal: 24, paddingTop: 16 },
  offer: { padding: 20, borderRadius: 8, minHeight: 190, gap: 12 },
  merchant: { borderRadius: 8, overflow: 'hidden' },
  merchantImage: { width: '100%', height: 140 },
  merchantCopy: { padding: 16, gap: 12 },
});

const exactSourceStyles = StyleSheet.create({
  inline1: { paddingHorizontal: 24, paddingTop: 16 },
  inline2: { fontSize: 14, lineHeight: 15, textTransform: 'uppercase' },
  inline3: { height: 1, marginTop: 8 },
  inline4: { flex: 1 },
  inline5: { height: 48, flexDirection: 'row' },
  inline6: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  inline7: { fontSize: 20, lineHeight: 24 },
  inline8: { flex: 1 },
  inline9: { paddingTop: 16 },
  inline10: {
    minHeight: 80,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  inline11: { flex: 1 },
  inline12: { fontSize: 14, lineHeight: 20, letterSpacing: 1 },
  inline13: { fontSize: 18, lineHeight: 24, marginTop: 2 },
  inline14: { fontSize: 16, lineHeight: 20, marginTop: 1 },
  inline15: { paddingHorizontal: 16, paddingVertical: 2, marginTop: 16 },
  inline16: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline17: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline18: { paddingHorizontal: 24, gap: 16, marginTop: 16 },
  inline19: {
    paddingVertical: 24,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 18,
  },
  inline20: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
