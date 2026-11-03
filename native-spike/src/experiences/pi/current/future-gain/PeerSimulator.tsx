import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { ToggleButton } from '../../../../universal/ToggleButton';
import {
  MY_BANKER_RETAIL_CATALOGUE,
  type MyBankerCurrency,
} from '@/data/myBankerCore';
import {
  calculateFutureGainPeerSimulation,
  FUTURE_GAIN_CAR_LOAN,
  FUTURE_GAIN_ENERGY_EFFICIENCY_LOAN,
  FUTURE_GAIN_LEASING,
  getFutureGainPeerSimulatorPreset,
  type FutureGainPeerProduct,
} from '@/features/investments/future-gain/peerInsights';
import {
  Page,
  Label,
  Fact,
  Section,
  Money,
  Button,
  Footer,
  Picker,
  Sheet,
  FormField,
  Chips,
  IconAction,
  Row,
  s,
} from './Primitives';
import type { CurrentScreenProps } from '../contracts';
import { creditCardArt } from './assets';
import { SourceRangeSlider } from '../../../../universal/SourceRangeSlider';
import { sourceColor } from '../../../../universal/sourceColor';
const disclosures = [
  {
    title: 'Terms & conditions & collateral',
    content:
      'The final conditions, eligibility and any collateral requirements are defined by the Bank and confirmed in the offer. This illustration is indicative and is not a binding offer.',
  },
  {
    title: 'Representative example',
    content:
      'The estimate uses the amount, currency, duration and indicative rate shown in this simulator. Fees, insurance and other costs may change the final amount.',
  },
  {
    title: 'Early payment',
    content:
      'Early repayment conditions and any applicable costs are provided in the final agreement and the Bank’s current terms.',
  },
  {
    title: 'Client’s rights to withdraw from a concluded agreement',
    content:
      'Your rights, deadlines and the process for withdrawal are described in the agreement and the applicable terms and conditions.',
  },
];
const creditDisclosures = [
  { title: 'REPRESENTATIVE EXAMPLES', content: 'The representative examples depend on the purchase amount, selected installment plan, fees and the terms applicable when the transaction is made.' },
  { title: 'ADDITIONAL INFORMATION ABOUT CREDIT CARD', content: 'Eligibility, fees, interest and other terms are confirmed by UniCredit Bank in the offer and final card agreement.' },
];
const creditBenefits: [string, string, string][] = [
  [
    'credit-card',
    'Looking for a simple way to pay in installments?',
    'Split purchases into interest-free installments, just like paying by cheque.',
  ],
  [
    'shopping-bag',
    'Want to shop online with more flexibility?',
    'Make secure online purchases and pay in installments.',
  ],
  [
    'credit-card',
    'Need a card for everyday spending?',
    'Use Flexia Mastercard for daily purchases wherever cards are accepted.',
  ],
  [
    'circle-dollar-sign',
    'Need quick access to cash?',
    'Get immediate funds through a solution that is more flexible and convenient than a cash loan.',
  ],
];
const creditLayout = StyleSheet.create({
  content: { padding: 0, paddingBottom: 96, gap: 0 },
  optionsHeading: { paddingHorizontal: 24, paddingTop: 0, paddingBottom: 8 },
  options: { flexDirection: 'row', gap: 16, paddingHorizontal: 24 },
  option: {
    flex: 1,
    minWidth: 0,
    minHeight: 183,
    borderRadius: 4,
    padding: 16,
    gap: 6,
    alignItems: 'flex-start',
  },
  optionImage: { width: 81, height: 51 },
  optionLabel: { fontSize: 16, lineHeight: 18 },
  optionPlaceholder: { fontSize: 14, lineHeight: 18 },
  benefitsHeading: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
  benefit: { minHeight: 75, flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 24, paddingVertical: 8 },
  benefitIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  benefitCopy: { flex: 1, gap: 2 },
  benefitTitle: { fontSize: 16, lineHeight: 20 },
  benefitBody: { fontSize: 16, lineHeight: 20 },
  disclosures: { width: '100%', paddingTop: 8 },
  disclosure: { minHeight: 75, flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 24, paddingVertical: 8 },
  disclosureTitle: { flex: 1, fontSize: 18, lineHeight: 22 },
  disclosureIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  disclaimer: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, alignItems: 'center', gap: 4 },
  disclaimerText: { fontSize: 14, lineHeight: 16, textAlign: 'center' },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 },
});
const overdraftLayout = StyleSheet.create({
  content: { padding: 0, paddingBottom: 96, gap: 0 },
  options: { flexDirection: 'row', gap: 16, paddingHorizontal: 24 },
  option: {
    flex: 1,
    minWidth: 0,
    minHeight: 151,
    borderWidth: 1,
    borderRadius: 4,
    padding: 16,
    gap: 19,
  },
  optionIcon: { width: 44, height: 44, padding: 6 },
  optionCopy: { gap: 8 },
  optionTitle: { fontSize: 16, lineHeight: 20 },
  optionDescription: { fontSize: 14, lineHeight: 16 },
  intro: { paddingHorizontal: 24, paddingTop: 24 },
  benefit: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 24, paddingHorizontal: 24, paddingVertical: 12 },
  benefitIcon: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  benefitText: { flex: 1, fontSize: 16, lineHeight: 20 },
  disclosures: { width: '100%', paddingTop: 8 },
  disclosure: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 24 },
  disclosureTitle: { flex: 1, fontSize: 18, lineHeight: 22 },
  disclosureIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  disclosureBody: { paddingHorizontal: 24, paddingBottom: 16, fontSize: 14, lineHeight: 18 },
  note: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16, textAlign: 'center', fontSize: 14, lineHeight: 18 },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24, backgroundColor: '#ffffff' },
});
const mortgageLayout = StyleSheet.create({
  content: { padding: 0, paddingBottom: 96, gap: 0 },
  intro: { paddingHorizontal: 24, paddingTop: 16 },
  calculationHeading: {
    width: '100%',
    marginTop: 24,
    paddingHorizontal: 24,
    paddingTop: 6,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  rateChoices: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  rateChoice: {
    flex: 1,
    minHeight: 64,
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  amountField: { flex: 1, marginBottom: 0 },
  currency: { width: 66, paddingTop: 0, gap: 2 },
  amountChips: { paddingTop: 12 },
  chipRail: { gap: 8, paddingHorizontal: 24, paddingVertical: 12 },
  amountChip: {
    minWidth: 70,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  tenor: { paddingHorizontal: 24, paddingTop: 16, gap: 12 },
  tenorCounter: {
    width: 222,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 8,
  },
  tenorButton: { width: 20, height: 32, alignItems: 'center', justifyContent: 'center' },
  tenorValue: {
    width: 166,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#909090',
  },
  tenorRange: { flexDirection: 'row', justifyContent: 'space-between' },
  termChips: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  termChip: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
  },
  insuranceRow: {
    width: '100%',
    minHeight: 80,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  insuranceLabel: { flex: 1 },
  carEmploymentRail: { gap: 8, paddingHorizontal: 12 },
  carEmploymentCard: {
    width: 144,
    minHeight: 169,
    borderRadius: 4,
    borderWidth: 1,
    padding: 16,
    gap: 19,
  },
  carEmploymentIconSlot: { width: 44, height: 44, padding: 6 },
  carEmploymentCopy: { gap: 8 },
  carEmploymentTitle: { fontSize: 16, lineHeight: 18 },
  carEmploymentBody: { fontSize: 14, lineHeight: 16 },
  carRateType: {
    width: '100%',
    minHeight: 74,
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  leasingRateSection: { width: '100%', paddingHorizontal: 24, paddingTop: 24, gap: 8 },
  leasingRates: { flexDirection: 'row', gap: 16 },
  leasingRate: { flex: 1, minHeight: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 4, padding: 12 },
  carCurrency: { width: 98, minHeight: 38, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  carChipRail: { gap: 16, paddingHorizontal: 24, paddingVertical: 12 },
  carAmountChip: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  carLegalPanel: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 4,
  },
  leasingExampleList: { width: '100%' },
  leasingExampleRow: { width: '100%', minHeight: 56, justifyContent: 'center', gap: 4, paddingHorizontal: 0, paddingVertical: 6 },
  leasingExampleHighlight: { backgroundColor: '#f5f5f5' },
  leasingExampleFooter: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8 },
  results: { width: '100%', paddingTop: 16 },
  resultsHeading: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 8 },
  resultItem: {
    width: '100%',
    minHeight: 80,
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  estimateNote: { paddingHorizontal: 24, paddingVertical: 16, textAlign: 'center' },
  estimateCopy: { paddingTop: 16, paddingBottom: 16, gap: 4 },
  estimateWarning: { paddingHorizontal: 24, textAlign: 'center', lineHeight: 20 },
  estimateLegal: { paddingHorizontal: 24, textAlign: 'center', lineHeight: 16 },
  disclosures: { width: '100%', paddingTop: 8 },
  disclosure: { minHeight: 75, paddingHorizontal: 24, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  disclosureTitle: { flex: 1, fontSize: 18, lineHeight: 20 },
  disclosureIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  disclosureBody: { paddingHorizontal: 24, paddingBottom: 16, fontSize: 14, lineHeight: 18 },
});
export function PeerSimulator({
  host,
  product,
  onBack,
}: {
  host: CurrentScreenProps;
  product: FutureGainPeerProduct;
  onBack: () => void;
}) {
  return <View role="region" accessibilityLabel={`${product.title} simulator`} style={{ flex: 1 }}><PeerSimulatorContent host={host} product={product} onBack={onBack} /></View>;
}

function PeerSimulatorContent({
  host,
  product,
  onBack,
}: {
  host: CurrentScreenProps;
  product: FutureGainPeerProduct;
  onBack: () => void;
}) {
  const kind = product.simulator;
  const energyEfficiencyLoan = kind === 'energy-efficiency-loan';
  const carLoan = kind === 'car-loan';
  const leasing = kind === 'leasing';
  const preset = getFutureGainPeerSimulatorPreset(kind);
  const model =
    MY_BANKER_RETAIL_CATALOGUE.find(
      item => item.key === (energyEfficiencyLoan || carLoan || leasing ? 'cash-loan' : kind),
    ) ??
    MY_BANKER_RETAIL_CATALOGUE[0]!;
  const [currency, setCurrency] = useState<MyBankerCurrency>(
    energyEfficiencyLoan || carLoan || leasing || kind === 'overdraft' ? 'RSD' : 'EUR',
  );
  const [amountText, setAmount] = useState(
    kind === 'mortgage' || energyEfficiencyLoan || carLoan || leasing
      ? preset.amount.toLocaleString('sr-RS')
      : String(preset.amount),
  );
  const [term, setTerm] = useState(preset.termMonths);
  const [rateMode, setRateMode] = useState<'combined' | 'variable'>('combined');
  const [picker, setPicker] = useState(false);
  const [sheet, setSheet] = useState<{ title: string; content: string } | null>(
    null,
  );
  const [request, setRequest] = useState(false);
  const [ready, setReady] = useState(false);
  const [loanInsurance, setLoanInsurance] = useState(!leasing);
  const [employmentType, setEmploymentType] = useState<'public-sector' | 'other-companies' | 'pensioners' | 'special-companies'>(
    leasing ? 'special-companies' : 'public-sector',
  );
  const [card, setCard] = useState<'flexia' | 'platinum'>('flexia');
  const [expandedMortgageInfo, setExpandedMortgageInfo] = useState<string | null>(null);
  const [expandedCreditDisclosure, setExpandedCreditDisclosure] = useState<string | null>(null);
  const amount =
    Number(amountText.replace(/\./g, '').replace(/[^\d]/g, '')) || 0;
  const range =
    model.amountRanges.find(item => item.currency === currency) ??
    model.amountRanges[0];
  const quote = calculateFutureGainPeerSimulation({
    kind,
    amount,
    currency,
    termMonths: term,
    rateMode,
    loanInsurance,
  });
  const amounts = range
      ? [
          ...new Set([
            Math.max(
              range.min,
              Math.round((range.suggested * 0.5) / range.step) * range.step,
            ),
            range.suggested,
            Math.min(
              range.max,
              Math.round((range.suggested * 1.5) / range.step) * range.step,
            ),
            range.max,
          ]),
        ]
      : [];
  const periods =
    kind === 'mortgage' || energyEfficiencyLoan
      ? [60, 120, 240, 360]
      : leasing
      ? FUTURE_GAIN_LEASING.quickTerms
      : carLoan
      ? FUTURE_GAIN_CAR_LOAN.quickTerms
      : kind === 'cash-loan'
      ? [12, 24, 48, 84]
      : model.termMonths
      ? [
          ...new Set([
            model.termMonths.min,
            model.termMonths.suggested,
            Math.min(model.termMonths.max, 36),
            model.termMonths.max,
          ]),
        ].sort((a, b) => a - b)
      : [];
  const heading =
    kind === 'term-deposit'
      ? 'DEPOSIT CALCULATION'
      : kind === 'investment-fund'
      ? 'INVESTMENT CALCULATION'
      : 'LOAN CALCULATION';
  const cardName =
    card === 'flexia' ? 'Flexia Mastercard' : 'Mastercard Platinum';
  if (kind === 'overdraft') {
    const choices = [
      { id: 'public-sector' as const, title: 'Employed', description: 'You are employed in these sectors', icon: 'clipboard-check' },
      { id: 'pensioners' as const, title: 'Pensioner', description: 'Lorem ipsum', icon: 'user-round' },
    ];
    const points = [
      {
        icon: 'wallet-cards',
        text: 'The approved amount is available on your account whenever you need it, but you are not required to use it.',
      },
      {
        icon: 'circle-dollar-sign',
        text: "What's more, interest is charged only on the amount you actually use and only for the period during which it is utilized.",
      },
      {
        icon: 'clipboard-check',
        text: "The overdraft facility is granted with no processing or maintenance fees. And that's not all!",
      },
    ];
    const disclosures = [
      {
        id: 'eligibility',
        title: 'ELIGIBILITY CONDITIONS',
        content: 'The overdraft offer is subject to the Bank’s eligibility assessment and current client conditions.',
      },
      {
        id: 'terms',
        title: 'TERMS & CONDITIONS',
        content: 'The applicable rate, limits and repayment terms are defined in the final agreement with the Bank.',
      },
      {
        id: 'representative',
        title: 'REPRESENTATIVE EXAMPLE FOR EMPLOYEES',
        content: 'The representative example depends on the approved limit, the amount used and the period for which it is utilized.',
      },
    ];
    return (
      <Page
        host={{ ...host, onBack }}
        title="Overdraft"
        trailing={
          <IconAction
            host={host}
            name="help-circle"
            label="About overdraft"
            onPress={() => setSheet({
              title: 'About overdraft',
              content: 'An overdraft facility is available on your account when you need it. Interest applies only to the amount used and the period it is used.',
            })}
          />
        }
        contentContainerStyle={overdraftLayout.content}
        footer={
          <View style={[overdraftLayout.footer, { backgroundColor: host.tokens.surface }]}>
            <Button
              host={host}
              label="Contact us for offer"
              onPress={() => setRequest(true)}
            />
          </View>
        }
      >
        <View style={overdraftLayout.options}>
          {choices.map(choice => {
            const selected = employmentType === choice.id;
            return (
              <Pressable
                key={choice.id}
                accessibilityRole="button"
                accessibilityLabel={`${choice.title}. ${choice.description}`}
                accessibilityState={{ selected }}
                onPress={() => setEmploymentType(choice.id)}
                style={[
                  overdraftLayout.option,
                  {
                    backgroundColor: host.tokens.surface,
                    borderColor: selected ? host.tokens.accent : host.tokens.border,
                    borderWidth: selected ? 2 : 1,
                  },
                ]}
              >
                <View style={overdraftLayout.optionIcon}>
                  <SourceCustomIcon name={choice.icon} size={32} color={host.tokens.text} />
                </View>
                <View style={overdraftLayout.optionCopy}>
                  <Label
                    host={{
                      ...host,
                      tokens: { ...host.tokens, text: selected ? host.tokens.accent : host.tokens.text },
                    }}
                    strong
                    style={overdraftLayout.optionTitle}
                  >
                    {choice.title}
                  </Label>
                  <Label host={host} size={14} style={overdraftLayout.optionDescription}>
                    {choice.description}
                  </Label>
                </View>
              </Pressable>
            );
          })}
        </View>
        <View style={overdraftLayout.intro}>
          <Label host={host} strong size={16}>
            An overdraft facility gives you peace of mind when unexpected expenses arise!
          </Label>
        </View>
        {points.map(point => (
          <View key={point.text} style={overdraftLayout.benefit}>
            <View style={overdraftLayout.benefitIcon}>
              <SourceCustomIcon name={point.icon} size={24} color={host.tokens.text} />
            </View>
            <Label host={host} style={overdraftLayout.benefitText}>
              {point.text}
            </Label>
          </View>
        ))}
        <View style={overdraftLayout.disclosures}>
          {disclosures.map(disclosure => {
            const expanded = expandedMortgageInfo === `overdraft-${disclosure.id}`;
            return (
              <React.Fragment key={disclosure.id}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={disclosure.title}
                  accessibilityState={{ expanded }}
                  onPress={() => setExpandedMortgageInfo(expanded ? null : `overdraft-${disclosure.id}`)}
                  style={overdraftLayout.disclosure}
                >
                  <Label host={host} strong style={overdraftLayout.disclosureTitle}>
                    {disclosure.title}
                  </Label>
                  <View style={overdraftLayout.disclosureIcon}>
                    <SourceCustomIcon
                      name={expanded ? 'chevron-down' : 'chevron-right'}
                      size={16}
                      color={host.tokens.text}
                    />
                  </View>
                </Pressable>
                {expanded ? (
                  <Label host={host} muted style={overdraftLayout.disclosureBody}>
                    {disclosure.content}
                  </Label>
                ) : null}
              </React.Fragment>
            );
          })}
        </View>
        <Label host={host} muted style={overdraftLayout.note}>Lorem ipsum dolor sit amet</Label>
        <Sheet
          host={host}
          title={sheet?.title ?? ''}
          visible={!!sheet}
          onClose={() => setSheet(null)}
        >
          <Label host={host}>{sheet?.content}</Label>
          <Button host={host} label="OK" onPress={() => setSheet(null)} />
        </Sheet>
        <Sheet
          host={host}
          title="Contact us for offer"
          visible={request}
          onClose={() => setRequest(false)}
        >
          <Label host={host}>
            Your request is ready in this demo. No contact request has been sent.
          </Label>
          <Button host={host} label="Done" onPress={() => setRequest(false)} />
        </Sheet>
      </Page>
    );
  }
  if (kind === 'credit-card')
    return (
      <Page
        host={{ ...host, onBack }}
        title="Credit Card"
        contentContainerStyle={creditLayout.content}
        trailing={
          <IconAction
            host={host}
            name="help-circle"
            label="About credit cards"
            onPress={() =>
              setSheet({
                title: 'About credit cards',
                content:
                  'Choose a card type to review its features and ask UniCredit Bank for an offer.',
              })
            }
          />
        }
        footer={
          <View style={[creditLayout.footer, { backgroundColor: host.tokens.surface }]}>
            <Button
              host={host}
              label="Contact us for offer"
              onPress={() =>
                setSheet({
                  title: 'Contact us for offer',
                  content:
                    'A UniCredit Bank advisor can help you choose a credit card. No call is started in this demo.',
                })
              }
            />
          </View>
        }
      >
        <View style={creditLayout.optionsHeading}>
          <Label host={host} size={16}>
            Choose your type of Credit Card.
          </Label>
        </View>
        <View style={creditLayout.options}>
          {(['flexia', 'platinum'] as const).map(value => (
            <Pressable
              key={value}
              testID={`future-gain-peer-card-option-${value}`}
              accessibilityRole="button"
              accessibilityLabel={
                value === 'flexia'
                  ? 'Flexia Mastercard'
                  : 'Mastercard Platinum'
              }
              accessibilityState={{ selected: card === value }}
              onPress={() => setCard(value)}
              style={[
                creditLayout.option,
                {
                  borderWidth: card === value ? 2 : 1,
                  borderColor:
                    card === value ? host.tokens.accent : host.tokens.border,
                },
              ]}
            >
              <Image
                source={creditCardArt[value]}
                accessibilityLabel={value === 'flexia' ? 'Flexia Mastercard card art' : 'Mastercard Platinum card art'}
                style={creditLayout.optionImage}
                resizeMode="contain"
              />
              <Label
                host={{
                  ...host,
                  tokens: {
                    ...host.tokens,
                    text: sourceColor(
                      'var(--uc-action-strong)',
                      host.mode === 'dark',
                    ),
                  },
                }}
                strong
                size={14}
                style={creditLayout.optionLabel}
              >
                {value === 'flexia'
                  ? 'Flexia Mastercard® kreditna kartica'
                  : 'Mastercard® Platinum'}
              </Label>
              <Label
                host={host}
                muted
                size={14}
                style={creditLayout.optionPlaceholder}
              >
                Lorem ipsum dolor sit amet
              </Label>
            </Pressable>
          ))}
        </View>
        <View style={creditLayout.benefitsHeading}>
          <Label
            host={host}
            strong
            size={28}
          >
            {`Why should ${cardName} be your first choice?`}
          </Label>
        </View>
        {creditBenefits.map(([icon, title, body], index) => (
          <View
            key={title}
            testID="future-gain-peer-credit-benefit"
            style={creditLayout.benefit}
          >
            <View style={creditLayout.benefitIcon}>
              <SourceCustomIcon name={icon} size={24} color={host.tokens.text} />
            </View>
            <View style={creditLayout.benefitCopy}>
              <Label host={host} strong style={creditLayout.benefitTitle}>
                {title}
              </Label>
              <Label host={host} style={creditLayout.benefitBody}>
                {index === 2 ? body.replace('Flexia Mastercard', cardName) : body}
              </Label>
            </View>
          </View>
        ))}
        <View style={creditLayout.disclosures}>
          {creditDisclosures.map(disclosure => {
            const expanded = expandedCreditDisclosure === disclosure.title;
            return (
              <React.Fragment key={disclosure.title}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={disclosure.title}
                  accessibilityState={{ expanded }}
                  onPress={() =>
                    setExpandedCreditDisclosure(expanded ? null : disclosure.title)
                  }
                  style={creditLayout.disclosure}
                >
                  <Label host={host} strong style={creditLayout.disclosureTitle}>
                    {disclosure.title}
                  </Label>
                  <View style={creditLayout.disclosureIcon}>
                    <SourceCustomIcon
                      name={expanded ? 'chevron-down' : 'chevron-right'}
                      size={16}
                      color={host.tokens.text}
                    />
                  </View>
                </Pressable>
                {expanded ? (
                  <Label host={host} muted style={mortgageLayout.disclosureBody}>
                    {disclosure.content}
                  </Label>
                ) : null}
              </React.Fragment>
            );
          })}
        </View>
        <View style={creditLayout.disclaimer}>
          <Label host={host} muted style={creditLayout.disclaimerText}>
            The displayed terms are for informational purposes only. Final terms and conditions are subject to the assessment of your creditworthiness and the Bank's credit policy applicable at the time of application.
          </Label>
          <Label host={host} strong style={creditLayout.disclaimerText}>
            Warning! Borrowing money costs money.
          </Label>
        </View>
        <Sheet
          host={host}
          title={sheet?.title ?? ''}
          visible={!!sheet}
          onClose={() => setSheet(null)}
        >
          <Label host={host}>{sheet?.content}</Label>
          <Button host={host} label="OK" onPress={() => setSheet(null)} />
        </Sheet>
      </Page>
    );
  if (carLoan || leasing) {
    const loanTitle = leasing ? 'Leasing' : 'Cash Loan';
    const loanTerm = leasing
      ? FUTURE_GAIN_LEASING.termMonths
      : FUTURE_GAIN_CAR_LOAN.termMonths;
    const loanAmounts = currency === 'RSD'
      ? leasing ? FUTURE_GAIN_LEASING.quickAmounts : FUTURE_GAIN_CAR_LOAN.quickAmounts
      : leasing ? FUTURE_GAIN_LEASING.quickAmountsEur : FUTURE_GAIN_CAR_LOAN.quickAmountsEur;
    const employers = leasing
      ? [
          { id: 'special-companies' as const, title: 'Special companies', body: 'Companies that are partners with UniCredit', icon: 'clipboard-check' },
          { id: 'other-companies' as const, title: 'Other companies', body: 'Companies that are not partners with UniCredit', icon: 'wallet-cards' },
        ]
      : [
          { id: 'public-sector' as const, title: 'Public sector & corporations', body: 'You are employed in these sectors', icon: 'clipboard-check' },
          { id: 'other-companies' as const, title: 'Other companies', body: 'Lorem ipsum', icon: 'wallet-cards' },
          { id: 'pensioners' as const, title: 'Pensioners', body: 'Lorem ipsum', icon: 'user-round' },
        ];
    return (
      <Page
        host={{ ...host, onBack }}
        title={leasing ? 'Leasing' : 'Cash Loan'}
        trailing={
          <IconAction
            host={host}
            name="help-circle"
            label={leasing ? 'About leasing' : 'About car loans'}
            onPress={() => setSheet({
              title: leasing ? 'About leasing' : 'About car loans',
              content: leasing
                ? 'This indicative leasing calculation is based on the vehicle price, term, employment type and insurance option selected. The final offer depends on the Bank’s assessment and current terms.'
                : 'This indicative calculation is based on the amount, term, employment type and loan insurance option selected. The final offer depends on the Bank’s assessment and current terms.',
            })}
          />
        }
        contentContainerStyle={mortgageLayout.content}
        footer={
          <Footer host={host}>
            <Button
              host={host}
              label="Contact us for offer"
              onPress={() => {
                setReady(false);
                setRequest(true);
              }}
            />
          </Footer>
        }
      >
        <View style={mortgageLayout.intro}>
          <Label host={host} size={16}>
            <Text style={{ fontFamily: host.tokens.strongFont }}>
              Turn your plans into reality.
            </Text>{' '}
            Turn your plans into reality with a personal loan tailored to your
            needs. Explore available options, estimate your monthly installment,
            and find the solution that fits your budget.
          </Label>
        </View>
        <View
          style={[
            mortgageLayout.calculationHeading,
            { borderBottomColor: host.tokens.border },
          ]}
        >
          <Label host={host} strong size={18}>LOAN CALCULATION</Label>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={mortgageLayout.carEmploymentRail}
        >
          {employers.map(employer => {
            const selected = employmentType === employer.id;
            return (
              <Pressable
                key={employer.id}
                accessibilityRole="button"
                accessibilityLabel={`${employer.title}. ${employer.body}`}
                accessibilityState={{ selected }}
                onPress={() => setEmploymentType(employer.id)}
                style={[
                  mortgageLayout.carEmploymentCard,
                  {
                    backgroundColor: host.tokens.surface,
                    borderColor: selected ? host.tokens.accent : host.tokens.border,
                    borderWidth: selected ? 2 : 1,
                  },
                ]}
              >
                <View style={mortgageLayout.carEmploymentIconSlot}>
                  <SourceCustomIcon name={employer.icon} size={32} color={host.tokens.text} />
                </View>
                <View style={mortgageLayout.carEmploymentCopy}>
                  <Label
                    host={{
                      ...host,
                      tokens: { ...host.tokens, text: selected ? host.tokens.accent : host.tokens.text },
                    }}
                    strong
                    style={mortgageLayout.carEmploymentTitle}
                  >
                    {employer.title}
                  </Label>
                  <Label host={host} size={14} style={mortgageLayout.carEmploymentBody}>
                    {employer.body}
                  </Label>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
        {leasing ? (
          <View style={mortgageLayout.leasingRateSection}>
            <Label host={host} muted size={14}>Type of interest rate</Label>
            <View style={mortgageLayout.leasingRates}>
              {[
                { id: 'combined' as const, label: 'Fixed rate' },
                { id: 'variable' as const, label: 'Variable rate' },
              ].map(option => {
                const selected = rateMode === option.id;
                return (
                  <Pressable
                    key={option.id}
                    accessibilityRole="radio"
                    accessibilityLabel={option.label}
                    accessibilityState={{ checked: selected }}
                    onPress={() => setRateMode(option.id)}
                    style={[
                      mortgageLayout.leasingRate,
                      {
                        borderColor: selected ? host.tokens.accent : host.tokens.border,
                        borderWidth: selected ? 2 : 1,
                      },
                    ]}
                  >
                    <Label host={{ ...host, tokens: { ...host.tokens, text: selected ? host.tokens.accent : host.tokens.muted } }} strong size={16}>
                      {option.label}
                    </Label>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={mortgageLayout.carRateType}>
            <Label host={host} muted size={14}>Type of interest rate</Label>
            <Label host={host} strong size={18}>Fixed</Label>
          </View>
        )}
        <View style={mortgageLayout.amountRow}>
          <FormField
            tokens={host.tokens}
            label="Loan amount"
            value={amountText}
            onChange={setAmount}
            inputProps={{ keyboardType: 'number-pad' }}
            containerStyle={mortgageLayout.amountField}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Change currency, currently ${currency}`}
            onPress={() => setPicker(true)}
            style={mortgageLayout.carCurrency}
          >
            <View>
              <Label host={host} muted size={14}>Currency</Label>
              <Label host={host} size={18}>{currency}</Label>
            </View>
            <SourceCustomIcon name="chevron-down" size={16} color={host.tokens.text} />
          </Pressable>
        </View>
        <View style={mortgageLayout.amountChips}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={mortgageLayout.carChipRail}
          >
            {loanAmounts.map(value => {
              const selected = amount === value;
              return (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityLabel={value.toLocaleString('sr-RS')}
                  accessibilityState={{ selected }}
                  onPress={() => setAmount(String(value))}
                  style={[
                    mortgageLayout.carAmountChip,
                    {
                      backgroundColor: selected
                        ? host.tokens.accent
                        : sourceColor('var(--uc-neutral-100, #F5F5F5)', host.mode === 'dark'),
                      borderColor: selected ? host.tokens.accent : 'transparent',
                    },
                  ]}
                >
                  <Label
                    host={{
                      ...host,
                      tokens: { ...host.tokens, text: selected ? host.tokens.inverse : host.tokens.text },
                    }}
                    strong
                    size={14}
                  >
                    {value.toLocaleString('sr-RS')}
                  </Label>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
        <View style={mortgageLayout.tenor}>
          <Label host={host} strong size={14}>TENOR</Label>
          <View style={mortgageLayout.tenorCounter}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Decrease tenor"
              onPress={() => setTerm(value => Math.max(loanTerm.min, value - loanTerm.step))}
              style={mortgageLayout.tenorButton}
            >
              <Label host={host} strong size={20}>−</Label>
            </Pressable>
            <View style={mortgageLayout.tenorValue}>
              <Label host={host} strong size={18}>{term}</Label>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Increase tenor"
              onPress={() => setTerm(value => Math.min(loanTerm.max, value + loanTerm.step))}
              style={mortgageLayout.tenorButton}
            >
              <Label host={host} strong size={20}>+</Label>
            </Pressable>
          </View>
          <SourceRangeSlider
            label="Tenor"
            min={loanTerm.min}
            max={loanTerm.max}
            step={loanTerm.step}
            value={term}
            onChange={setTerm}
            color={sourceColor('var(--uc-action-strong)', host.mode === 'dark')}
            presentation="feedback"
          />
          <View style={mortgageLayout.tenorRange}>
            <Label host={host} size={14}>{leasing ? `Min. ${loanTerm.min}` : loanTerm.min} months</Label>
            <Label host={host} size={14}>{leasing ? `Max. ${loanTerm.max}` : loanTerm.max} months</Label>
          </View>
        </View>
        <View style={mortgageLayout.termChips}>
          {(leasing ? FUTURE_GAIN_LEASING.quickTerms : FUTURE_GAIN_CAR_LOAN.quickTerms).map(value => {
            const selected = value === term;
            return (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityLabel={`${value} months`}
                accessibilityState={{ selected }}
                onPress={() => setTerm(value)}
                style={[
                  mortgageLayout.termChip,
                  {
                    backgroundColor: selected
                      ? host.tokens.accent
                      : sourceColor('var(--uc-neutral-100, #F5F5F5)', host.mode === 'dark'),
                    borderColor: selected ? host.tokens.accent : 'transparent',
                  },
                ]}
              >
                <Label
                  host={{ ...host, tokens: { ...host.tokens, text: selected ? host.tokens.inverse : host.tokens.text } }}
                  strong
                  size={14}
                >
                  {value}
                </Label>
              </Pressable>
            );
          })}
        </View>
        <View style={mortgageLayout.insuranceRow}>
          <Label host={host} strong size={16} style={mortgageLayout.insuranceLabel}>
            LOAN INSURANCE
          </Label>
          <ToggleButton
            ariaLabel="Loan insurance"
            checked={loanInsurance}
            onToggle={setLoanInsurance}
            dark={host.mode === 'dark'}
          />
        </View>
        {quote ? (
          <View style={mortgageLayout.results}>
            <View style={mortgageLayout.resultsHeading}>
              <Label host={host} strong size={18}>CALCULATION RESULTS</Label>
            </View>
            <View style={mortgageLayout.resultItem}>
              <Label host={host} size={16}>
                {leasing && rateMode === 'variable'
                  ? 'Monthly installment variable interest rate'
                  : 'Monthly installment fixed interest rate'}
              </Label>
              <Money host={host} value={quote.monthlyPayment ?? 0} currency={currency} size={18} />
            </View>
            {quote.monthlyLoanInsurance !== null ? (
              <View style={mortgageLayout.resultItem}>
                <Label host={host} size={16}>Monthly loan insurance</Label>
                <Money host={host} value={quote.monthlyLoanInsurance} currency={currency} size={18} />
              </View>
            ) : null}
            <View style={mortgageLayout.resultItem}>
              <Label host={host} size={16}>Total principal + interest</Label>
              <Money host={host} value={quote.totalAmount ?? 0} currency={currency} size={18} />
            </View>
            <View style={mortgageLayout.carLegalPanel}>
              <Label host={host} muted size={14} style={mortgageLayout.estimateLegal}>
                {leasing
                  ? 'The displayed terms are for informational purposes only. The final terms and conditions are subject to the assessment of your creditworthiness and the Bank’s current leasing offer.'
                  : "The displayed amounts are for informational purposes only. The final terms and conditions will be determined following an assessment of your creditworthiness and in accordance with the Bank's credit policy. The offer of cash loans and refinancing loans with payment protection insurance is intended for existing UniCredit Bank clients who have been continuously employed under a permanent employment contract for at least 12 months, receive their salary through UniCredit Bank in an amount at least equal to the monthly obligation under the loan product, and are employed by companies approved by the Bank. For information about other available offer conditions, please select another option or contact an advisor at a branch."}
              </Label>
              <Label host={host} strong size={14} style={mortgageLayout.estimateLegal}>
                Warning! Borrowing money costs money.
              </Label>
            </View>
          </View>
        ) : null}
        <View style={mortgageLayout.disclosures}>
          {[
            {
              id: leasing ? 'leasing-examples' : 'car-examples',
              title: 'REPRESENTATIVE EXAMPLES',
              body: `Illustration based on a ${amount.toLocaleString('sr-RS')} ${currency} ${leasing ? 'lease' : 'loan'} over ${term} months. The final terms depend on the assessment of your creditworthiness and the Bank's offer.`,
            },
            {
              id: leasing ? 'leasing-information' : 'car-information',
              title: leasing ? 'ADDITIONAL INFORMATION ABOUT LEASING' : 'ADDITIONAL INFORMATION ABOUT CASH LOAN',
              body: leasing
                ? 'Vehicle, down-payment, processing-fee and insurance conditions depend on the selected leasing offer. Please contact an advisor for details.'
                : 'The loan offer and payment protection insurance are subject to eligibility, employment and account conditions. Please contact an advisor for other available offer conditions.',
            },
          ].map(disclosure => {
            const expanded = !leasing && expandedMortgageInfo === disclosure.id;
            return (
              <React.Fragment key={disclosure.id}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={disclosure.title}
                  accessibilityState={{ expanded }}
                  onPress={() => leasing && disclosure.id === 'leasing-examples'
                    ? setSheet({ title: 'Representative example', content: '' })
                    : setExpandedMortgageInfo(expanded ? null : disclosure.id)}
                  style={mortgageLayout.disclosure}
                >
                  <Label host={host} strong style={mortgageLayout.disclosureTitle}>
                    {disclosure.title}
                  </Label>
                  <View style={mortgageLayout.disclosureIcon}>
                    <SourceCustomIcon
                      name={expanded ? 'chevron-down' : 'chevron-right'}
                      size={16}
                      color={host.tokens.text}
                    />
                  </View>
                </Pressable>
                {expanded ? (
                  <Label host={host} muted style={mortgageLayout.disclosureBody}>
                    {disclosure.body}
                  </Label>
                ) : null}
              </React.Fragment>
            );
          })}
        </View>
        {picker ? (
          <Picker
            host={host}
            title="Select currency"
            visible
            current={currency}
            items={(['RSD', 'EUR'] as const).map(value => ({ value, label: value }))}
            onClose={() => setPicker(false)}
            onConfirm={value => {
              const next = model.amountRanges.find(item => item.currency === value) ?? model.amountRanges[0]!;
              setCurrency(value);
              setAmount(String(Math.min(next.max, Math.max(next.min, value === 'RSD' ? 600_000 : 6_000))));
            }}
          />
        ) : null}
        <Sheet
          host={host}
          title={sheet?.title ?? ''}
          visible={!!sheet}
          onClose={() => setSheet(null)}
          fitContent={leasing && sheet?.title === 'Representative example'}
        >
          {leasing && sheet?.title === 'Representative example'
            ? <>
                <View style={mortgageLayout.leasingExampleList}>
                  {FUTURE_GAIN_LEASING.representativeExample.map(([label, value]) => (
                    <View
                      key={label}
                      style={[
                        mortgageLayout.leasingExampleRow,
                        label.startsWith('EKS') ? mortgageLayout.leasingExampleHighlight : undefined,
                      ]}
                    >
                      <Label host={host} muted size={16}>{label}</Label>
                      <Label host={host} strong size={18}>{value}</Label>
                    </View>
                  ))}
                </View>
                <View style={mortgageLayout.leasingExampleFooter}>
                  <Button host={host} label="OK" onPress={() => setSheet(null)} />
                </View>
              </>
            : <>
                <Label host={host}>{sheet?.content}</Label>
                <Button host={host} label="OK" onPress={() => setSheet(null)} />
              </>}
        </Sheet>
        <Sheet
          host={host}
          title="Contact us for offer"
          visible={request}
          onClose={() => setRequest(false)}
        >
          <Label host={host}>
            {ready
              ? 'Your offer request is ready in this demo. No request has been sent.'
              : 'Your calculation is ready. To continue, contact a UniCredit Bank advisor. No request is sent from this demo.'}
          </Label>
          {!ready ? <Money host={host} value={amount} currency={currency} /> : null}
          <Button
            host={host}
            label={ready ? 'Done' : 'Continue'}
            onPress={() => (ready ? setRequest(false) : setReady(true))}
          />
        </Sheet>
      </Page>
    );
  }
  if (energyEfficiencyLoan) {
    const energyTerm = FUTURE_GAIN_ENERGY_EFFICIENCY_LOAN.termMonths;
    return (
      <Page
        host={{ ...host, onBack }}
        title="Energy Efficiency Loan"
        trailing={
          <IconAction
            host={host}
            name="help-circle"
            label="About energy efficiency loans"
            onPress={() => setSheet({
              title: 'About energy efficiency loans',
              content: 'This indicative calculation is based on the loan amount, term, rate type and insurance option selected. The final offer depends on the Bank’s assessment and current terms.',
            })}
          />
        }
        contentContainerStyle={mortgageLayout.content}
        footer={
          <Footer host={host}>
            <Button
              host={host}
              label="Contact us for offer"
              onPress={() => {
                setReady(false);
                setRequest(true);
              }}
            />
          </Footer>
        }
      >
        <View style={mortgageLayout.intro}>
          <Label host={host} size={16}>
            Discover options tailored to your needs, estimate your monthly
            installment, and make your home more energy-efficient with EU
            incentives and an Energy Efficiency Loan.
          </Label>
        </View>
        <View
          style={[
            mortgageLayout.calculationHeading,
            { borderBottomColor: host.tokens.border },
          ]}
        >
          <Label host={host} strong size={18}>LOAN CALCULATION</Label>
        </View>
        <View style={mortgageLayout.rateChoices}>
          {[
            { id: 'combined' as const, label: 'Fixed rate' },
            { id: 'variable' as const, label: 'Variable rate' },
          ].map(option => {
            const selected = rateMode === option.id;
            return (
              <Pressable
                key={option.id}
                accessibilityRole="radio"
                accessibilityLabel={option.label}
                accessibilityState={{ checked: selected }}
                onPress={() => setRateMode(option.id)}
                style={[
                  mortgageLayout.rateChoice,
                  {
                    borderColor: selected ? host.tokens.accent : host.tokens.border,
                    borderWidth: selected ? 2 : 1,
                  },
                ]}
              >
                <Label
                  host={{ ...host, tokens: { ...host.tokens, text: host.tokens.accent } }}
                  strong
                  size={16}
                >
                  {option.label}
                </Label>
              </Pressable>
            );
          })}
        </View>
        <View style={mortgageLayout.amountRow}>
          <FormField
            tokens={host.tokens}
            label="Loan amount"
            value={amountText}
            onChange={setAmount}
            inputProps={{ keyboardType: 'number-pad' }}
            containerStyle={mortgageLayout.amountField}
          />
          <View accessibilityLabel="Currency RSD" style={mortgageLayout.currency}>
            <Label host={host} muted size={14}>Currency</Label>
            <Label host={host} size={18}>RSD</Label>
          </View>
        </View>
        <View style={mortgageLayout.amountChips}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={mortgageLayout.chipRail}
          >
            {FUTURE_GAIN_ENERGY_EFFICIENCY_LOAN.quickAmounts.map(value => {
              const selected = amount === value;
              return (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityLabel={value.toLocaleString('sr-RS')}
                  accessibilityState={{ selected }}
                  onPress={() => setAmount(String(value))}
                  style={[
                    mortgageLayout.amountChip,
                    {
                      backgroundColor: selected
                        ? host.tokens.accent
                        : sourceColor('var(--uc-neutral-100, #F5F5F5)', host.mode === 'dark'),
                      borderColor: selected ? host.tokens.accent : 'transparent',
                    },
                  ]}
                >
                  <Label
                    host={{
                      ...host,
                      tokens: { ...host.tokens, text: selected ? host.tokens.inverse : host.tokens.text },
                    }}
                    strong
                    size={14}
                  >
                    {value.toLocaleString('sr-RS')}
                  </Label>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
        <View style={mortgageLayout.tenor}>
          <Label host={host} strong size={14}>TENOR</Label>
          <View style={mortgageLayout.tenorCounter}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Decrease tenor"
              onPress={() => setTerm(value => Math.max(energyTerm.min, value - energyTerm.step))}
              style={mortgageLayout.tenorButton}
            >
              <Label host={host} strong size={20}>−</Label>
            </Pressable>
            <View style={mortgageLayout.tenorValue}>
              <Label host={host} strong size={18}>{term}</Label>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Increase tenor"
              onPress={() => setTerm(value => Math.min(energyTerm.max, value + energyTerm.step))}
              style={mortgageLayout.tenorButton}
            >
              <Label host={host} strong size={20}>+</Label>
            </Pressable>
          </View>
          <SourceRangeSlider
            label="Tenor"
            min={energyTerm.min}
            max={energyTerm.max}
            step={energyTerm.step}
            value={term}
            onChange={setTerm}
            color={sourceColor('var(--uc-action-strong)', host.mode === 'dark')}
            presentation="feedback"
          />
          <View style={mortgageLayout.tenorRange}>
            <Label host={host} size={14}>{energyTerm.min} months</Label>
            <Label host={host} size={14}>{energyTerm.max} months</Label>
          </View>
        </View>
        <View style={mortgageLayout.termChips}>
          {periods.map(value => {
            const selected = value === term;
            return (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityLabel={`${value} months`}
                accessibilityState={{ selected }}
                onPress={() => setTerm(value)}
                style={[
                  mortgageLayout.termChip,
                  {
                    backgroundColor: selected
                      ? host.tokens.accent
                      : sourceColor('var(--uc-neutral-100, #F5F5F5)', host.mode === 'dark'),
                    borderColor: selected ? host.tokens.accent : 'transparent',
                  },
                ]}
              >
                <Label
                  host={{ ...host, tokens: { ...host.tokens, text: selected ? host.tokens.inverse : host.tokens.text } }}
                  strong
                  size={14}
                >
                  {value}
                </Label>
              </Pressable>
            );
          })}
        </View>
        <View style={mortgageLayout.insuranceRow}>
          <Label host={host} strong size={16} style={mortgageLayout.insuranceLabel}>
            LOAN INSURANCE
          </Label>
          <ToggleButton
            ariaLabel="Loan insurance"
            checked={loanInsurance}
            onToggle={setLoanInsurance}
            dark={host.mode === 'dark'}
          />
        </View>
        {quote ? (
          <View style={mortgageLayout.results}>
            <View style={mortgageLayout.resultsHeading}>
              <Label host={host} strong size={18}>CALCULATION RESULTS</Label>
            </View>
            <View style={mortgageLayout.resultItem}>
              <Label host={host} size={16}>Monthly installment</Label>
              <Money host={host} value={quote.monthlyPayment ?? 0} currency="RSD" size={18} />
            </View>
            {quote.monthlyLoanInsurance !== null ? (
              <View style={mortgageLayout.resultItem}>
                <Label host={host} size={16}>Monthly loan insurance</Label>
                <Money host={host} value={quote.monthlyLoanInsurance} currency="RSD" size={18} />
              </View>
            ) : null}
            <View style={mortgageLayout.resultItem}>
              <Label host={host} size={16}>Total principal + interest</Label>
              <Money host={host} value={quote.totalAmount ?? 0} currency="RSD" size={18} />
            </View>
            <View style={mortgageLayout.estimateCopy}>
              <Label host={host} muted size={14} style={mortgageLayout.estimateNote}>
                The effective interest rate (EIR) is calculated as at 01.09.2026.
              </Label>
              <Label host={host} strong size={16} style={mortgageLayout.estimateWarning}>
                Attention! Borrowing money costs money.
              </Label>
              <Label host={host} muted size={14} style={mortgageLayout.estimateLegal}>
                The interest rate is variable during the loan repayment period; therefore, the contractual relationship is subject to a reference interest rate over which the Bank has no control. As the interest rate is variable over this period, it is reasonable to expect that, over the longer duration of the contractual relationship, the amount of the instalment applicable on the date of contracting may fluctuate both upwards and downwards. Consequently, both parties to the agreement are equally exposed to interest rate risk, and by entering into a loan agreement with a variable interest rate, the borrower assumes the risk of changes in the amount of the calculated instalment depending on movements in the reference interest rate.
              </Label>
            </View>
          </View>
        ) : null}
        <View style={mortgageLayout.disclosures}>
          {[
            {
              id: 'energy-examples',
              title: 'REPRESENTATIVE EXAMPLES',
              body: `Illustration based on a ${amount.toLocaleString('sr-RS')} RSD loan over ${term} months. The rate and insurance amount may change according to the selected options and final Bank offer.`,
            },
            {
              id: 'energy-information',
              title: 'ADDITIONAL INFORMATION ABOUT ENERGY EFFICIENCY LOAN',
              body: 'Eligibility, EU incentives, insurance, fees and the final repayment schedule are confirmed by the Bank as part of the offer and agreement.',
            },
          ].map(disclosure => {
            const expanded = expandedMortgageInfo === disclosure.id;
            return (
              <React.Fragment key={disclosure.id}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={disclosure.title}
                  accessibilityState={{ expanded }}
                  onPress={() => setExpandedMortgageInfo(expanded ? null : disclosure.id)}
                  style={mortgageLayout.disclosure}
                >
                  <Label host={host} strong style={mortgageLayout.disclosureTitle}>
                    {disclosure.title}
                  </Label>
                  <View style={mortgageLayout.disclosureIcon}>
                    <SourceCustomIcon
                      name={expanded ? 'chevron-down' : 'chevron-right'}
                      size={16}
                      color={host.tokens.text}
                    />
                  </View>
                </Pressable>
                {expanded ? (
                  <Label host={host} muted style={mortgageLayout.disclosureBody}>
                    {disclosure.body}
                  </Label>
                ) : null}
              </React.Fragment>
            );
          })}
        </View>
        <Sheet
          host={host}
          title={sheet?.title ?? ''}
          visible={!!sheet}
          onClose={() => setSheet(null)}
        >
          <Label host={host}>{sheet?.content}</Label>
          <Button host={host} label="OK" onPress={() => setSheet(null)} />
        </Sheet>
        <Sheet
          host={host}
          title="Request offer"
          visible={request}
          onClose={() => setRequest(false)}
        >
          <Label host={host}>
            {ready
              ? 'Your offer request is ready in this demo. No request has been sent.'
              : 'Your calculation is ready. To continue, contact a UniCredit Bank advisor. No request is sent from this demo.'}
          </Label>
          {!ready ? <Money host={host} value={amount} currency="RSD" /> : null}
          <Button
            host={host}
            label={ready ? 'Done' : 'Continue'}
            onPress={() => (ready ? setRequest(false) : setReady(true))}
          />
        </Sheet>
      </Page>
    );
  }
  if (kind === 'mortgage') {
    const abroadLoan = product.id === 'real-estate-abroad';
    const mortgageTerm = model.termMonths!;
    const mortgageRates = [
      { id: 'combined' as const, label: 'Combined rate' },
      { id: 'variable' as const, label: 'Variable rate' },
    ];
    const mortgageAmounts = [70_000, 100_000, 200_000, 500_000];
    return (
      <Page
        host={{ ...host, onBack }}
        title={product.title}
        trailing={
          <IconAction
            host={host}
            name="help-circle"
            label={
              abroadLoan
                ? 'About loans for purchasing real estate abroad'
                : 'About housing loans'
            }
            onPress={() =>
              setSheet({
                title: abroadLoan
                  ? 'About loans for purchasing real estate abroad'
                  : 'About housing loans',
                content:
                  'This indicative calculation is based on the amount, term and rate type selected. The final offer depends on the Bank’s assessment and current terms.',
              })
            }
          />
        }
        contentContainerStyle={mortgageLayout.content}
        footer={
          <Footer host={host}>
            <Button
              host={host}
              label="Contact us for offer"
              onPress={() => {
                setReady(false);
                setRequest(true);
              }}
            />
          </Footer>
        }
      >
        <View style={mortgageLayout.intro}>
          <Label host={host} size={16}>
            <Text style={{ fontFamily: host.tokens.strongFont }}>
              Your home, your future.
            </Text>{' '}
            Discover mortgage options tailored to your needs and calculate an
            indicative monthly installment. Take the next step toward your new
            home.
          </Label>
        </View>
        <View
          style={[
            mortgageLayout.calculationHeading,
            { borderBottomColor: host.tokens.border },
          ]}
        >
          <Label host={host} strong size={18}>LOAN CALCULATION</Label>
        </View>
        <View style={mortgageLayout.rateChoices}>
          {mortgageRates.map(option => {
            const selected = rateMode === option.id;
            return (
              <Pressable
                key={option.id}
                accessibilityRole="radio"
                accessibilityLabel={option.label}
                accessibilityState={{ checked: selected }}
                onPress={() => setRateMode(option.id)}
                style={[
                  mortgageLayout.rateChoice,
                  {
                    borderColor: selected
                      ? host.tokens.accent
                      : host.tokens.border,
                    borderWidth: selected ? 2 : 1,
                  },
                ]}
              >
                <Label
                  host={{
                    ...host,
                    tokens: { ...host.tokens, text: host.tokens.accent },
                  }}
                  strong
                  size={16}
                >
                  {option.label}
                </Label>
              </Pressable>
            );
          })}
        </View>
        <View style={mortgageLayout.amountRow}>
          <FormField
            tokens={host.tokens}
            label="Loan amount"
            value={amountText}
            onChange={setAmount}
            inputProps={{ keyboardType: 'number-pad' }}
            containerStyle={mortgageLayout.amountField}
          />
          <View accessibilityLabel="Currency EUR" style={mortgageLayout.currency}>
            <Label host={host} muted size={14}>Currency</Label>
            <Label host={host} size={18}>EUR</Label>
          </View>
        </View>
        <View style={mortgageLayout.amountChips}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={mortgageLayout.chipRail}
          >
            {mortgageAmounts.map(value => {
              const selected = amount === value;
              return (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityLabel={value.toLocaleString('sr-RS')}
                  accessibilityState={{ selected }}
                  onPress={() => setAmount(String(value))}
                  style={[
                    mortgageLayout.amountChip,
                    {
                      backgroundColor: selected
                        ? host.tokens.accent
                        : sourceColor('var(--uc-neutral-100, #F5F5F5)', host.mode === 'dark'),
                      borderColor: selected ? host.tokens.accent : 'transparent',
                    },
                  ]}
                >
                  <Label
                    host={{
                      ...host,
                      tokens: {
                        ...host.tokens,
                        text: selected ? host.tokens.inverse : host.tokens.text,
                      },
                    }}
                    strong
                    size={14}
                  >
                    {value.toLocaleString('sr-RS')}
                  </Label>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
        <View style={mortgageLayout.tenor}>
          <Label host={host} strong size={14}>TENOR</Label>
          <View style={mortgageLayout.tenorCounter}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Decrease tenor"
              onPress={() => setTerm(value => Math.max(mortgageTerm.min, value - mortgageTerm.step))}
              style={mortgageLayout.tenorButton}
            >
              <Label host={host} strong size={20}>−</Label>
            </Pressable>
            <View style={mortgageLayout.tenorValue}>
              <Label host={host} strong size={18}>{term}</Label>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Increase tenor"
              onPress={() => setTerm(value => Math.min(mortgageTerm.max, value + mortgageTerm.step))}
              style={mortgageLayout.tenorButton}
            >
              <Label host={host} strong size={20}>+</Label>
            </Pressable>
          </View>
          <SourceRangeSlider
            label="Tenor"
            min={mortgageTerm.min}
            max={mortgageTerm.max}
            step={mortgageTerm.step}
            value={term}
            onChange={setTerm}
            color={sourceColor('var(--uc-action-strong)', host.mode === 'dark')}
            presentation="feedback"
          />
          <View style={mortgageLayout.tenorRange}>
            <Label host={host} size={14}>Min. {mortgageTerm.min} months</Label>
            <Label host={host} size={14}>Max. {mortgageTerm.max} months</Label>
          </View>
        </View>
        <View style={mortgageLayout.termChips}>
          {periods.map(value => {
            const selected = value === term;
            return (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityLabel={`${value} months`}
                accessibilityState={{ selected }}
                onPress={() => setTerm(value)}
                style={[
                  mortgageLayout.termChip,
                  {
                    backgroundColor: selected
                      ? host.tokens.accent
                      : sourceColor('var(--uc-neutral-100, #F5F5F5)', host.mode === 'dark'),
                    borderColor: selected ? host.tokens.accent : 'transparent',
                  },
                ]}
              >
                <Label
                  host={{
                    ...host,
                    tokens: {
                      ...host.tokens,
                      text: selected ? host.tokens.inverse : host.tokens.text,
                    },
                  }}
                  strong
                  size={14}
                >
                  {value}
                </Label>
              </Pressable>
            );
          })}
        </View>
        {quote ? (
          <View style={mortgageLayout.results}>
            <View style={mortgageLayout.resultsHeading}>
              <Label host={host} strong size={18}>CALCULATION RESULTS</Label>
            </View>
            <View style={mortgageLayout.resultItem}>
              <Label host={host} size={16}>Monthly installment</Label>
              <Money host={host} value={quote.monthlyPayment ?? 0} currency="EUR" size={18} />
              {rateMode === 'combined' && quote.monthlyPaymentAfterFixedPeriod !== null ? (
                <>
                  <Label host={host} muted size={14}>Fixed for the first 60 months</Label>
                  <Money host={host} value={quote.monthlyPaymentAfterFixedPeriod} currency="EUR" size={18} />
                  <Label host={host} muted size={14}>After 60 months</Label>
                </>
              ) : null}
            </View>
            <View style={mortgageLayout.resultItem}>
              <Label host={host} size={16}>Total principal + interest</Label>
              <Money host={host} value={quote.totalAmount ?? 0} currency="EUR" size={18} />
            </View>
            <View style={mortgageLayout.estimateCopy}>
              <Label host={host} muted size={14} style={mortgageLayout.estimateNote}>
                The effective interest rate (EIR) is calculated as at 01.09.2026.
              </Label>
              <Label host={host} strong size={16} style={mortgageLayout.estimateWarning}>
                Attention! Borrowing money costs money.
              </Label>
              <Label host={host} muted size={14} style={mortgageLayout.estimateLegal}>
                The interest rate is variable during the loan repayment period; therefore, the contractual relationship is subject to a reference interest rate over which the Bank has no control. As the interest rate is variable over this period, it is reasonable to expect that, over the longer duration of the contractual relationship, the amount of the instalment applicable on the date of contracting may fluctuate both upwards and downwards. Consequently, both parties to the agreement are equally exposed to interest rate risk, and by entering into a loan agreement with a variable interest rate, the borrower assumes the risk of changes in the amount of the calculated instalment depending on movements in the reference interest rate.
              </Label>
            </View>
          </View>
        ) : null}
        <View style={mortgageLayout.disclosures}>
          {[
            {
              id: 'representative',
              title: 'REPRESENTATIVE EXAMPLE',
              body: `Illustration based on a ${amount.toLocaleString('sr-RS')} EUR loan over ${term} months. The interest rate and monthly installment may change according to the selected rate type and final Bank offer.`,
            },
            {
              id: 'additional',
              title: abroadLoan
                ? 'ADDITIONAL INFORMATIONAL ABOUT LOAN FOR PURCHASING REAL ESTATE ABROAD'
                : 'ADDITIONAL INFORMATION ABOUT HOUSING LOAN',
              body: 'Eligibility, collateral, fees and the final repayment schedule are confirmed by the Bank as part of the offer and agreement.',
            },
          ].map(disclosure => {
            const expanded = expandedMortgageInfo === disclosure.id;
            return (
              <React.Fragment key={disclosure.id}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={disclosure.title}
                  accessibilityState={{ expanded }}
                  onPress={() => setExpandedMortgageInfo(expanded ? null : disclosure.id)}
                  style={mortgageLayout.disclosure}
                >
                  <Label host={host} strong style={mortgageLayout.disclosureTitle}>
                    {disclosure.title}
                  </Label>
                  <View style={mortgageLayout.disclosureIcon}>
                    <SourceCustomIcon
                      name={expanded ? 'chevron-down' : 'chevron-right'}
                      size={16}
                      color={host.tokens.text}
                    />
                  </View>
                </Pressable>
                {expanded ? (
                  <Label host={host} muted style={mortgageLayout.disclosureBody}>
                    {disclosure.body}
                  </Label>
                ) : null}
              </React.Fragment>
            );
          })}
        </View>
        <Sheet
          host={host}
          title={sheet?.title ?? ''}
          visible={!!sheet}
          onClose={() => setSheet(null)}
        >
          <Label host={host}>{sheet?.content}</Label>
          <Button host={host} label="OK" onPress={() => setSheet(null)} />
        </Sheet>
        <Sheet
          host={host}
          title="Request offer"
          visible={request}
          onClose={() => setRequest(false)}
        >
          <Label host={host}>
            {ready
              ? 'Your offer request is ready in this demo. No request has been sent.'
              : 'Your calculation is ready. To continue, contact a UniCredit Bank advisor. No request is sent from this demo.'}
          </Label>
          {!ready ? <Money host={host} value={amount} currency="EUR" /> : null}
          <Button
            host={host}
            label={ready ? 'Done' : 'Continue'}
            onPress={() => (ready ? setRequest(false) : setReady(true))}
          />
        </Sheet>
      </Page>
    );
  }
  return (
    <Page
      host={{ ...host, onBack }}
      title={product.title}
      trailing={
        <IconAction
          host={host}
          name="help-circle"
          label="About this estimate"
          onPress={() =>
            setSheet({
              title: 'About this estimate',
              content:
                'This calculator uses illustrative demo rates and the amount and term you selected. It does not check eligibility, include every fee or create a binding offer.',
            })
          }
        />
      }
      footer={
        <Footer host={host}>
          <Button
            host={host}
            label="Request offer"
            onPress={() => {
              setReady(false);
              setRequest(true);
            }}
          />
        </Footer>
      }
    >
      <Section host={host} title={heading} />
      <FormField
        tokens={host.tokens}
        label={
          kind === 'term-deposit'
            ? 'Deposit amount'
            : kind === 'investment-fund'
            ? 'Investment amount'
            : 'Loan amount'
        }
        value={amountText}
        onChange={setAmount}
        inputProps={{ keyboardType: 'number-pad' }}
      />
      <Button
        host={host}
        secondary
        label={`Change currency, currently ${currency}`}
        onPress={() => setPicker(true)}
      />
      <Chips
        host={host}
        value={amount}
        items={amounts.map(value => ({
          value,
          label: value.toLocaleString('sr-RS'),
        }))}
        onChange={value => setAmount(String(value))}
      />
      {model.termMonths ? (
        <>
          <FormField
            tokens={host.tokens}
            label="Duration in months"
            value={String(term)}
            onChange={value => setTerm(Number(value) || model.termMonths!.min)}
            inputProps={{ keyboardType: 'number-pad' }}
          />
          <SourceRangeSlider label={kind === 'cash-loan' ? 'Tenor' : 'Term'} min={model.termMonths.min} max={model.termMonths.max} step={model.termMonths.step} value={term} onChange={setTerm} color={sourceColor('var(--uc-action-strong)',host.tokens.background === '#121212')}/>
          <View style={{flexDirection:'row',justifyContent:'space-between'}}><Label host={host}>{model.termMonths.min} months</Label><Label host={host}>{model.termMonths.max} months</Label></View>
          <Chips
            host={host}
            value={term}
            items={periods.map(value => ({ value, label: `${value} months` }))}
            onChange={setTerm}
          />
        </>
      ) : null}
      <Section
        host={host}
        title={
          model.simulation === 'installment' ? 'LOAN CALCULATION' : heading
        }
      />
      {quote ? (
        <View style={[s.panel, { backgroundColor: host.tokens.background }]}>
          <Fact
            host={host}
            label="Indicative rate"
            value={`${quote.ratePercent.toFixed(2)}%`}
          />
          {quote.monthlyPayment !== null ? (
            <Fact
              host={host}
              label="Monthly installment"
              value={
                <Money
                  host={host}
                  value={quote.monthlyPayment}
                  currency={currency}
                />
              }
            />
          ) : null}
          {quote.monthlyPaymentAfterFixedPeriod !== null ? (
            <Fact
              host={host}
              label="After 60 months"
              value={
                <Money
                  host={host}
                  value={quote.monthlyPaymentAfterFixedPeriod}
                  currency={currency}
                />
              }
            />
          ) : null}
          {quote.estimatedReturn !== null ? (
            <Fact
              host={host}
              label="Estimated return"
              value={
                <Money
                  host={host}
                  value={quote.estimatedReturn}
                  currency={currency}
                />
              }
            />
          ) : null}
          <Fact
            host={host}
            label={
              model.simulation === 'installment'
                ? 'Total principal + interest'
                : 'Estimated amount at maturity'
            }
            value={
              <Money
                host={host}
                value={quote.totalAmount ?? 0}
                currency={currency}
              />
            }
          />
        </View>
      ) : (
        <Label host={host} muted>
          The selected amount and term are outside this demo’s rate range.
        </Label>
      )}
      <Label host={host} muted size={14}>
        Indicative demo estimate. The final offer may differ.
      </Label>
      {disclosures.map(disclosure => (
        <Row
          key={disclosure.title}
          host={host}
          title={disclosure.title}
          onPress={() => setSheet(disclosure)}
        />
      ))}
      {picker ? (
        <Picker
          host={host}
          title="Select currency"
          visible
          current={currency}
          items={(['EUR', 'RSD'] as const).map(value => ({
            value,
            label: value,
          }))}
          onClose={() => setPicker(false)}
          onConfirm={value => {
            if (value !== currency) {
              const next =
                model.amountRanges.find(item => item.currency === value) ??
                model.amountRanges[0]!;
              setCurrency(value);
              setAmount(
                String(Math.min(next.max, Math.max(next.min, next.suggested))),
              );
            }
          }}
        />
      ) : null}
      <Sheet
        host={host}
        title={sheet?.title ?? ''}
        visible={!!sheet}
        onClose={() => setSheet(null)}
      >
        <Label host={host}>{sheet?.content}</Label>
        <Button host={host} label="OK" onPress={() => setSheet(null)} />
      </Sheet>
      <Sheet
        host={host}
        title="Request offer"
        visible={request}
        onClose={() => setRequest(false)}
      >
        <Label host={host}>
          {ready
            ? 'Your offer request is ready in this demo. No request has been sent.'
            : 'Your calculation is ready. To continue, contact a UniCredit Bank advisor. No request is sent from this demo.'}
        </Label>
        {!ready ? (
          <Money host={host} value={amount} currency={currency} />
        ) : null}
        <Button
          host={host}
          label={ready ? 'Done' : 'Continue'}
          onPress={() => (ready ? setRequest(false) : setReady(true))}
        />
      </Sheet>
    </Page>
  );
}
