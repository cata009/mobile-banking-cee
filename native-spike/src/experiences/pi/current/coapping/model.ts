import { currentFeature, createCurrentProducts } from '../context';
import type {
  CurrentContext,
  CurrentRoute,
  CurrentScreenProps,
} from '../contracts';
import type { InvestmentCatalogSecurity } from '@/app/config/investmentsPortfolioConfig';
import { ROUTE_POLICY } from '@/app/navigation/routePolicy';
import type { Screen } from '@/app/navigation/screenTypes';
import { buildCzChatSmartReplyResolver } from './sourceResolver';
import type { CoAppingChatAction } from '../../../../../../package/mobile-pi-coapping-chat-package/src/types';
import {
  isCreditCardProduct,
  getProductsShelfFocusCardId,
  getCzSavingsProductDetailSelection,
} from '@/app/chat/cz/helpers';
const sourceScreenByNativeScreen: Partial<
  Record<CurrentRoute['screen'], Screen>
> = {
  home: 'homepage',
  account: 'account-detail',
  'account-info': 'account-details-info',
  card: 'card-detail',
  'card-info': 'card-details-info',
  pfm: 'analytics',
  profile: 'more',
  support: 'prime',
  login: 'prelogin-active',
  prelogin: 'prelogin-inactive',
  coapping: 'co-apping-session',
};

export function sourceScreenForNative(screen: CurrentRoute['screen']): Screen {
  return sourceScreenByNativeScreen[screen] ?? (screen as Screen);
}

export function assistantAvailable(
  context: CurrentContext & { route?: CurrentRoute },
) {
  return (
    context.country === 'CZ' &&
    currentFeature(context, 'fx_czCoAppingSmartAssistant') &&
    Boolean(
      context.route &&
        ROUTE_POLICY[sourceScreenForNative(context.route.screen)]?.surface ===
          'app',
    )
  );
}
export function createNativeCzResolver(
  context: CurrentContext & {
    route?: CurrentRoute;
    selectedInvestmentSecurity?: InvestmentCatalogSecurity | null;
  },
) {
  const products = createCurrentProducts(context);
  const all = products.categories.flatMap(category => category.products);
  return buildCzChatSmartReplyResolver({
    country: context.country,
    categories: products.categories,
    selectedAccountProduct:
      all.find(
        item =>
          item.id ===
          (context.route?.params?.accountId ??
            context.route?.params?.productId),
      ) ??
      all.find(item => item.type === 'current_account') ??
      null,
    selectedCardProduct:
      all.find(item => item.id === context.route?.params?.cardId) ??
      all.find(item => item.type === 'debit_card') ??
      null,
    creditCardForOpportunity: all.find(isCreditCardProduct) ?? null,
    selectedInvestmentSecurity: context.selectedInvestmentSecurity ?? null,
  });
}
export function actionRoute(
  action: CoAppingChatAction,
  host: CurrentScreenProps,
): CurrentRoute | null {
  const products = createCurrentProducts(host).categories.flatMap(
    category => category.products,
  );
  const account = products.find(item => item.type === 'current_account');
  const card = products.find(isCreditCardProduct);
  switch (action.target) {
    case 'analytics':
      return { screen: 'pfm' };
    case 'prime':
      return { screen: 'prime' };
    case 'account-detail':
      return {
        screen: 'account',
        params: account
          ? { productId: account.id, accountId: account.id }
          : undefined,
      };
    case 'card-detail':
      return {
        screen: 'card',
        params: card ? { productId: card.id, cardId: card.id } : undefined,
      };
    case 'credit-limit-review':
      return card
        ? {
            screen: 'card',
            params: {
              productId: card.id,
              cardId: card.id,
              view: 'credit-limit',
            },
          }
        : null;
    case 'product-detail': {
      const selection = getCzSavingsProductDetailSelection(
        action.id,
        host.country,
      );
      return selection
        ? {
            screen: 'product-detail',
            params: {
              cardId: selection.cardId,
              optionId: selection.optionId ?? '',
              title: selection.title,
            },
          }
        : null;
    }
    case 'products': {
      const focus = getProductsShelfFocusCardId(action.id);
      return { screen: 'products', params: focus ? { focus } : undefined };
    }
    case 'investment-buy':
      return {
        screen: 'investments',
        params: {
          view: 'buy',
          securityId: action.securityId ?? '',
          ...(action.investmentBuyDraft
            ? {
                quantity: String(action.investmentBuyDraft.quantity),
                accountId: action.investmentBuyDraft.accountId,
                frequency: action.investmentBuyDraft.frequency,
                executionTiming: action.investmentBuyDraft.executionTiming,
              }
            : {}),
        },
      };
    case 'investment-funds':
      return {
        screen: 'investments',
        params: { collection: action.investmentFundCollectionId ?? 'featured' },
      };
    case 'investments-history':
      return { screen: 'investments', params: { view: 'history' } };
    case 'investments':
    case 'payments':
    case 'documents':
    case 'messages':
    case 'settings':
    case 'contacts':
      return { screen: action.target };
    default:
      return null;
  }
}

/** Forward controlled chat actions without reducing their canonical Source payload. */
export function dispatchCzChatAction(
  action: CoAppingChatAction,
  host: CurrentScreenProps,
): boolean {
  if (action.type !== 'navigate') return false;
  if (host.onCoAppingChatAction) {
    host.onCoAppingChatAction(action);
    return true;
  }
  const route = actionRoute(action, host);
  if (!route) return false;
  host.onNavigate(route);
  return true;
}
