import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { formatMoneyNumber } from '@/app/registry/countryConfig';
import {
  SMART_INVESTMENT_CURRENCIES,
  SMART_INVESTMENT_DISCLAIMER,
  SMART_INVESTMENT_STEPS,
  type SimulatorCurrency,
} from '@/features/investments/future-gain/smartInvestment';
import accounts from '@/assets/investments/smart-investment/bank-product-accounts-v2.svg';
import funds from '@/assets/investments/smart-investment/investment-funds.svg';
import stocks from '@/assets/investments/smart-investment/investment-stocks.svg';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { Text } from '../../../../universal/Typography';
import { sourceColor } from '../../../../universal/sourceColor';
import type { CurrentScreenProps } from '../contracts';
import { futureGainAvailableBalance, futureGainEnabled } from './model';
import {
  Page,
  Label,
  Button,
  Sheet,
  Picker,
  IconAction,
  s,
} from './Primitives';
import { Simulator } from './Simulator';
import { TermDeposit } from './TermDeposit';
export function SmartInvestment(host: CurrentScreenProps) {
  const [view, setView] = useState<'overview' | 'fund' | 'stock' | 'deposit'>(
    host.futureGainSimulatorResumeState || host.route.params?.view === 'fund'
      ? 'fund'
      : 'overview',
  );
  const [currency, setCurrency] = useState<SimulatorCurrency>('EUR');
  const [picker, setPicker] = useState(false);
  const [information, setInformation] = useState<'about' | 'balance' | null>(
    null,
  );
  const availableBalance = futureGainAvailableBalance(host, currency);
  const formattedBalance = formatMoneyNumber(availableBalance, host.country);
  const [balanceInteger = formattedBalance, balanceFraction = '00'] =
    formattedBalance.split(',');
  const balanceDecimals = `,${balanceFraction}`;
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const textColor = sourceColor('var(--uc-text)', dark);
  const pageSurface = dark ? host.tokens.surface : host.tokens.inverse;
  const handleOverviewBack = () => {
    if (host.futureGainSimulatorResumeState && host.onSmartInvestmentBack) {
      host.onSmartInvestmentBack();
      return;
    }
    host.onBack();
  };
  if (!futureGainEnabled(host))
    return (
      <Page host={host} title="Smart investment">
        <Label host={host}>Available in the Serbia Future Gain preview.</Label>
      </Page>
    );
  if (view === 'deposit')
    return <TermDeposit host={host} onBack={() => setView('overview')} />;
  if (view === 'fund' || view === 'stock')
    return (
      <Simulator host={host} kind={view} onBack={() => setView('overview')} />
    );
  const options = [
    {
      id: 'deposit' as const,
      title: 'Term Deposits',
      description: 'A simple and secure way to grow your savings',
      risk: 'LOW RISK',
      icon: accounts,
      color: '#007a6b',
      background: 'rgba(94,111,115,.1)',
    },
    {
      id: 'fund' as const,
      title: 'Investment Funds',
      description: '',
      risk: 'MEDIUM RISK',
      icon: funds,
      color: '#a33694',
      background: 'rgba(163,54,148,.1)',
    },
    {
      id: 'stock' as const,
      title: 'Stocks',
      description:
        'Invest in well-known companies and aim for higher returns over time',
      risk: 'HIGH RISK',
      icon: stocks,
      color: '#3d1fab',
      background: 'rgba(61,31,171,.1)',
    },
  ];
  return (
    <Page
      host={{
        ...host,
        onBack: handleOverviewBack,
        screenTopInset: 20,
        tokens: { ...host.tokens, surface: pageSurface },
      }}
      title="Smart investment"
      contentContainerStyle={overviewStyles.content}
      trailing={
        <IconAction
          host={host}
          name="help-circle"
          label="About Smart Investments"
          onPress={() => setInformation('about')}
        />
      }
    >
      <View style={overviewStyles.intro}>
        <Label host={host} size={16} style={overviewStyles.description}>
          Explore investment opportunities and make informed decisions
        </Label>
      </View>
      <View
        style={[
          s.panel,
          overviewStyles.balancePanelSlot,
          {
            height: 105,
            backgroundColor: sourceColor(
              'var(--uc-investment-reference-panel, #F5F5F5)',
              dark,
            ),
          },
        ]}
      >
        <View style={overviewStyles.balanceLabelBlock}>
          <Label host={host} strong style={overviewStyles.balanceLabel}>
            Available balance in {currency} from your current accounts and
            AVISTA savings
          </Label>
          <View style={overviewStyles.balanceInfoAction}>
            <IconAction
              host={host}
              name="info-circle"
              label="More information about your available balance"
              onPress={() => setInformation('balance')}
              slotSize={24}
            />
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Select currency. Available balance in ${currency}`}
          onPress={() => setPicker(true)}
          style={overviewStyles.balanceValueButton}
        >
          <View style={overviewStyles.balanceValueRow}>
            <View style={overviewStyles.amountRow}>
              <Text style={[overviewStyles.amount, { color: textColor }]}>
                {host.amountsHidden ? '••••••' : balanceInteger}
              </Text>
              {!host.amountsHidden ? (
                <Text style={[overviewStyles.decimals, { color: textColor }]}>
                  {balanceDecimals} {currency}
                </Text>
              ) : null}
            </View>
            <View style={overviewStyles.currencyChevron}>
              <SourceCustomIcon
                name="chevron-down"
                size={16}
                color={textColor}
              />
            </View>
          </View>
        </Pressable>
      </View>
      <View style={[overviewStyles.options, { backgroundColor: pageSurface }]}>
        {options.map(option => (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityLabel={option.title}
            onPress={() => setView(option.id)}
            style={[
              overviewStyles.optionRow,
              { backgroundColor: pageSurface },
            ]}
          >
            <View style={overviewStyles.optionIcon}>
              <AssetGlyph asset={option.icon} size={24} />
            </View>
            <View style={overviewStyles.optionCopy}>
              <Label host={host} strong style={overviewStyles.optionTitle}>
                {option.title}
              </Label>
              {option.description ? (
                <Label
                  host={host}
                  size={14}
                  style={overviewStyles.optionDescription}
                >
                  {option.description}
                </Label>
              ) : null}
              <View
                style={[
                  s.risk,
                  overviewStyles.risk,
                  { backgroundColor: option.background },
                ]}
              >
                <Label
                  host={{
                    ...host,
                    tokens: { ...host.tokens, text: option.color },
                  }}
                  strong
                  size={14}
                  style={overviewStyles.riskLabel}
                >
                  {option.risk}
                </Label>
              </View>
            </View>
            <View style={overviewStyles.trailingIcon}>
              <SourceCustomIcon
                name="chevron-right"
                size={16}
                color={host.tokens.text}
              />
            </View>
          </Pressable>
        ))}
      </View>
      <Label host={host} size={14} muted style={overviewStyles.disclaimer}>
        {SMART_INVESTMENT_DISCLAIMER}
      </Label>
      {picker ? (
        <Picker
          host={host}
          title="Select currency"
          visible
          current={currency}
          items={SMART_INVESTMENT_CURRENCIES.map(value => ({
            value,
            label: value,
          }))}
          onClose={() => setPicker(false)}
          onConfirm={setCurrency}
        />
      ) : null}
      <Sheet
        host={host}
        title={
          information === 'about'
            ? 'About Smart Investments'
            : 'Available balance from your current accounts and AVISTA savings'
        }
        visible={!!information}
        onClose={() => setInformation(null)}
      >
        {information === 'about' ? (
          <>
            <Label host={host}>
              Use this simulator to explore how a term deposit could work for
              you.
            </Label>
            {SMART_INVESTMENT_STEPS.map(step => (
              <View key={step.title}>
                <Label host={host} strong>
                  {step.title}
                </Label>
                <Label host={host}>{step.description}</Label>
              </View>
            ))}
          </>
        ) : (
          <Label host={host}>
            Your available balance combines funds in your current accounts and
            AVISTA savings. Values shown in another currency use the same
            exchange rates as Payments. This is a display estimate; it does not
            move money or exchange currencies.
          </Label>
        )}
        <Button host={host} label="OK" onPress={() => setInformation(null)} />
      </Sheet>
    </Page>
  );
}

const overviewStyles = StyleSheet.create({
  content: { padding: 0, paddingBottom: 34, gap: 0 },
  intro: { paddingHorizontal: 24, paddingTop: 8, gap: 12 },
  description: { lineHeight: 18 },
  balancePanelSlot: {
    marginTop: 24,
    marginHorizontal: 24,
    padding: 16,
    gap: 4,
    justifyContent: 'center',
  },
  balanceLabelBlock: { position: 'relative', width: '100%' },
  balanceLabel: { lineHeight: 18 },
  balanceInfoAction: { position: 'absolute', left: 190, top: 14 },
  balanceValueButton: {
    minHeight: 33,
    width: '100%',
    justifyContent: 'flex-start',
  },
  balanceValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  amountRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  amount: { fontFamily: 'UniCredit-bold', fontSize: 30, lineHeight: 33 },
  decimals: { fontFamily: 'UniCredit-bold', fontSize: 20, lineHeight: 22 },
  currencyChevron: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  options: { marginTop: 24, width: '100%' },
  optionRow: {
    height: 96,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 24,
    paddingRight: 16,
  },
  optionIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trailingIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCopy: { flex: 1, minWidth: 0, gap: 4 },
  optionTitle: { lineHeight: 18 },
  optionDescription: { lineHeight: 15 },
  risk: { paddingVertical: 3 },
  riskLabel: { lineHeight: 15 },
  disclaimer: {
    marginTop: 24,
    paddingHorizontal: 24,
    textAlign: 'center',
    lineHeight: 15,
  },
});
