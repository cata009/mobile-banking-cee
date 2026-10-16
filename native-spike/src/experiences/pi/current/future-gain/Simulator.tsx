import React, { useState } from 'react';
import { View } from 'react-native';
import {
  FUND_OPTIONS,
  STOCK_OPTIONS,
  INVESTMENT_CURRENCIES,
  INVESTMENT_DISCLAIMERS,
  INVESTMENT_INFO_STEPS,
  FUTURE_GAIN_REFERENCE_DATE,
  calculateFutureGainInvestmentIllustration,
  getFutureGainInvestmentSuggestions,
  parseFutureGainAmount,
  type FutureGainFundSimulatorState,
  type SimulatorKind,
  type SimulatorCurrency,
} from '@/features/investments/future-gain/smartInvestment';
import { convertCurrency, roundMoney } from '@/data/exchangeRates';
import { formatMoneyNumber } from '@/app/registry/countryConfig';
import type { CurrentScreenProps } from '../contracts';
import { BaselineAmountField } from '../../../../universal/BaselineAmountField';
import { BaselineTextField } from '../../../../universal/BaselineTextField';
import { sourceColor } from '../../../../universal/sourceColor';
import { futureGainAvailableBalance } from './model';
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
  Chips,
  Request,
  IconAction,
} from './Primitives';
export function Simulator({
  host,
  kind,
  onBack,
}: {
  host: CurrentScreenProps;
  kind: SimulatorKind;
  onBack: () => void;
}) {
  const options = kind === 'fund' ? FUND_OPTIONS : STOCK_OPTIONS;
  const resumeState =
    kind === 'fund' ? host.futureGainSimulatorResumeState ?? null : null;
  const initial =
    options.find(
      option =>
        option.id ===
        (resumeState?.securityId ?? host.route.params?.securityId),
    ) ?? options[0]!;
  const [securityId, setSecurity] = useState(initial.id);
  const selected =
    options.find(option => option.id === securityId) ?? options[0]!;
  const [currency, setCurrency] = useState<SimulatorCurrency>(
    INVESTMENT_CURRENCIES.find(
      value => value === (resumeState?.currency ?? host.route.params?.currency),
    ) ??
      selected.currency ??
      'EUR',
  );
  const [amountInput, setAmount] = useState(
    () =>
      resumeState?.amountInput ??
      host.route.params?.amountInput ??
      formatMoneyNumber(
        Math.min(5000, futureGainAvailableBalance(host, currency)),
        host.country,
      ),
  );
  const [picker, setPicker] = useState<'instrument' | 'currency' | null>(null);
  const [info, setInfo] = useState(false);
  const [request, setRequest] = useState(false);
  const amount = parseFutureGainAmount(amountInput);
  const available = futureGainAvailableBalance(host, currency);
  const quote = calculateFutureGainInvestmentIllustration({
    amount,
    availableBalance: available,
    option: selected,
  });
  const suggestions = getFutureGainInvestmentSuggestions(available, currency);
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const amountErrorDetails =
    amount > available
      ? `Available balance: ${formatMoneyNumber(
          roundMoney(available),
          host.country,
        )} ${currency}`
      : undefined;
  const title = kind === 'fund' ? 'Investment funds' : 'Stocks';
  const changeCurrency = (next: SimulatorCurrency) => {
    const nextAmount = roundMoney(convertCurrency(amount, currency, next));
    const balance = futureGainAvailableBalance(host, next);
    setCurrency(next);
    setAmount(
      formatMoneyNumber(
        Math.min(nextAmount || Math.min(5000, balance), balance),
        host.country,
      ),
    );
  };
  const selectSecurity = (id: string) => {
    const option = options.find(item => item.id === id) ?? options[0]!;
    setSecurity(option.id);
    if (kind === 'fund' && option.currency && option.currency !== currency)
      changeCurrency(option.currency);
  };
  if (request)
    return (
      <Request
        host={host}
        onBack={() => setRequest(false)}
        onDone={() => setRequest(false)}
      />
    );
  return (
    <Page
      host={{ ...host, onBack }}
      title={title}
      trailing={
        <IconAction
          host={host}
          name="help-circle"
          label={`About ${title.toLowerCase()}`}
          onPress={() => setInfo(true)}
        />
      }
      footer={
        <Footer host={host}>
          <Button
            host={host}
            label="Explore more"
            disabled={!quote.isAmountValid}
            onPress={() => {
              if (kind !== 'fund') {
                setRequest(true);
                return;
              }
              const state: FutureGainFundSimulatorState = {
                securityId: selected.id,
                amountInput,
                currency,
              };
              if (host.onFutureGainInvestmentFunds) {
                host.onFutureGainInvestmentFunds(state);
                return;
              }
              host.onNavigate({
                screen: 'investments',
                params: {
                  securityId: state.securityId,
                  futureGainAmountInput: state.amountInput,
                  futureGainCurrency: state.currency,
                  futureGainReturn: 'smart-investment',
                },
              });
            }}
          />
        </Footer>
      }
    >
      <Title host={host}>{title}</Title>
      <Section
        host={host}
        title={kind === 'fund' ? 'FUND CALCULATION' : 'STOCKS CALCULATION'}
      />
      <Label host={host} size={14}>
        {kind === 'fund'
          ? 'Choose your fund and amount, to see the expected interest and return.'
          : 'Choose your stock and amount to see the expected return.'}
      </Label>
      <BaselineTextField
        label={kind === 'fund' ? 'Fund' : 'Stock'}
        value={selected.name}
        onChange={() => undefined}
        readOnly
        ariaLabel={`Selected ${kind}: ${selected.name}`}
        trailingIconName="chevron-down-wide"
        trailingIconAction={{
          ariaLabel: kind === 'fund' ? 'Change fund' : 'Change stock',
          onClick: () => setPicker('instrument'),
        }}
        onActivate={() => setPicker('instrument')}
        dark={dark}
      />
      <BaselineAmountField
        label="Investment Amount"
        value={amountInput}
        onChange={setAmount}
        currency={currency}
        currencyLabel="Currency"
        currencyAriaLabel={`Change currency, currently ${currency}`}
        currencyIconName="chevron-down-wide"
        onCurrencyClick={() => setPicker('currency')}
        inputMode="decimal"
        ariaLabel={`Investment amount in ${currency}`}
        ariaInvalid={!quote.isAmountValid}
        helperText={
          !quote.amountError
            ? `Available balance ${formatMoneyNumber(
                roundMoney(available),
                host.country,
              )} ${currency}`
            : undefined
        }
        errorText={quote.amountError || undefined}
        errorText2={amountErrorDetails}
        onBlur={() => {
          if (amount > 0) setAmount(formatMoneyNumber(amount, host.country));
        }}
        dark={dark}
      />
      <Chips
        host={host}
        value={roundMoney(amount)}
        items={suggestions.map((value, index) => ({
          value,
          label:
            index === suggestions.length - 1
              ? 'ALL AVAILABLE'
              : formatMoneyNumber(value, host.country).replace(/[,.]00$/, ''),
        }))}
        onChange={value => setAmount(formatMoneyNumber(value, host.country))}
      />
      <Section host={host} title="REPRESENTATIVE EXAMPLE" />
      <Fact
        host={host}
        label="Potential annual return"
        value={
          quote.isAmountValid ? (
            <Money
              host={host}
              value={quote.potentialReturn}
              currency={currency}
            />
          ) : (
            '—'
          )
        }
      />
      <Fact
        host={host}
        label="Accumulated amount"
        value={
          quote.isAmountValid ? (
            <Money
              host={host}
              value={quote.accumulatedAmount}
              currency={currency}
            />
          ) : (
            '—'
          )
        }
      />
      <Fact
        host={host}
        label="Return rate"
        value={`${quote.annualReturnRate.toLocaleString('sr-RS', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 2,
        })}%`}
      />
      {kind === 'fund' ? (
        <Fact host={host} label="Entry fee" value="0%" />
      ) : null}
      <Fact host={host} label="Tenor" value="12 months" />
      <Fact
        host={host}
        label="Price updated at"
        value={FUTURE_GAIN_REFERENCE_DATE}
      />
      <Label host={host} muted size={14}>
        {INVESTMENT_DISCLAIMERS[kind]}
      </Label>
      {picker === 'instrument' ? (
        <Picker
          host={host}
          title={kind === 'fund' ? 'Select Fund' : 'Select Stock'}
          visible
          current={securityId}
          items={options.map(option => ({
            value: option.id,
            label: `${option.name}, ${option.selectionRate}%`,
          }))}
          onClose={() => setPicker(null)}
          onConfirm={selectSecurity}
        />
      ) : picker === 'currency' ? (
        <Picker
          host={host}
          title="Select currency"
          visible
          current={currency}
          items={INVESTMENT_CURRENCIES.map(value => ({ value, label: value }))}
          onClose={() => setPicker(null)}
          onConfirm={changeCurrency}
        />
      ) : null}
      <Sheet
        host={host}
        title={`About ${title.toLowerCase()}`}
        visible={info}
        onClose={() => setInfo(false)}
      >
        {INVESTMENT_INFO_STEPS[kind].map(step => (
          <View key={step.title}>
            <Label host={host} strong>
              {step.title}
            </Label>
            <Label host={host}>{step.description}</Label>
          </View>
        ))}
        <Button host={host} label="OK" onPress={() => setInfo(false)} />
      </Sheet>
    </Page>
  );
}
