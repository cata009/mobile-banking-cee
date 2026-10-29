import React, { useEffect, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  getProductsMenuForCountry,
  type ProductsCard,
  type ProductsMenuTab,
} from '@/app/config/productsMenuConfig';
import type { CurrentScreenProps } from '../../contracts';
import { BaselineL1Header } from '../../../../../universal/BaselineL1Header';
import {
  BaselineHeaderActionButton,
  BaselineHeaderActionRail,
} from '../../../../../universal/BaselineHeaderActions';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';
import { localized, localizeProductCard, RoOffersCatalog } from './Catalog';
import ShopSmart from './ShopSmart';
import ProductSheet from './ProductSheet';
import { useDuoPreview } from '../../../../../universal/DuoPreview';

export function BaselineProductsHeader({
  host,
  title,
  actionLayout = 'default',
  gutter,
  onAction,
}: {
  host: CurrentScreenProps;
  title: string;
  actionLayout?: 'default' | 'search';
  gutter?: number;
  onAction?: (action: 'contacts' | 'messages' | 'search') => void;
}) {
  const usesBosniaHeaderActions =
    host.country === 'BA' || host.country === 'BA_BL';
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  return (
    <BaselineL1Header
      variant="products"
      backgroundColor={sourceColor('var(--uc-surface)', dark)}
      title={title}
      dark={dark}
      gutter={gutter}
      actions={
        <BaselineHeaderActionRail>
          {actionLayout === 'search' ? (
            <BaselineHeaderActionButton
              icon="search"
              label={localized(host, 'runtime.actions.search', 'Search')}
              onPress={() => onAction?.('search')}
              dark={dark}
            />
          ) : (
            <>
              {usesBosniaHeaderActions ? (
                <BaselineHeaderActionButton
                  icon="contact-phone"
                  label="Contact phone"
                  onPress={() =>
                    onAction
                      ? onAction('contacts')
                      : host.onNavigate({ screen: 'contacts' })
                  }
                  dark={dark}
                />
              ) : (
                <BaselineHeaderActionButton
                  icon="profile"
                  label={localized(host, 'runtime.actions.profile', 'Profile')}
                  dark={dark}
                />
              )}
              <BaselineHeaderActionButton
                icon="messages"
                label={localized(host, 'runtime.actions.messages', 'Messages')}
                onPress={() =>
                  onAction
                    ? onAction('messages')
                    : host.onNavigate({ screen: 'messages' })
                }
                dark={dark}
              />
              {!usesBosniaHeaderActions && (
                <BaselineHeaderActionButton
                  icon="help"
                  label={localized(host, 'runtime.actions.help', 'Help')}
                  dark={dark}
                />
              )}
            </>
          )}
        </BaselineHeaderActionRail>
      }
    />
  );
}

export function BaselineProductsTabs({
  host,
  activeTab,
  bankingLabel,
  shopSmartLabel,
  onChange,
}: {
  host: CurrentScreenProps;
  activeTab: ProductsMenuTab;
  bankingLabel: string;
  shopSmartLabel: string;
  onChange: (tab: ProductsMenuTab) => void;
}) {
  const duo = useDuoPreview();
  return (
    <View style={[s.tabs, duo ? { marginHorizontal: 24 } : undefined]}>
      {[
        { id: 'banking' as const, label: bankingLabel },
        { id: 'shopsmart' as const, label: shopSmartLabel },
      ].map(item => (
        <Pressable
          key={item.id}
          accessibilityRole="tab"
          accessibilityLabel={item.label}
          accessibilityState={{ selected: item.id === activeTab }}
          onPress={() => onChange(item.id)}
          style={[
            s.tab,
            item.id === activeTab ? s.tabSelected : s.tabInactive,
            {
              borderBottomColor:
                item.id === activeTab ? host.tokens.text : host.tokens.muted,
            },
          ]}
        >
          <Text
            style={[
              s.tabLabel,
              {
                color:
                  item.id === activeTab ? host.tokens.text : host.tokens.muted,
              },
            ]}
          >
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function Products(host: CurrentScreenProps) {
  const duo = useDuoPreview();
  const config = getProductsMenuForCountry(host.country);
  const [tab, setTab] = useState<ProductsMenuTab>('banking');
  const [selected, setSelected] = useState<ProductsCard | null>(null);
  const completedFocusRequest = useRef<number | undefined>(undefined);
  const focusRequest = host.productsShelfFocusRequest;
  const focus = focusRequest?.cardId ?? host.route.params?.focus;
  const routeFocusRequestId = Number(host.route.params?.focusRequestId);
  const focusRequestId =
    focusRequest?.requestId ??
    (Number.isSafeInteger(routeFocusRequestId)
      ? routeFocusRequestId
      : undefined);
  const onFocusHandled = host.onProductsShelfFocusHandled;
  const t = host.t;
  useEffect(() => {
    if (!focus) return;
    setTab('banking');
    const card = config.products.find(item => item.id === focus);
    setSelected(card ? localizeProductCard({ t }, card) : null);
  }, [focus, config.products, t]);
  useEffect(() => {
    if (
      focusRequestId === undefined ||
      !onFocusHandled ||
      completedFocusRequest.current === focusRequestId
    )
      return;
    completedFocusRequest.current = focusRequestId;
    onFocusHandled();
  }, [focusRequestId, onFocusHandled]);
  useEffect(() => {
    const registerBack = host.onBackHandlerChange;
    registerBack?.(() => {
      if (!selected) return false;
      setSelected(null);
      return true;
    });
    return () => registerBack?.(null);
  }, [host.onBackHandlerChange, selected]);
  return (
    <View
      style={[
        s.root,
        {
          backgroundColor: sourceColor(
            'var(--uc-surface)',
            host.tokens.background === '#121212',
          ),
        },
      ]}
    >
      <View
        testID="ro-offers-top-reserve"
        style={[
          s.topReserve,
          duo ? { height: host.screenTopInset } : undefined,
        ]}
      />
      <BaselineProductsHeader
        host={host}
        title={localized(host, 'runtime.productsMenu.title', config.title)}
      />
      {config.hasShopSmartTab && (
        <BaselineProductsTabs
          host={host}
          activeTab={tab}
          bankingLabel={localized(
            host,
            'runtime.productsMenu.banking',
            config.bankingTabLabel,
          )}
          shopSmartLabel={localized(
            host,
            'runtime.productsMenu.shopSmart',
            config.shopSmartTabLabel,
          )}
          onChange={setTab}
        />
      )}
      <ScrollView
        testID="ro-offers-content"
        style={[s.body, Platform.OS === 'web' && s.webScroll]}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {tab === 'banking' ? (
          <RoOffersCatalog host={host} onProductCardPress={setSelected} />
        ) : (
          <ShopSmart host={host} />
        )}
      </ScrollView>
      {selected && (
        <ProductSheet
          host={host}
          card={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  topReserve: { height: 54 },
  tabs: { height: 48, flexDirection: 'row' },
  tab: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabSelected: { borderBottomWidth: 3 },
  tabInactive: { borderBottomWidth: 1 },
  tabLabel: { fontFamily: 'UniCredit-bold', fontSize: 20, lineHeight: 24 },
  body: { flex: 1 },
  webScroll: { transform: 'none' },
  content: { paddingBottom: 92 },
});
