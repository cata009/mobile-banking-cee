import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from '../../../../../universal/Typography';
import { Header, SearchField, Tabs } from '../../../../../universal/controls';
import {
  PRODUCT_SHELF_CATEGORIES,
  PRODUCT_SHELF_ENTRY_CARDS,
  getProductShelfCategory,
  type ProductShelfItem,
  type ProductShelfCategoryId,
} from '@/app/config/productsShelfConfig';
import {
  getProductsMenuForCountry,
  type ShopSmartOfferCategory,
} from '@/app/config/productsMenuConfig';
import type { CzechNativeScreenProps } from '../contracts';
import { evoTokens as tokens } from '../home/tokens';
import { Glyph, IconAction, textStyles as t } from '../home/Primitives';
import { SourcePhoto } from './SourcePhoto';
import Prime from './Prime';

type ViewKind =
  | 'shelf'
  | 'category'
  | 'search'
  | 'shopsmart'
  | 'partner-offers'
  | 'prime';
const viewKind = (value?: string): ViewKind =>
  ['category', 'search', 'shopsmart', 'partner-offers', 'prime'].includes(
    value ?? '',
  )
    ? (value as ViewKind)
    : 'shelf';
const searchable = PRODUCT_SHELF_CATEGORIES.flatMap(category =>
  category.items.map(item => ({
    item,
    category,
    haystack: [item.productName, item.title, item.body, category.title]
      .join(' ')
      .toLowerCase(),
  })),
);
export default function ProductsScreen(host: CzechNativeScreenProps) {
  const [view, setView] = useState<ViewKind>(() =>
    viewKind(host.route.params?.view),
  );
  const [categoryId, setCategoryId] = useState<ProductShelfCategoryId>(
    () =>
      getProductShelfCategory(
        host.route.params?.categoryId as ProductShelfCategoryId,
      ).id,
  );
  const [query, setQuery] = useState('');
  const [offerCategory, setOfferCategory] = useState<
    'popular' | ShopSmartOfferCategory
  >('popular');
  const config = getProductsMenuForCountry('CZ');
  const category = getProductShelfCategory(categoryId);
  useEffect(() => {
    setView(viewKind(host.route.params?.view));
    if (host.route.params?.categoryId)
      setCategoryId(
        getProductShelfCategory(
          host.route.params.categoryId as ProductShelfCategoryId,
        ).id,
      );
    setQuery('');
  }, [host.route.params?.view, host.route.params?.categoryId]);
  useEffect(() => {
    if (host.isActive === false) return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      if (view === 'shelf') return false;
      setView('shelf');
      setQuery('');
      return true;
    });
    return () => listener.remove();
  }, [host.isActive, view]);
  const back = () => {
    if (view === 'shelf') host.onBack();
    else {
      setView('shelf');
      setQuery('');
    }
  };
  const open = (item: ProductShelfItem) =>
    host.onNavigate({ screen: 'product-detail', params: { itemId: item.id } });
  const itemCard = (item: ProductShelfItem, list = false) => (
    <Pressable
      key={item.id}
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.productName}`}
      onPress={() => open(item)}
      style={[s.card, list ? sourceStyles.width100 : sourceStyles.width240]}
    >
      <SourcePhoto
        asset={item.image}
        position={item.imagePosition}
        height={list ? 140 : 100}
      />
      <View style={s.cardCopy}>
        <Text style={[t.body, t.strong, sourceStyles.fontSize17lineHeight21]}>
          {item.productName}
        </Text>
        <Text style={[t.body, t.muted]}>{item.title}</Text>
      </View>
    </Pressable>
  );
  if (view === 'prime') return <Prime {...host} onBack={back} />;
  const offersView = view === 'shopsmart' || view === 'partner-offers';
  const filtered = searchable.filter(entry =>
    entry.haystack.includes(query.trim().toLowerCase()),
  );
  const offers = config.shopSmartOfferCards.filter(
    offer =>
      (offerCategory === 'popular' ||
        offer.categories.includes(offerCategory)) &&
      [offer.merchant, offer.title, offer.statusText]
        .join(' ')
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const title =
    view === 'search'
      ? 'Search products'
      : view === 'category'
      ? category.title
      : view === 'shopsmart'
      ? 'ShopSmart'
      : view === 'partner-offers'
      ? 'Partner offers'
      : 'Offers';
  return (
    <View style={[s.root, { paddingTop: host.screenTopInset ?? 0 }]}>
      <Header
        tokens={tokens}
        variant="current"
        title={title}
        onBack={back}
        backIcon={<Glyph name="back" size={16} />}
        trailing={
          view === 'shelf' ? (
            <IconAction
              label="Search products"
              name="search"
              onPress={() => {
                setQuery('');
                setView('search');
              }}
            />
          ) : (
            <IconAction
              label="Profile"
              name="profile"
              onPress={host.onProfile}
            />
          )
        }
      />
      {(view === 'search' || offersView) && (
        <View style={s.search}>
          <SearchField
            tokens={tokens}
            label={view === 'search' ? 'Search products' : 'Search offers'}
            placeholder={
              view === 'search' ? 'Search products' : 'Search offers'
            }
            value={query}
            onChange={setQuery}
            onSubmit={() => {}}
            onClear={() => setQuery('')}
            icon={<Glyph name="search" />}
            autoFocus={view === 'search'}
          />
        </View>
      )}
      <ScrollView
        key={view + categoryId}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        {view === 'shelf' ? (
          <>
            <View>
              <Text style={t.title}>Save when you shop</Text>
              <View style={s.partners}>
                {PRODUCT_SHELF_ENTRY_CARDS.map(entry => (
                  <Pressable
                    key={entry.id}
                    accessibilityRole="button"
                    accessibilityLabel={entry.title.replace(/\n/g, ' ')}
                    onPress={() => {
                      setView(entry.id);
                      setQuery('');
                    }}
                    style={s.partner}
                  >
                    <SourcePhoto
                      asset={entry.image}
                      position={entry.imagePosition}
                      height={152}
                    />
                    <View style={s.partnerShade}>
                      <Text
                        style={[
                          t.body,
                          t.strong,
                          sourceStyles.colorfffffffontSize22lineHeight24,
                        ]}
                      >
                        {entry.title}
                      </Text>
                      <Text style={[t.body, sourceStyles.colorffffff]}>
                        {config.shopSmartOfferCards.length} offers
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
            {PRODUCT_SHELF_CATEGORIES.map(itemCategory => (
              <View key={itemCategory.id}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${itemCategory.title}, ${itemCategory.items.length} products`}
                  onPress={() => {
                    setCategoryId(itemCategory.id);
                    setView('category');
                  }}
                  style={s.categoryHeading}
                >
                  <Text style={[t.title, sourceStyles.flex1]}>
                    {itemCategory.title}
                  </Text>
                  <Glyph name="forward" size={20} />
                </Pressable>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={252}
                  decelerationRate="fast"
                  contentContainerStyle={s.rail}
                >
                  {itemCategory.items.map(item => itemCard(item))}
                </ScrollView>
                <Text
                  accessibilityLabel={`${itemCategory.items.length} products`}
                  style={s.dots}
                >
                  {itemCategory.items.map(() => '•').join('  ')}
                </Text>
              </View>
            ))}
          </>
        ) : view === 'category' ? (
          <>
            <Text style={[t.body, t.muted]}>
              {category.items.length} products
            </Text>
            {category.items.map(item => itemCard(item, true))}
          </>
        ) : view === 'search' ? (
          <>
            {filtered.map(entry => (
              <View key={entry.item.id}>
                <Text style={[t.body, t.muted, sourceStyles.paddingBottom6]}>
                  {entry.category.title}
                </Text>
                {itemCard(entry.item, true)}
              </View>
            ))}
            {filtered.length === 0 && (
              <Text style={[t.body, t.muted]}>No products found</Text>
            )}
          </>
        ) : (
          <>
            {view === 'shopsmart' && (
              <View style={s.offerSummary}>
                <Text style={[t.body, t.strong]}>
                  ACTIVATED OFFERS:{config.shopSmartSummary.activatedOffers}
                </Text>
                <Text
                  style={[
                    t.body,
                    t.strong,
                    sourceStyles.fontSize18lineHeight24,
                  ]}
                >
                  {config.shopSmartSummary.totalSavedLabel}
                </Text>
                <Text style={[t.body, sourceStyles.fontSize16lineHeight20]}>
                  {config.shopSmartSummary.totalSavedAmount}
                </Text>
              </View>
            )}
            <Tabs
              tokens={tokens}
              variant="current"
              label="Offer categories"
              value={offerCategory}
              onChange={setOfferCategory}
              items={[
                { value: 'popular', label: 'Popular' },
                { value: 'eshops', label: 'E-shops' },
                { value: 'electronics', label: 'Electronics' },
                { value: 'travel', label: 'Travel' },
                { value: 'home', label: 'Home & living' },
              ]}
            />
            {offers.map(offer => (
              <View key={offer.id} style={s.offer}>
                <SourcePhoto asset={offer.imageSrc} height={130} />
                <View style={s.cardCopy}>
                  <Text style={[t.body, t.strong]}>{offer.merchant}</Text>
                  <Text style={[t.title, sourceStyles.fontSize22lineHeight26]}>
                    {offer.title}
                  </Text>
                  {offer.pillLabel && (
                    <Text style={[t.body, t.strong, { color: tokens.accent }]}>
                      {offer.pillLabel}
                    </Text>
                  )}
                  <Text style={[t.body, t.muted]}>{offer.statusText}</Text>
                  {offer.distance && (
                    <Text style={[t.body, t.muted]}>{offer.distance}</Text>
                  )}
                </View>
              </View>
            ))}
            {offers.length === 0 && (
              <Text style={[t.body, t.muted]}>No offers found</Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.background },
  search: { paddingHorizontal: 16, paddingTop: 2, paddingBottom: 10 },
  content: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 24,
    gap: 28,
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.border,
    backgroundColor: tokens.surface,
    overflow: 'hidden',
  },
  cardCopy: { padding: 12, gap: 4, minHeight: 66 },
  categoryHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 32,
  },
  rail: { gap: 12, paddingTop: 12 },
  dots: {
    fontSize: 18,
    color: tokens.accent,
    textAlign: 'center',
    paddingTop: 6,
  },
  partners: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  partner: {
    flex: 1,
    minWidth: 140,
    maxWidth: 280,
    borderRadius: 8,
    overflow: 'hidden',
  },
  partnerShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    paddingTop: 24,
    gap: 4,
    backgroundColor: '#00000066',
  },
  offer: {
    borderRadius: 8,
    backgroundColor: tokens.surface,
    borderColor: '#666666',
    borderWidth: 1,
    overflow: 'hidden',
  },
  offerSummary: {
    padding: 16,
    gap: 4,
    backgroundColor: tokens.surface,
    borderRadius: 8,
  },
});

const sourceStyles = StyleSheet.create({
  width100: { width: '100%' },
  width240: { width: 240 },
  fontSize17lineHeight21: { fontSize: 17, lineHeight: 21 },
  colorfffffffontSize22lineHeight24: {
    color: '#ffffff',
    fontSize: 22,
    lineHeight: 24,
  },
  colorffffff: { color: '#ffffff' },
  flex1: { flex: 1 },
  paddingBottom6: { paddingBottom: 6 },
  fontSize18lineHeight24: { fontSize: 18, lineHeight: 24 },
  fontSize16lineHeight20: { fontSize: 16, lineHeight: 20 },
  fontSize22lineHeight26: { fontSize: 22, lineHeight: 26 },
});
