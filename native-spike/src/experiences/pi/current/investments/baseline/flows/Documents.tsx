import React, { useState, useContext } from 'react';
import type { CurrentScreenProps } from '../../../contracts';
import { investmentColor } from '../Frame';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { InvestmentCatalogSecurity } from '@/app/config/investmentsPortfolioConfig';
import { SourceCustomIcon } from '../../../../../../universal/SourceCustomIcon';
import {
  DocumentCopy as BaseCopy,
  InvestmentDocumentHost,
} from './ExAnteDisclosure';
import { BaselineInvestmentExAnteDisclosure } from './ExAnteDisclosure';
function Copy(props: React.ComponentProps<typeof BaseCopy>) {
  return <BaseCopy {...props} style={[s.copy, props.style]} />;
}
const sections = [
  {
    id: 'ex-ante',
    icon: 'investment-ex-ante',
    title: 'Ex-Ante cost information',
    subtitle: 'Estimated costs for this order',
  },
  {
    id: 'documents',
    icon: 'investment-documents',
    title: 'Product documents',
    subtitle: 'Key information and fund documents',
  },
  {
    id: 'important-information',
    icon: 'investment-important-info',
    title: 'Important information',
    subtitle: 'Suitability and appropriateness check',
  },
  {
    id: 'disclaimer',
    icon: 'investment-disclaimer',
    title: 'Investment disclaimer',
    subtitle: 'General investment risk information',
  },
] as const;
export type BaselineInvestmentDocumentSectionId = (typeof sections)[number]['id'];
const documents = [
  [
    'Key Information Document (KID)',
    'Standardised risks, costs and performance profile',
  ],
  ['Prospectus', 'Official fund objectives, terms and conditions'],
  ['Investment Advisory Report', 'Personalised recommendation and rationale'],
] as const;
const evaluations = [
  [
    'Suitability',
    'Product is suitable',
    'The Bank hereby informs the client, that the financial instrument that is subject matter of the order is suitable for him.',
  ],
  [
    'Appropriateness Evaluation',
    'Product is appropriate',
    'The bank hereby informs the client, that the financial instrument concerned resp, the providing of such investment service is appropriate for him',
  ],
  [
    'Target Market',
    "Product is in the client's Target Market",
    'The Bank has determined a target market for the financial instrument that is subject matter of the order, and, has determined the financial instrument compatibility with the needs, characteristics and goals of its clients. Following to an assessment of information provided by you the Bank hereby informs that the financial instrument that is the subject matter of the order has been assessed as compatible with your needs, characteristics and goals and, as such, it matches your needs, characteristics and goals.',
  ],
] as const;

/** Literal presentation fixtures; evaluations/costs are illustrative, never computed advice. */
function OrderDocuments({
  currency,
  initialOpenSection = null,
}: {
  currency: string;
  initialOpenSection?: BaselineInvestmentDocumentSectionId | null;
}) {
  const host = useContext(InvestmentDocumentHost)!;
  const positiveFill = investmentColor(host, '--uc-green-olive');
  const tableBorder = {
    borderBottomColor: investmentColor(host, '--uc-border'),
  };
  const [expanded, setExpanded] = useState<BaselineInvestmentDocumentSectionId | null>(
    initialOpenSection,
  );
  const [scenarioView, setScenarioView] = useState<'percent' | 'value'>(
    'value',
  );
  const [periodIndex, setPeriodIndex] = useState(5);
  return (
    <View style={s.root}>
      {sections.map(section => {
        const open = expanded === section.id,
          color = investmentColor(host, open ? '--uc-action' : '--uc-text');
        const renderStyle1 = {
          color,
        } as const;
        const renderStyle2 = {
          backgroundColor: investmentColor(host, '--uc-border'),
        } as const;
        return (
          <View key={section.id}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={section.title}
              accessibilityState={{
                expanded: open,
              }}
              onPress={() => setExpanded(open ? null : section.id)}
              style={s.header}
            >
              <View style={s.icon}>
                <SourceCustomIcon
                  name={section.icon}
                  size={32}
                  width={section.id === 'ex-ante' ? 18 : 32}
                  height={section.id === 'ex-ante' ? 24 : 32}
                  color={color}
                />
              </View>
              <View style={s.heading}>
                <Copy strong style={[s.title, renderStyle1]}>
                  {section.title}
                </Copy>
                <Copy
                  muted
                  style={[
                    s.subtitle,
                    open && {
                      color,
                    },
                  ]}
                >
                  {section.subtitle}
                </Copy>
              </View>
              <View style={s.chevronFrame}>
                <View
                  style={[
                    s.chevron,
                    open && {
                      transform: [
                        {
                          rotate: '180deg',
                        },
                      ],
                    },
                  ]}
                >
                  <SourceCustomIcon
                    name="chevron-down"
                    size={16}
                    color={color}
                  />
                </View>
              </View>
            </Pressable>
            {open ? (
              <View style={s.body}>
                {section.id === 'ex-ante' ? (
                  <BaselineInvestmentExAnteDisclosure
                    currency={currency}
                    view={scenarioView}
                    onView={setScenarioView}
                    periodIndex={periodIndex}
                    onPeriod={setPeriodIndex}
                  />
                ) : null}
                {section.id === 'documents'
                  ? documents.map(([title, description]) => {
                      return (
                        <View key={title} style={s.document}>
                          <View style={s.heading}>
                            <Copy strong>{title}</Copy>
                            <Copy muted style={s.subtitle}>
                              {description}
                            </Copy>
                          </View>
                          <SourceCustomIcon name="chevron-right" size={24} />
                        </View>
                      );
                    })
                  : null}
                {section.id === 'important-information'
                  ? evaluations.map(
                      ([title, statement, description], index) => {
                        return (
                          <View
                            key={title}
                            style={[
                              s.evaluation,
                              index > 0 && s.laterEvaluation,
                            ]}
                          >
                            <Copy strong style={s.evaluationTitle}>
                              {title}
                            </Copy>
                            <View style={s.statement}>
                              <View style={s.bulletFrame}>
                                <Svg
                                  width={32}
                                  height={32}
                                  viewBox="0 0 32 32"
                                  fill="none"
                                >
                                  <Path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M20 16C20 18.2088 18.2084 20 16 20C13.7908 20 12 18.2088 12 16C12 13.7912 13.7908 12 16 12Z"
                                    fill={positiveFill}
                                  />
                                </Svg>
                              </View>
                              <Copy strong style={s.statementCopy}>
                                {statement}
                              </Copy>
                            </View>
                            <Copy style={s.description}>{description}</Copy>
                            {index === 0 ? (
                              <View style={s.table}>
                                <View
                                  style={[
                                    s.tableRow,
                                    tableBorder,
                                    s.tableHeader,
                                  ]}
                                >
                                  <Copy strong style={s.characteristic}>
                                    Characteristics
                                  </Copy>
                                  <Copy strong style={s.result}>
                                    Result
                                  </Copy>
                                  <Copy strong style={s.limit}>
                                    Limit utilisation
                                  </Copy>
                                </View>
                                {[
                                  ['Alternatives', '14,47%'],
                                  ['Total portfolio risk', '58,87%'],
                                  ['Concentration risk', '0,47%'],
                                ].map(([label, limit], rowIndex) => {
                                  return (
                                    <View
                                      key={label}
                                      style={[
                                        s.tableRow,
                                        tableBorder,
                                        rowIndex === 2 && s.lastRow,
                                      ]}
                                    >
                                      <Copy
                                        style={[
                                          s.characteristic,
                                          s.tableBodyCopy,
                                        ]}
                                      >
                                        {label}
                                      </Copy>
                                      <View style={s.result}>
                                        <SourceCustomIcon
                                          name="check"
                                          size={20}
                                          color={investmentColor(
                                            host,
                                            '--uc-green-olive',
                                          )}
                                        />
                                      </View>
                                      <Copy
                                        strong
                                        style={[s.limit, s.tableBodyCopy]}
                                      >
                                        {limit}
                                      </Copy>
                                    </View>
                                  );
                                })}
                              </View>
                            ) : null}
                          </View>
                        );
                      },
                    )
                  : null}
                {section.id === 'disclaimer' ? (
                  <Copy style={s.disclaimer}>
                    Investments can rise or fall in value. Consider the
                    available product information and your individual
                    circumstances before making an investment decision.
                  </Copy>
                ) : null}
              </View>
            ) : null}
            <View style={[s.separator, renderStyle2]} />
          </View>
        );
      })}
    </View>
  );
}
const s = StyleSheet.create({
  copy: {
    lineHeight: 17,
  },
  root: {
    marginHorizontal: 0,
  },
  header: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  icon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    letterSpacing: 0.3,
    lineHeight: 17,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 15,
    marginTop: 2,
  },
  chevronFrame: {
    width: 32,
  },
  chevron: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingBottom: 24,
  },
  separator: {
    height: 1,
    marginHorizontal: 24,
    backgroundColor: '#D8D8D8',
  },
  document: {
    height: 80,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  evaluation: {
    paddingHorizontal: 24,
  },
  laterEvaluation: {
    marginTop: 24,
    paddingTop: 20,
  },
  evaluationTitle: {
    fontSize: 18,
    lineHeight: 20,
  },
  statement: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statementCopy: {
    flex: 1,
  },
  bulletFrame: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    marginTop: 8,
  },
  table: {
    marginTop: 16,
    marginHorizontal: 24,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D8D8D8',
  },
  tableHeader: {
    paddingTop: 0,
    paddingBottom: 8,
    alignItems: 'flex-start',
  },
  tableBodyCopy: {
    fontSize: 16,
    lineHeight: 17,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  characteristic: {
    flex: 1,
    fontSize: 14,
    lineHeight: 15,
  },
  result: {
    width: 64,
    fontSize: 14,
    lineHeight: 15,
  },
  limit: {
    width: 104,
    textAlign: 'right',
    fontSize: 14,
    lineHeight: 15,
  },
  disclaimer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    fontSize: 14,
    lineHeight: 15,
  },
});
export function BaselineInvestmentDocuments({
  host,
  security,
}: {
  host: CurrentScreenProps;
  security: InvestmentCatalogSecurity;
}) {
  return newBaselineInvestmentDocumentsPreview({
    host,
    currency: security.instrumentCurrency,
  });
}

export function newBaselineInvestmentDocumentsPreview({
  host,
  currency,
  initialOpenSection,
}: {
  host: CurrentScreenProps;
  currency: string;
  initialOpenSection?: BaselineInvestmentDocumentSectionId | null;
}) {
  return (
    <InvestmentDocumentHost.Provider value={host}>
      <OrderDocuments currency={currency} initialOpenSection={initialOpenSection} />
    </InvestmentDocumentHost.Provider>
  );
}

export const BaselineInvestmentDocumentsPreview = newBaselineInvestmentDocumentsPreview;
