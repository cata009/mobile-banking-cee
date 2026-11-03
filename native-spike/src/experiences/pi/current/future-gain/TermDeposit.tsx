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
import { convertCurrency, roundMoney } from '@/data/exchangeRates';
import {
  formatMoneyNumber,
  splitMoneyAmount,
} from '@/app/registry/countryConfig';
import type { CurrentScreenProps } from '../contracts';
import { futureGainAvailableBalance } from './model';
import { BaselineAmountField } from '../../../../universal/BaselineAmountField';
import { BaselineDropdownField } from '../../../../universal/BaselineDropdownField';
import { Text } from '../../../../universal/Typography';
import { sourceColor } from '../../../../universal/sourceColor';
import {
  Page,
  Label,
  Fact,
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

function DepositFact({
  host,
  label,
  value,
  labelTrailing,
  emphasized = false,
  containerStyle,
}: {
  host: CurrentScreenProps;
  label: string;
  value: React.ReactNode;
  labelTrailing?: React.ReactNode;
  emphasized?: boolean;
  containerStyle?: React.ComponentProps<typeof Fact>['containerStyle'];
}) {
  return (
    <Fact
      host={host}
      label={label}
      value={value}
      labelTrailing={labelTrailing}
      labelSize={16}
      valueSize={18}
      labelStrong={emphasized}
      labelStyle={emphasized ? { color: host.tokens.text } : undefined}
      containerStyle={[
        styles.factRow,
        containerStyle,
        emphasized && {
          backgroundColor: sourceColor(
            'var(--uc-investment-reference-panel, #F5F5F5)',
            host.tokens.background === sourceColor('var(--uc-app-bg)', true),
          ),
        },
      ]}
    />
  );
}

function DepositDivider({
  host,
  title,
}: {
  host: CurrentScreenProps;
  title: string;
}) {
  return (
    <View
      style={[styles.sectionDivider, { borderBottomColor: host.tokens.border }]}
    >
      <Label host={host} strong size={18}>
        {title}
      </Label>
    </View>
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
  const pageSurface = dark ? host.tokens.surface : host.tokens.inverse;
  const pageHost = {
    ...host,
    onBack,
    screenTopInset: 20,
    tokens: { ...host.tokens, surface: pageSurface },
  };
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
      host={pageHost}
      title="Term deposit"
      contentContainerStyle={styles.pageContent}
      trailing={
        <IconAction
          host={host}
          name="help-circle"
          label="About term deposit simulator"
          onPress={() => setInfo('simulator')}
        />
      }
      footer={
        <Footer host={pageHost}>
          <Button
            host={host}
            label="Request offer"
            disabled={!quote.isAmountValid}
            onPress={() => setRequest(true)}
          />
        </Footer>
      }
    >
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
            <Label host={host} strong size={18}>
              Missed investment opportunity
            </Label>
          </View>
          <IconAction
            host={host}
            name="info-circle"
            label="About the missed investment opportunity estimate"
            onPress={() => setInfo('opportunity')}
            slotSize={24}
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
      <DepositDivider host={host} title="DEPOSIT CALCULATION" />
      <Label host={host} size={16} style={styles.depositDescription}>
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
                borderWidth: value === 'current' ? 2 : 0.25,
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
                size={16}
              >
                {value === 'current'
                  ? 'Current bank\naccount'
                  : 'External bank\naccount'}
              </Label>
              <Label host={host} size={14}>
                {value === 'current'
                  ? 'Use your UniCredit account'
                  : 'Use an account at another bank'}
              </Label>
            </View>
          </Pressable>
        ))}
      </View>
      <View style={styles.amountFieldSlot}>
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
      </View>
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
      <View style={styles.fullBleed}>
        <BaselineDropdownField
          label="Select the preferred tenor"
          value={String(tenor)}
          options={[...TENOR_OPTIONS]
            .sort((a, b) => a - b)
            .map(months => ({
              value: String(months),
              label: `${months} Months`,
            }))}
          onChange={value => setTenor(Number(value) as TenorMonths)}
          helperText="Select between 3, 6 or 12 months"
          fillWidth
          dark={dark}
        />
      </View>
      <DepositDivider host={host} title="REPRESENTATIVE EXAMPLE" />
      <DepositFact
        host={host}
        label="Amount"
        containerStyle={[styles.factRow, styles.firstFactRow]}
        value={
          quote.isAmountValid ? (
            <Money host={host} value={amount} currency={currency} size={18} />
          ) : (
            '—'
          )
        }
      />
      <DepositFact host={host} label="Tenor" value={`${tenor} months`} />
      <DepositFact
        host={host}
        label="Fixed NKS (Nominal interest rate)"
        value={`${quote.rates.nominal.toLocaleString('sr-RS', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 2,
        })}%`}
        labelTrailing={
          <IconAction
            host={host}
            name="info-circle"
            label="What is NKS?"
            onPress={() => setInfo('nks')}
            slotSize={24}
          />
        }
      />
      <DepositFact
        host={host}
        label="EKS (Effective interest rate)"
        value={`${quote.rates.effective.toLocaleString(
          'sr-RS',
          { minimumFractionDigits: 2, maximumFractionDigits: 2 },
        )}%`}
        labelTrailing={
          <IconAction
            host={host}
            name="info-circle"
            label="What is EKS?"
            onPress={() => setInfo('eks')}
            slotSize={24}
          />
        }
        emphasized
      />
      <DepositFact
        host={host}
        label="Total deposit amount and gross interest at maturity"
        value={
          quote.isAmountValid ? (
            <Money
              host={host}
              value={quote.grossMaturity}
              currency={currency}
              size={18}
            />
          ) : (
            '—'
          )
        }
      />
      <DepositFact
        host={host}
        label="Tax"
        value={
          <Money host={host} value={quote.tax} currency={currency} size={18} />
        }
      />
      <DepositFact
        host={host}
        label="Net deposit amount and interest at maturity"
        value={
          quote.isAmountValid ? (
            <Money
              host={host}
              value={quote.netMaturity}
              currency={currency}
              size={18}
            />
          ) : (
            '—'
          )
        }
      />
      <DepositFact host={host} label="Criteria for index deposit" value="0" />
      <DepositFact host={host} label="Cost payable by the Client" value="0" />
      <DepositFact
        host={host}
        label="Price updated at"
        value={FUTURE_GAIN_REFERENCE_DATE}
      />
      <Label host={host} muted size={14} style={styles.disclaimer}>
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
  pageContent: { paddingHorizontal: 24, paddingTop: 0, paddingBottom: 77, gap: 0 },
  opportunityPanel: {
    borderRadius: 8,
    padding: 16,
    gap: 8,
    minHeight: 120,
  },
  sectionDivider: {
    width: '100%',
    height: 32,
    marginTop: 24,
    marginHorizontal: -24,
    paddingTop: 6,
    paddingLeft: 24,
    paddingRight: 16,
    borderBottomWidth: 1,
  },
  depositDescription: { marginTop: 24, lineHeight: 18 },
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
    gap: 16,
    marginTop: 24,
  },
  depositSource: {
    height: 161,
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
  amountFieldSlot: {
    height: 96,
    marginTop: 24,
    justifyContent: 'center',
  },
  fullBleed: { width: '100%', marginHorizontal: -24 },
  factRow: {
    width: '100%',
    height: 80,
    marginHorizontal: -24,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  firstFactRow: { marginTop: 24 },
  disclaimer: { marginTop: 24, lineHeight: 15, textAlign: 'center' },
});
