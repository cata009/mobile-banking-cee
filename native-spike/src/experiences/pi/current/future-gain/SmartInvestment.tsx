import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
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
  Title,
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
      host={{ ...host, onBack: handleOverviewBack }}
      title="Smart investment"
      trailing={
        <IconAction
          host={host}
          name="help-circle"
          label="About Smart Investments"
          onPress={() => setInformation('about')}
        />
      }
    >
      <Title host={host}>Smart investment</Title>
      <Label host={host} size={14}>
        Explore investment opportunities and make informed decisions
      </Label>
      <View
        style={[
          s.panel,
          {
            minHeight: 105,
            backgroundColor: sourceColor(
              'var(--uc-investment-reference-panel, #F5F5F5)',
              dark,
            ),
          },
        ]}
      >
        <View style={s.two}>
          <View style={s.grow}>
            <Label host={host} strong>
              Available balance in {currency} from your current accounts and
              AVISTA savings
            </Label>
          </View>
          <IconAction
            host={host}
            name="info-circle"
            label="More information about your available balance"
            onPress={() => setInformation('balance')}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Select currency. Available balance in ${currency}`}
          onPress={() => setPicker(true)}
          style={{
            minHeight: 34,
            width: '100%',
            justifyContent: 'flex-start',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              gap: 8,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                gap: 2,
              }}
            >
              <Text
                style={{
                  fontFamily: 'UniCredit-regular',
                  fontSize: 48,
                  lineHeight: 48,
                  color: textColor,
                }}
              >
                {host.amountsHidden ? '••••••' : balanceInteger}
              </Text>
              {!host.amountsHidden ? (
                <Text
                  style={{
                    fontFamily: 'UniCredit-bold',
                    fontSize: 20,
                    lineHeight: 20,
                    color: textColor,
                  }}
                >
                  {balanceDecimals} {currency}
                </Text>
              ) : null}
            </View>
            <View
              style={{
                width: 20,
                height: 20,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 4,
              }}
            >
              <SourceCustomIcon
                name="chevron-down"
                size={20}
                color={textColor}
              />
            </View>
          </View>
        </Pressable>
      </View>
      {options.map(option => (
        <Pressable
          key={option.id}
          accessibilityRole="button"
          accessibilityLabel={option.title}
          onPress={() => setView(option.id)}
          style={s.row}
        >
          <AssetGlyph asset={option.icon} size={24} />
          <View style={s.copy}>
            <Label host={host} strong>
              {option.title}
            </Label>
            {option.description ? (
              <Label host={host} size={14}>
                {option.description}
              </Label>
            ) : null}
            <View style={[s.risk, { backgroundColor: option.background }]}>
              <Label
                host={{
                  ...host,
                  tokens: { ...host.tokens, text: option.color },
                }}
                strong
                size={14}
              >
                {option.risk}
              </Label>
            </View>
          </View>
          <SourceCustomIcon
            name="chevron-link"
            size={32}
            color={host.tokens.text}
          />
        </Pressable>
      ))}
      <Label host={host} size={14} muted>
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
