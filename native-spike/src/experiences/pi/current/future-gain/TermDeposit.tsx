import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  calculateFutureGainDepositQuote,
  getFutureGainDepositSuggestions,
  parseFutureGainAmount,
  DEPOSIT_CURRENCIES,
  TENOR_OPTIONS,
  EXTERNAL_LIMITS,
  TERM_DEPOSIT_DISCLAIMER,
  SIMULATOR_STEPS,
  FUTURE_GAIN_REFERENCE_DATE,
  type DepositCurrency,
  type FundingSource,
  type TenorMonths,
} from '@/features/investments/future-gain/smartInvestment';
import currentBank from '@/assets/investments/term-deposit/current-bank.svg';
import externalBank from '@/assets/investments/term-deposit/external-bank.svg';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { convertCurrency, roundMoney } from '@/data/exchangeRates';
import {
  formatMoneyNumber,
  splitMoneyAmount,
} from '@/app/registry/countryConfig';
import type { CurrentScreenProps } from '../contracts';
import { futureGainAvailableBalance } from './model';
import { BaselineAmountField } from '../../../../universal/BaselineAmountField';
import { Text } from '../../../../universal/Typography';
import { sourceColor } from '../../../../universal/sourceColor';
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
  s,
} from './Primitives';

function opportunityAmountFontSize(
  amounts: readonly number[],
  country: CurrentScreenProps['country'],
) {
  const longestInteger = Math.max(
    ...amounts.map(amount => splitMoneyAmount(amount, country).integer.length),
  );
  return Math.max(16, 24 - Math.max(0, longestInteger - 8) * 1.5);
}

function OpportunityAmount({
  host,
  amount,
  currency,
  color,
  hidden,
  fontSize,
  prefix = '',
  align = 'left',
}: {
  host: CurrentScreenProps;
  amount: number;
  currency: DepositCurrency;
  color: string;
  hidden: boolean;
  fontSize: number;
  prefix?: string;
  align?: 'left' | 'right';
}) {
  const formatted = formatMoneyNumber(amount, host.country);
  const { integer, decimal } = splitMoneyAmount(amount, host.country);
  const decimalSeparator = formatted.slice(integer.length, integer.length + 1);
  return (
    <Text
      style={{
        color,
        fontFamily: 'UniCredit-bold',
        fontSize,
        lineHeight: fontSize * 1.2,
        textAlign: align,
      }}
    >
      {hidden ? '••••••' : `${prefix}${integer}`}
      <Text style={{ fontFamily: 'UniCredit-regular', fontSize: 14 }}>
        {hidden ? null : `${decimalSeparator}${decimal}`}
        <Text style={{ marginLeft: 2 }}>{currency}</Text>
      </Text>
    </Text>
  );
}

export function TermDeposit({
  host,
  onBack,
}: {
  host: CurrentScreenProps;
  onBack: () => void;
}) {
  const [currency, setCurrency] = useState<DepositCurrency>('EUR');
  const [source, setSource] = useState<FundingSource>('current');
  const [amountInput, setAmount] = useState(() =>
    formatMoneyNumber(
      Math.min(5000, futureGainAvailableBalance(host, 'EUR')),
      host.country,
    ),
  );
  const [tenor, setTenor] = useState<TenorMonths>(12);
  const [picker, setPicker] = useState(false);
  const [info, setInfo] = useState<
    'simulator' | 'opportunity' | 'nks' | 'eks' | null
  >(null);
  const [request, setRequest] = useState(false);
  const amount = parseFutureGainAmount(amountInput);
  const available = futureGainAvailableBalance(host, currency);
  const quote = calculateFutureGainDepositQuote({
    amount,
    currency,
    fundingSource: source,
    tenor,
  });
  const suggestions = getFutureGainDepositSuggestions(
    source === 'current' ? available : EXTERNAL_LIMITS[currency],
    currency,
    source,
  );
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const opportunityFontSize = opportunityAmountFontSize(
    [quote.averageUninvestedFunds, quote.potentialYield],
    host.country,
  );
  const changeCurrency = (next: DepositCurrency) => {
    const converted = roundMoney(convertCurrency(amount, currency, next));
    const base =
      source === 'current'
        ? futureGainAvailableBalance(host, next)
        : EXTERNAL_LIMITS[next];
    setCurrency(next);
    const updated =
      converted > 0
        ? converted
        : source === 'current'
        ? Math.min(5000, base)
        : 0;
    setAmount(updated > 0 ? formatMoneyNumber(updated, host.country) : '');
  };
  if (request)
    return (
      <Request host={host} onBack={() => setRequest(false)} onDone={onBack} />
    );
  return (
    <Page
      host={{ ...host, onBack }}
      title="Term deposit"
      trailing={
        <IconAction
          host={host}
          name="help-circle"
          label="About term deposit simulator"
          onPress={() => setInfo('simulator')}
        />
      }
      footer={
        <Footer host={host}>
          <Button
            host={host}
            label="Request offer"
            disabled={!quote.isAmountValid}
            onPress={() => setRequest(true)}
          />
        </Footer>
      }
    >
      <Title host={host}>Term deposit</Title>
      <View
        style={[
          s.panel,
          styles.opportunityPanel,
          {
            backgroundColor: sourceColor(
              'var(--uc-investment-reference-panel, #F5F5F5)',
              dark,
            ),
          },
        ]}
      >
        <View style={styles.opportunityHeading}>
          <View style={s.grow}>
            <Label host={host} strong>
              Missed investment opportunity
            </Label>
          </View>
          <IconAction
            host={host}
            name="info-circle"
            label="About the missed investment opportunity estimate"
            onPress={() => setInfo('opportunity')}
          />
        </View>
        <View style={styles.opportunityValues}>
          <View style={styles.opportunityColumn}>
            <Label host={host} size={14}>
              Average funds
            </Label>
            <OpportunityAmount
              host={host}
              amount={quote.averageUninvestedFunds}
              currency={currency}
              color={sourceColor('var(--uc-text)', dark)}
              hidden={host.amountsHidden}
              fontSize={opportunityFontSize}
            />
            <Label host={host} size={12}>
              left uninvested after monthly expenses
            </Label>
          </View>
          <View
            style={[
              styles.opportunityDivider,
              {
                backgroundColor: sourceColor('var(--uc-border-muted)', dark),
              },
            ]}
          />
          <View style={[styles.opportunityColumn, styles.yieldColumn]}>
            <Label host={host} size={14}>
              Potential yield
            </Label>
            <OpportunityAmount
              host={host}
              amount={quote.potentialYield}
              currency={currency}
              color={sourceColor(
                'var(--uc-investment-reference-positive, #3D7D43)',
                dark,
              )}
              hidden={host.amountsHidden}
              fontSize={opportunityFontSize}
              prefix="+"
              align="right"
            />
            <Label host={host} size={12}>
              for a 12M deposit
            </Label>
          </View>
        </View>
      </View>
      <Section host={host} title="DEPOSIT CALCULATION" />
      <Label host={host} size={14}>
        Choose your deposit type, currency, amount, and term to see the expected
        interest and return.
      </Label>
      <View style={styles.depositSourceGrid}>
        {(['current', 'external'] as const).map(value => (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityLabel={
              value === 'current'
                ? 'Current bank account'
                : 'External bank account'
            }
            accessibilityState={{ checked: source === value }}
            onPress={() => {
              if (value !== source) {
                setSource(value);
                if (value === 'external') setAmount('');
              }
            }}
            style={[
              s.panel,
              s.grow,
              s.bordered,
              styles.depositSource,
              {
                backgroundColor: sourceColor('var(--uc-surface)', dark),
                borderColor: sourceColor(
                  source === value
                    ? 'var(--uc-action)'
                    : 'var(--uc-border-muted)',
                  dark,
                ),
              },
            ]}
          >
            <View style={styles.depositIcon}>
              <AssetGlyph
                asset={value === 'current' ? currentBank : externalBank}
                size={20}
              />
            </View>
            <View style={styles.depositSourceCopy}>
              <Label
                host={{
                  ...host,
                  tokens: {
                    ...host.tokens,
                    text:
                      source === value ? host.tokens.accent : host.tokens.text,
                  },
                }}
                strong
                size={14}
              >
                {value === 'current'
                  ? 'Current bank\naccount'
                  : 'External bank\naccount'}
              </Label>
              <Label host={host} size={12}>
                {value === 'current'
                  ? 'Use your UniCredit account'
                  : 'Use an account at another bank'}
              </Label>
            </View>
          </Pressable>
        ))}
      </View>
      <BaselineAmountField
        label="Amount to deposit"
        value={amountInput}
        onChange={setAmount}
        currency={currency}
        currencyLabel="Currency"
        currencyAriaLabel={`Change currency, currently ${currency}`}
        currencyIconName="chevron-down-wide"
        onCurrencyClick={() => setPicker(true)}
        inputMode="decimal"
        ariaLabel={`Amount to deposit in ${currency}`}
        ariaInvalid={!quote.isAmountValid}
        helperText={
          quote.isAmountValid
            ? source === 'current'
              ? 'Available balance'
              : 'Enter the amount you want to simulate.'
            : undefined
        }
        helperText2={
          quote.isAmountValid && source === 'current'
            ? `${formatMoneyNumber(available, host.country)} ${currency}`
            : undefined
        }
        errorText={
          !quote.isAmountValid ? 'Enter an amount to continue.' : undefined
        }
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
            source === 'current' && index === suggestions.length - 1
              ? 'ALL AVAILABLE'
              : formatMoneyNumber(value, host.country).replace(/[,.]00$/, ''),
        }))}
        onChange={value => setAmount(formatMoneyNumber(value, host.country))}
      />
      <Label host={host} muted size={14}>
        Select the preferred tenor
      </Label>
      {TENOR_OPTIONS.map(months => (
        <Pressable
          key={months}
          accessibilityRole="radio"
          accessibilityLabel={`${months} months`}
          accessibilityState={{ checked: tenor === months }}
          onPress={() => setTenor(months)}
          style={s.pickerRow}
        >
          <SourceCustomIcon
            name={tenor === months ? 'radio-selected' : 'radio-unselected'}
            size={24}
            color={host.tokens.text}
          />
          <Label host={host}>{months} months</Label>
        </Pressable>
      ))}
      <Section host={host} title="REPRESENTATIVE EXAMPLE" />
      <Fact
        host={host}
        label="Amount"
        value={
          quote.isAmountValid ? (
            <Money host={host} value={amount} currency={currency} />
          ) : (
            '—'
          )
        }
      />
      <Fact host={host} label="Tenor" value={`${tenor} months`} />
      <Fact
        host={host}
        label="Fixed NKS (Nominal interest rate)"
        value={`${quote.rates.nominal.toLocaleString('sr-RS', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 2,
        })}%`}
        trailing={
          <IconAction
            host={host}
            name="info-circle"
            label="What is NKS?"
            onPress={() => setInfo('nks')}
          />
        }
      />
      <Fact
        host={host}
        label="EKS (Effective interest rate)"
        value={`${((quote.rates.effective * tenor) / 12).toLocaleString(
          'sr-RS',
          { minimumFractionDigits: 2, maximumFractionDigits: 2 },
        )}%`}
        trailing={
          <IconAction
            host={host}
            name="info-circle"
            label="What is EKS?"
            onPress={() => setInfo('eks')}
          />
        }
      />
      <Fact
        host={host}
        label="Total deposit amount and gross interest at maturity"
        value={
          quote.isAmountValid ? (
            <Money
              host={host}
              value={quote.grossMaturity}
              currency={currency}
            />
          ) : (
            '—'
          )
        }
      />
      <Fact
        host={host}
        label="Tax"
        value={<Money host={host} value={quote.tax} currency={currency} />}
      />
      <Fact
        host={host}
        label="Net deposit amount and interest at maturity"
        value={
          quote.isAmountValid ? (
            <Money host={host} value={quote.netMaturity} currency={currency} />
          ) : (
            '—'
          )
        }
      />
      <Fact host={host} label="Criteria for index deposit" value="0" />
      <Fact host={host} label="Cost payable by the Client" value="0" />
      <Fact
        host={host}
        label="Price updated at"
        value={FUTURE_GAIN_REFERENCE_DATE}
      />
      <Label host={host} muted size={14}>
        {TERM_DEPOSIT_DISCLAIMER}
      </Label>
      {picker ? (
        <Picker
          host={host}
          title="Select currency"
          visible
          current={currency}
          items={DEPOSIT_CURRENCIES.map(value => ({ value, label: value }))}
          onClose={() => setPicker(false)}
          onConfirm={changeCurrency}
        />
      ) : null}
      <Sheet
        host={host}
        title={
          info === 'nks'
            ? 'NKS - Nominal Interest Rate'
            : info === 'eks'
            ? 'EKS - Effective Interest Rate'
            : info === 'opportunity'
            ? 'Missed investment opportunity'
            : 'About term deposit simulator'
        }
        visible={!!info}
        onClose={() => setInfo(null)}
      >
        {info === 'simulator' ? (
          SIMULATOR_STEPS.map(step => (
            <View key={step.title}>
              <Label host={host} strong>
                {step.title}
              </Label>
              <Label host={host}>{step.description}</Label>
            </View>
          ))
        ) : (
          <Label host={host}>
            {info === 'nks'
              ? 'The annual interest rate applied to your deposit before considering taxes or other applicable costs.'
              : info === 'eks'
              ? 'The effective annual rate showing the estimated return on your deposit, including the applicable calculation method, taxes and costs.'
              : 'This is an estimate of the potential return if some of your available funds were placed in a term deposit. It uses the current indicative rate and selected term. The result is not an actual loss or a guaranteed return.'}
          </Label>
        )}
        <Button host={host} label="OK" onPress={() => setInfo(null)} />
      </Sheet>
    </Page>
  );
}

const styles = StyleSheet.create({
  opportunityPanel: { borderRadius: 8, padding: 16, gap: 8 },
  opportunityHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  opportunityValues: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  opportunityColumn: { flex: 1, minWidth: 0 },
  opportunityDivider: {
    width: 1,
    height: 48,
    alignSelf: 'center',
  },
  yieldColumn: { alignItems: 'flex-end' },
  depositSourceGrid: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  depositSource: {
    minHeight: 142,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: 0,
    borderRadius: 4,
    padding: 16,
  },
  depositIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  depositSourceCopy: {
    minHeight: 36,
    marginTop: 8,
  },
});
