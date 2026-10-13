import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../../universal/Typography';
import type { Product } from '@/data/products';
import { createEvoTranslations } from '@/translations/evo';
import { formatEvo2027SignedNumber } from '@/app/utils/evo2027Formatting';
import { maskFormattedAmount } from '@/app/utils/amountPrivacy';
import { EVO_SAVING_ACCOUNT_ANNUAL_RATE } from '@/app/config/evoCreditTerms';
import {
  getEvoCreditProgressAccessibility,
  getEvoDepositPresentation,
  getEvoLoanPresentation,
} from '@/features/products/evoHome';
import { CurrencyMark } from './CurrencyMark';
import { Glyph, Money, Progress, textStyles as t } from './Primitives';
import { CardArtwork } from './CardArtwork';
import type { evoGlyphs } from './glyphs';
import { evoTokens as tokens } from './tokens';
import { createHomeProducts } from './model';
import type { CzechNativeScreen, CzechNativeScreenProps } from '../contracts';

type CardAction = {
  label: string;
  lines: string;
  screen: CzechNativeScreen;
  icon: keyof typeof evoGlyphs;
};

export function ProductCard({
  product,
  model,
  host,
}: {
  product: Product;
  model: ReturnType<typeof createHomeProducts>;
  host: CzechNativeScreenProps;
}) {
  const copy = createEvoTranslations(host.language ?? 'en');
  const { amountsHidden: hidden, onNavigate } = host;
  const isCard =
    product.type === 'debit_card' || product.type === 'credit_card';
  const open = () =>
    onNavigate({
      screen:
        product.type === 'investment_account'
          ? 'investments'
          : isCard
          ? 'card'
          : 'account',
      params: { productId: product.id },
    });
  const deposit =
    product.type === 'term_deposit' ? getEvoDepositPresentation(product) : null;
  const loan =
    product.type === 'loan' || product.type === 'mortgage'
      ? getEvoLoanPresentation(product)
      : null;
  const actions: CardAction[] =
    product.type === 'current_account'
      ? [
          {
            label: 'New payment',
            lines: 'New\npayment',
            screen: 'payment-create',
            icon: 'payment-new',
          },
          ...(product.currency === 'EUR' || product.currency === 'USD'
            ? [
                {
                  label: 'Currency Exchange',
                  lines: 'Currency\nExchange',
                  screen: 'payments' as const,
                  icon: 'currency-exchange' as const,
                },
                {
                  label: 'Exchange rates',
                  lines: 'Exchange\nrates',
                  screen: 'payments' as const,
                  icon: 'exchange-rates' as const,
                },
              ]
            : [
                {
                  label: 'Scan QR code',
                  lines: 'Scan QR\ncode',
                  screen: 'payments' as const,
                  icon: 'payment-scan-qr' as const,
                },
                {
                  label: 'Create QR code',
                  lines: 'Create QR\ncode',
                  screen: 'payments' as const,
                  icon: 'payment-create-qr' as const,
                },
              ]),
          {
            label: 'Account info',
            lines: 'Account\ninfo',
            screen: 'account-info',
            icon: 'account-info',
          },
        ]
      : product.type === 'debit_card'
      ? [
          {
            label: 'Card details',
            lines: 'Card\nDetails',
            screen: 'card-info',
            icon: 'account-info',
          },
          {
            label: 'Card options',
            lines: 'Card\nOptions',
            screen: 'card-options',
            icon: 'account-options',
          },
          {
            label: 'Block card',
            lines: 'Block\nCard',
            screen: 'card-options',
            icon: 'block-card',
          },
          {
            label: 'View PIN',
            lines: 'View\nPIN',
            screen: 'card-options',
            icon: 'view-pin',
          },
        ]
      : [];
  return (
    <View style={s.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${product.name}`}
        onPress={open}
        style={s.main}
      >
        <View style={s.copy}>
          <Text style={[t.body, t.strong, sourceStyles.fontSize16lineHeight20]}>
            {product.name}
            {product.type === 'saving_account'
              ? ` · ${EVO_SAVING_ACCOUNT_ANNUAL_RATE * 100}% p.a.`
              : ''}
            {deposit ? ` · ${(deposit.annualRate * 100).toFixed(1)}% p.a.` : ''}
          </Text>
          <Text style={[t.body, sourceStyles.marginTop3]}>
            {model.getProductDisplayNumber(product)}
          </Text>
          {loan && (
            <View style={s.support}>
              <Text style={[t.body, t.muted]}>
                {copy.labels.nextInstallment}:{' '}
              </Text>
              <Money
                amount={loan.installment}
                currency={product.currency}
                hidden={hidden}
                role="support"
              />
            </View>
          )}
          {deposit && (
            <View style={s.support}>
              <Text style={[t.body, t.muted]}>
                {copy.labels.maturityAmount}:{' '}
              </Text>
              <Money
                amount={deposit.maturityAmount}
                currency={product.currency}
                hidden={hidden}
                role="support"
              />
            </View>
          )}
          <View style={sourceStyles.marginTop10}>
            <Money
              amount={model.formatProductAmount(product)}
              hidden={hidden}
            />
          </View>
          {product.type === 'investment_account' &&
            model.portfolioPerformance.performanceAmount !== 0 && (
              <Text style={[t.body, s.performance]}>
                {hidden
                  ? '****,**'
                  : formatEvo2027SignedNumber(
                      model.portfolioPerformance.performanceAmount,
                    )}{' '}
                {product.currency} (
                {maskFormattedAmount(
                  `${model.portfolioPerformance.performancePercent.toFixed(
                    2,
                  )}%`,
                  hidden,
                )}
                )
              </Text>
            )}
        </View>
        {product.type === 'current_account' && (
          <CurrencyMark currency={product.currency} />
        )}
        {isCard && (
          <CardArtwork
            variant={
              product.type === 'credit_card'
                ? 'mc-credit-premium-gold'
                : product.currency === 'EUR'
                ? 'mc-virtual-standard-violet'
                : 'mc-debit-standard'
            }
          />
        )}
      </Pressable>
      {actions.length > 0 && (
        <View style={s.actions}>
          {actions.map(action => (
            <Pressable
              key={action.label}
              accessibilityRole="button"
              accessibilityLabel={`${action.label} ${product.name}`}
              onPress={() =>
                onNavigate({
                  screen: action.screen,
                  params: { productId: product.id, action: action.label },
                })
              }
              style={s.action}
            >
              <View style={s.actionCircle}>
                <Glyph name={action.icon} />
              </View>
              <Text
                style={[t.body, sourceStyles.textAligncenter, s.actionLabel]}
              >
                {action.lines}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      {product.type === 'credit_card' && (
        <>
          <Progress
            label={copy.labels.usedCredit}
            value={product.creditLimit - product.availableCredit}
            max={product.creditLimit}
            accessibilityValue={getEvoCreditProgressAccessibility(
              product,
              hidden,
            )}
          />
          <View style={s.support}>
            <Text style={[t.body, t.muted]}>{copy.labels.usedCredit} </Text>
            <Money
              amount={Math.max(
                0,
                product.creditLimit - product.availableCredit,
              )}
              currency={product.currency}
              hidden={hidden}
              role="support"
            />
            <Text style={t.body}> {copy.labels.ofLimit} </Text>
            <Money
              amount={product.creditLimit}
              currency={product.currency}
              hidden={hidden}
              role="support"
            />
          </View>
        </>
      )}
      {deposit && (
        <>
          <View
            style={[
              s.support,
              sourceStyles.justifyContentspacebetweenmarginTop20,
            ]}
          >
            <Text style={t.body}>
              {copy.labels.period}: {deposit.periodLabel}
            </Text>
            <Text style={t.body}>
              {copy.labels.daysToMaturity}: {deposit.daysToMaturity}
            </Text>
          </View>
          <Progress
            label={copy.labels.maturityProgress}
            value={deposit.termDays - deposit.daysToMaturity}
            max={deposit.termDays}
          />
          <View style={[s.support, sourceStyles.justifyContentspacebetween]}>
            <Text style={[t.body, t.muted]}>
              {copy.labels.startDate}: {deposit.startDate}
            </Text>
            <Text style={[t.body, t.muted]}>
              {copy.labels.maturityDate}: {deposit.maturityDate}
            </Text>
          </View>
        </>
      )}
      {loan && (
        <>
          <Progress
            label={copy.labels.repaidProgress}
            value={loan.repaidPercentage}
          />
          <View style={[s.support, sourceStyles.justifyContentspacebetween]}>
            <View>
              <Text style={[t.body, t.muted]}>{copy.labels.totalRepaid}</Text>
              <Money
                amount={loan.repaid}
                currency={product.currency}
                hidden={hidden}
                role="support"
              />
            </View>
            <View>
              <Text style={[t.body, t.muted]}>{copy.labels.totalLoan}</Text>
              <Money
                amount={loan.total}
                currency={product.currency}
                hidden={hidden}
                role="support"
              />
            </View>
          </View>
        </>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: tokens.surface,
    borderRadius: 8,
    zIndex: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  main: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  copy: { flex: 1 },
  support: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  actions: { flexDirection: 'row', gap: 8, paddingTop: 32 },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  actionCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tokens.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { lineHeight: 16 },
  performance: { marginTop: 8, color: '#398347' },
});

const sourceStyles = StyleSheet.create({
  fontSize16lineHeight20: { fontSize: 16, lineHeight: 18 },
  marginTop3: { marginTop: 4, lineHeight: 16 },
  marginTop10: { marginTop: 8 },
  textAligncenter: { textAlign: 'center' },
  justifyContentspacebetweenmarginTop20: {
    justifyContent: 'space-between',
    marginTop: 20,
  },
  justifyContentspacebetween: { justifyContent: 'space-between' },
});
