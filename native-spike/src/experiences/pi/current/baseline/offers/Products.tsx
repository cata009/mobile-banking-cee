import React, { useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
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
import { BaselineMailboxTabs } from '../../../../../universal/BaselineMailboxTabs';
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
                  onPress={host.onProfile}
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
  // The canonical Design System tabs: 18 px labels, the same as every other two-item tab strip.
  return (
    <View style={duo ? s.duoTabs : undefined}>
      <BaselineMailboxTabs
        ariaLabel="Offers tabs"
        withTopMargin={false}
        tabs={[
          { id: 'banking', label: bankingLabel },
          { id: 'shopsmart', label: shopSmartLabel },
        ]}
        activeTabId={activeTab}
        onChange={id => onChange(id as ProductsMenuTab)}
        dark={host.tokens.text.toLowerCase() !== '#262626'}
      />
    </View>
  );
}

export default function Products(host: CurrentScreenProps) {
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
    if (host.route.params?.view === 'shopsmart' && config.hasShopSmartTab)
      setTab('shopsmart');
  }, [host.route.params?.view, config.hasShopSmartTab]);
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
        style={[s.topReserve, { height: Math.max(54, host.screenTopInset) }]}
      />
      <BaselineProductsHeader
        host={host}
        title={localized(host, 'runtime.productsMenu.title', config.title)}
      />
      <ScrollView
        testID="ro-offers-content"
        style={[s.body, Platform.OS === 'web' && s.webScroll]}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
  duoTabs: { marginHorizontal: 24 },
  body: { flex: 1 },
  webScroll: { transform: 'none' },
  content: { paddingBottom: 92 },
});
