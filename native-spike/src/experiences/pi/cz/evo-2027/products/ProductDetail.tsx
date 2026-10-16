import React from 'react';
import { StyleSheet, View } from 'react-native';
import { buildShelfProductSelection } from '@/app/config/productsShelfConfig';
import type { NativeProductDetailPresentation } from '@/features/demo-native/productDetailPresentation';
import type { CurrentScreenProps } from '../../../current/contracts';
import NativeBaselineProductDetail from '../../../current/baseline/offers/Detail';
import {
  createCurrentTranslator,
  currentTokens,
} from '../../../current/context';
import { Header } from '../../../../../universal/controls';
import { Text } from '../../../../../universal/Typography';
import type { CzechNativeScreenProps } from '../contracts';
import { evoTokens as tokens } from '../home/tokens';
import { Glyph, textStyles as t } from '../home/Primitives';

function presentationFromShelf(
  itemId: string,
): NativeProductDetailPresentation | undefined {
  const selection = buildShelfProductSelection(itemId);
  if (!selection) return undefined;
  return {
    title: selection.title,
    cardId: selection.cardId,
    optionId: selection.optionId,
    heroImage: selection.heroImage,
    heroImagePosition: selection.heroImagePosition,
    headline: selection.headline,
    intro: selection.intro,
    includeSafeArea: true,
  };
}

function currentHost(
  host: CzechNativeScreenProps,
  presentation: NativeProductDetailPresentation,
): CurrentScreenProps {
  const language = host.language ?? 'en';
  const includeSafeArea = presentation.includeSafeArea ?? true;
  return {
    bankingScenario: host.bankingScenario,
    country: 'CZ',
    release: 'release-future-evo-2027',
    scenario: host.scenario,
    language,
    productCounts: host.productCounts,
    route: {
      screen: 'product-detail',
      params: {
        title: presentation.title,
        ...(presentation.cardId ? { cardId: presentation.cardId } : {}),
        ...(presentation.optionId ? { optionId: presentation.optionId } : {}),
      },
    },
    tokens: currentTokens(host.mode === 'dark'),
    t: createCurrentTranslator('CZ', language),
    amountsHidden: host.amountsHidden,
    screenTopInset: includeSafeArea ? host.screenTopInset ?? 0 : 0,
    isActive: host.isActive ?? true,
    onNavigate: () => undefined,
    onBack: host.onBack,
    onProfile: host.onProfile,
    onSearch: host.onSearch,
    onAmountsToggle: host.onAmountsToggle,
    onChanged: host.onChanged,
    onLanguageChange: next => {
      if (next === 'en' || next === 'cs') host.onLanguageChange?.(next);
    },
    mode: host.mode ?? 'light',
    onModeChange: next => host.onModeChange?.(next),
    onPrimaryNavigationChange: host.onPrimaryNavigationChange,
    onBackHandlerChange: host.onBackHandlerChange,
    productDetailPresentation: presentation,
    onProductDetailAction: host.onProductDetailAction,
  };
}

/** CZ Evo reuses the same Native current product detail and Source-matched demo Face ID flow. */
export default function ProductDetail(host: CzechNativeScreenProps) {
  const itemId = host.route.params?.itemId ?? '';
  const shelfPresentation = presentationFromShelf(itemId);
  const presentation = host.productDetailPresentation ?? shelfPresentation;
  const unavailableStyles = StyleSheet.create({
    root: { flex: 1, paddingTop: host.screenTopInset ?? 0 },
    content: { padding: 24 },
  });

  if (!presentation) {
    return (
      <View style={unavailableStyles.root}>
        <Header
          tokens={tokens}
          title="Product unavailable"
          onBack={host.onBack}
          backIcon={<Glyph name="back" size={16} />}
        />
        <Text style={[t.body, unavailableStyles.content]}>
          The selected product is not in this catalogue.
        </Text>
      </View>
    );
  }

  const withShelfFallbacks: NativeProductDetailPresentation = {
    ...(shelfPresentation ?? {}),
    ...presentation,
  };
  return (
    <NativeBaselineProductDetail {...currentHost(host, withShelfFallbacks)} />
  );
}
