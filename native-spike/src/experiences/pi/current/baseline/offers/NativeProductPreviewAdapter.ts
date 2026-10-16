import React from 'react';
import type { CurrentAdapter, CurrentScreenProps } from '../../contracts';
import type {
  NativeProductsPreview,
  NativeProductsPreviewAction,
} from '@/features/demo-native/productsPreviewContracts';
import { BaselineProductsHeader, BaselineProductsTabs } from './Products';
import { RoOffersCatalog } from './Catalog';
import ShopSmart from './ShopSmart';

type ProductsPreviewHost = CurrentScreenProps & {
  productsPreview?: NativeProductsPreview;
  onProductsPreviewAction?: (action: NativeProductsPreviewAction) => void;
};

export function NativeProductsPreviewScreen(host: CurrentScreenProps) {
  const previewHost = host as ProductsPreviewHost;
  const preview = previewHost.productsPreview;
  if (!preview) return null;

  const emit = (action: NativeProductsPreviewAction) =>
    previewHost.onProductsPreviewAction?.(action);

  switch (preview.region) {
    case 'products-header':
      return React.createElement(BaselineProductsHeader, {
        host,
        title: preview.title,
        actionLayout: preview.actionLayout,
        gutter: preview.gutter,
        onAction: action => emit({ type: 'header-action', action }),
      });
    case 'products-tabs':
      return React.createElement(BaselineProductsTabs, {
        host,
        activeTab: preview.activeTab,
        bankingLabel: preview.bankingLabel,
        shopSmartLabel: preview.shopSmartLabel,
        onChange: tab => emit({ type: 'tab-change', tab }),
      });
    case 'products-banking':
      return React.createElement(RoOffersCatalog, {
        host,
        preview,
        onProductCardPress: card =>
          emit({ type: 'product-card-open', cardId: card.id }),
        onPreviewAction: emit,
      });
    case 'products-shopsmart':
      return React.createElement(ShopSmart, {
        host,
        preview,
        onPreviewAction: emit,
      });
  }
}

/** Template-only adapter: the normal 40-context products route stays on its existing adapter. */
export const NATIVE_PRODUCTS_PREVIEW_ADAPTER: CurrentAdapter = {
  id: 'pi-current-products-preview-regions',
  screens: { products: NativeProductsPreviewScreen },
};
