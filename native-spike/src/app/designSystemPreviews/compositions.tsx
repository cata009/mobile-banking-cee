import React, { useState } from 'react';
import { View } from 'react-native';
import {
  CATALOG_COMPOSITION_PREVIEW_VARIANTS,
  CATALOG_COMPOSITION_SOURCES,
  CATALOG_PFM_SOURCE_SCENES,
  CATALOG_PFM_PLOT_MARK_IDS,
  CATALOG_PFM_DATA_LIMITATION,
  CATALOG_INVESTMENT_SOURCE_ROWS,
} from '@/app/components/contracts/catalogCompositions';
import {
  BaselineCompanySelection,
  BaselineCanonicalPaymentHero,
  BaselineCanonicalInvestmentActions,
  BaselineCanonicalCampaign,
  BaselineTimelineAtom,
  BaselinePrimeAdvisory,
  BaselineCardType14,
  BaselineCanonicalSticky,
  BaselineSourcePfmGraph,
  BaselineCanonicalInvestmentRow,
} from '../../universal/BaselineCatalogCompositions';
import { Text } from '../../universal/Typography';
import { mobileFirstTokens } from '../../universal/tokens';
import { monotoneChartPath } from '../../experiences/pi/cz/evo-2027/investments/chartGeometry';
import type { DesignSystemPreviewProps } from './core';

export function CatalogCompositionsDesignSystemPreview(
  props: DesignSystemPreviewProps,
) {
  return (
    <CompositionSample
      key={`${props.componentId}:${props.variantId ?? ''}`}
      {...props}
    />
  );
}
function CompositionSample({
  componentId,
  variantId,
}: DesignSystemPreviewProps) {
  const allowed = CATALOG_COMPOSITION_PREVIEW_VARIANTS[componentId] ?? [];
  const selected = allowed.includes(variantId ?? '') ? variantId! : allowed[0];
  const [company, setCompany] = useState('Example Company SRL');
  const [notice, setNotice] = useState('');
  const [closed, setClosed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState('TBSZ 2020 EP - 00000000000');
  const [point, setPoint] = useState<string>();
  const source = CATALOG_COMPOSITION_SOURCES.find(
    s => s.variantId === selected,
  );
  if (!source) return null;
  let sample: React.ReactNode = null;
  const act = () => setNotice('Example action selected');
  if (componentId === 'products.company-selection')
    sample = (
      <BaselineCompanySelection
        variantId={selected}
        value={company}
        onEdit={() => {
          setCompany(
            company === 'Example Company SRL'
              ? 'Example Trading SRL'
              : 'Example Company SRL',
          );
          setNotice('Company changed in this controlled specimen');
        }}
      />
    );
  else if (componentId === 'payments.card-payment')
    sample = (
      <BaselineCanonicalPaymentHero
        variantId={selected}
        title={
          source.name.includes('Title 2') ? 'Make a\npayment' : 'Make a payment'
        }
        description="Transfer money to a saved beneficiary"
        onPress={act}
      />
    );
  else if (componentId === 'investments.source-action-bar')
    sample = (
      <BaselineCanonicalInvestmentActions
        labels={['Documents', 'More Details', 'Ex-Ante cost', 'Investments']}
        onAction={i => setNotice(`Action ${i + 1} selected`)}
      />
    );
  else if (
    componentId === 'marketing.source-campaign' ||
    componentId === 'investments.source-campaign'
  )
    sample = (
      <BaselineCanonicalCampaign
        variantId={selected}
        title="Explore your financial options"
        description="Review the products and services available to you."
        caption="Find out more"
        onPress={act}
      />
    );
  else if (componentId === 'ui.timeline-atom')
    sample = <BaselineTimelineAtom variantId={selected} day="20" month="OCT" />;
  else if (componentId === 'brand.prime-advisory')
    sample = <BaselinePrimeAdvisory variantId={selected} onPress={act} />;
  else if (componentId === 'images.card-type14')
    sample = <BaselineCardType14 label="Original Type14 card artwork" />;
  else if (componentId === 'marketing.source-sticky')
    sample = closed ? (
      <Text style={{ fontFamily: mobileFirstTokens.font }}>
        Banner dismissed
      </Text>
    ) : (
      <BaselineCanonicalSticky
        message="Review the spending limits configured for your account."
        onClose={() => {
          setClosed(true);
          setNotice('Banner dismissed');
        }}
      />
    );
  else if (componentId === 'pfm.source-graph') {
    const scene = CATALOG_PFM_SOURCE_SCENES.find(s => s.variantId === selected);
    if (scene) {
      const mark = scene.marks.find(m => m.id === point);
      const y = mark ? mark.transform[5] + mark.h / 2 : 0;
      const selectionPath = mark
        ? monotoneChartPath([
            { x: 0, y },
            { x: scene.width, y },
          ])
        : undefined;
      sample = (
        <View style={{ gap: 12 }}>
          <BaselineSourcePfmGraph
            scene={scene}
            interactiveMarks={(
              CATALOG_PFM_PLOT_MARK_IDS[scene.variantId] ?? []
            ).map((id, i) => ({
              id,
              label:
                scene.variantId === '715:8125'
                  ? ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL'][i]
                  : `Select series ${i + 1}`,
            }))}
            selectedId={point}
            onSelect={id => {
              setPoint(id);
              setNotice(`Selected original drawing element ${id}`);
            }}
            selectionPath={selectionPath}
          />
          <Text
            style={{
              fontFamily: mobileFirstTokens.font,
              fontSize: 12,
              color: mobileFirstTokens.muted,
            }}
          >
            {CATALOG_PFM_DATA_LIMITATION}
          </Text>
        </View>
      );
    }
  } else if (componentId === 'investments.source-list') {
    const row = CATALOG_INVESTMENT_SOURCE_ROWS.find(
      r => r.variantId === selected,
    );
    const values: Record<string, string> = {
      accessibilityLabel: 'Investment details',
    };
    row?.texts.forEach(t => {
      if (/lorem|^TITLE$|^LABLE/i.test(t.value))
        values[t.id] = t.name.toLowerCase().includes('desc')
          ? 'Review investment details'
          : 'Investment product';
    });
    sample = (
      <BaselineCanonicalInvestmentRow
        variantId={selected}
        values={values}
        inputValue={input}
        onValueChange={setInput}
        expanded={expanded}
        onPress={() => {
          setExpanded(!expanded);
          act();
        }}
      >
        <Text style={{ fontFamily: mobileFirstTokens.font, padding: 16 }}>
          Controlled investment details
        </Text>
      </BaselineCanonicalInvestmentRow>
    );
  }
  return (
    <View style={{ gap: 16, maxWidth: '100%' }}>
      {sample}
      {source.presentationLimitations?.map(limit => (
        <Text
          key={limit}
          style={{
            fontFamily: mobileFirstTokens.font,
            fontSize: 12,
            color: mobileFirstTokens.muted,
          }}
        >
          {limit}
        </Text>
      ))}
      {notice ? (
        <Text
          accessibilityLiveRegion="polite"
          style={{
            fontFamily: mobileFirstTokens.font,
            fontSize: 12,
            color: mobileFirstTokens.muted,
          }}
        >
          {notice}
        </Text>
      ) : null}
    </View>
  );
}
