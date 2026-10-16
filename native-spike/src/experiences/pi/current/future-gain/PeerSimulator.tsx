import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import {
  MY_BANKER_RETAIL_CATALOGUE,
  type MyBankerCurrency,
} from '@/data/myBankerCore';
import {
  calculateFutureGainPeerSimulation,
  getFutureGainPeerSimulatorPreset,
  type FutureGainPeerProduct,
} from '@/features/investments/future-gain/peerInsights';
import {
  Page,
  Title,
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
  { title: 'Credit card features', content: 'Flexia Mastercard can be used for everyday purchases, online payments and installment purchases. The available features depend on the selected card and the Bank’s current terms.' },
  { title: 'Terms & conditions & collateral', content: 'Eligibility, fees, interest and other terms are confirmed by UniCredit Bank in the offer and final card agreement.' },
  { title: 'Representative example for purchases in installments', content: 'The representative example for installment purchases depends on the purchase amount, selected installment plan, fees and the terms applicable when the transaction is made.' },
  { title: 'Representative example for revolving credit usage', content: 'The cost of revolving credit depends on the amount used, repayment and the interest rate in the final agreement.' },
];
const creditBenefits: [string, string][] = [
  [
    'Looking for a simple way to pay in installments?',
    'Split purchases into interest-free installments, just like paying by cheque.',
  ],
  [
    'Want to shop online with more flexibility?',
    'Make secure online purchases and pay in installments.',
  ],
  [
    'Need a card for everyday spending?',
    'Use this card for daily purchases wherever cards are accepted.',
  ],
  [
    'Need quick access to cash?',
    'Get immediate funds through a solution that is more flexible and convenient than a cash loan.',
  ],
];
const creditLayout = StyleSheet.create({
  optionsHeading: { marginBottom: 24 },
  options: { flexDirection: 'row', gap: 16, paddingHorizontal: 24 },
  option: {
    flex: 1,
    minWidth: 0,
    borderRadius: 4,
    padding: 12,
    gap: 8,
    alignItems: 'flex-start',
  },
  optionImage: { width: 81, height: 51, alignSelf: 'center' },
  optionLabel: { fontSize: 14, lineHeight: 18 },
  optionPlaceholder: { fontSize: 14, lineHeight: 18 },
  benefits: { paddingHorizontal: 24, paddingTop: 24, gap: 16 },
  benefitsHeading: { fontSize: 18, lineHeight: 24 },
  benefit: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bullet: { width: 16, fontSize: 16, lineHeight: 20 },
  benefitCopy: { flex: 1, gap: 4 },
  benefitTitle: { fontSize: 14, lineHeight: 18 },
  benefitBody: { fontSize: 14, lineHeight: 18 },
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
  const preset = getFutureGainPeerSimulatorPreset(kind);
  const model =
    MY_BANKER_RETAIL_CATALOGUE.find(item => item.key === kind) ??
    MY_BANKER_RETAIL_CATALOGUE[0]!;
  const [currency, setCurrency] = useState<MyBankerCurrency>('EUR');
  const [amountText, setAmount] = useState(String(preset.amount));
  const [term, setTerm] = useState(preset.termMonths);
  const [rateMode, setRateMode] = useState<'combined' | 'variable'>('combined');
  const [picker, setPicker] = useState(false);
  const [sheet, setSheet] = useState<{ title: string; content: string } | null>(
    null,
  );
  const [request, setRequest] = useState(false);
  const [ready, setReady] = useState(false);
  const [card, setCard] = useState<'flexia' | 'platinum'>('flexia');
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
  });
  const amounts =
    kind === 'mortgage' && currency === 'EUR'
      ? [70000, 100000, 200000, 500000]
      : range
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
    kind === 'mortgage'
      ? [60, 120, 240, 360]
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
  if (kind === 'credit-card')
    return (
      <Page
        host={{ ...host, onBack }}
        title="Credit Card"
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
          <Footer host={host}>
            <Button
              host={host}
              label="Call us for offer"
              onPress={() =>
                setSheet({
                  title: 'Call us for offer',
                  content:
                    'A UniCredit Bank advisor can help you choose a credit card. No call is started in this demo.',
                })
              }
            />
          </Footer>
        }
      >
        <Label host={host} strong size={14} style={creditLayout.optionsHeading}>
          Choose your type of Credit Card.
        </Label>
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
        <View style={creditLayout.benefits}>
          <Label
            host={host}
            strong
            size={18}
            style={creditLayout.benefitsHeading}
          >
            {`Why should ${cardName} be your first choice?`}
          </Label>
          {creditBenefits.map(([title, body], index) => (
            <View
              key={title}
              testID="future-gain-peer-credit-benefit"
              style={creditLayout.benefit}
            >
              <Label host={host} style={creditLayout.bullet}>
                •
              </Label>
              <View style={creditLayout.benefitCopy}>
                <Label
                  host={host}
                  strong
                  style={creditLayout.benefitTitle}
                >
                  {title}
                </Label>
                <Label
                  host={host}
                  size={14}
                  muted
                  style={creditLayout.benefitBody}
                >
                  {index === 2 ? body.replace('this card', cardName) : body}
                </Label>
              </View>
            </View>
          ))}
        </View>
        {creditDisclosures.map(disclosure => (
          <Row
            key={disclosure.title}
            host={host}
            title={disclosure.title}
            onPress={() => setSheet(disclosure)}
          />
        ))}
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
      <Title host={host}>{product.title}</Title>
      <Section host={host} title={heading} />
      {kind === 'mortgage' ? (
        <View style={s.two}>
          <Button
            host={host}
            secondary
            label="Combined rate"
            onPress={() => setRateMode('combined')}
          />
          <Button
            host={host}
            secondary
            label="Variable rate"
            onPress={() => setRateMode('variable')}
          />
        </View>
      ) : null}
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
          <SourceRangeSlider label={kind==='mortgage'||kind==='cash-loan'?'Tenor':'Term'} min={model.termMonths.min} max={model.termMonths.max} step={model.termMonths.step} value={term} onChange={setTerm} color={sourceColor('var(--uc-action-strong)',host.tokens.background === '#121212')}/>
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
