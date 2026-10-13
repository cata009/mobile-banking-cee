import React from 'react';
import { Platform, Pressable, View, StyleSheet } from 'react-native';
import { Text } from '../../../../../universal/Typography';
import { SoftShadow } from '../../../../../universal/SoftShadow';
import type { Product } from '@/data/products';
import {
  getTermDepositDetails,
  getLoanDetails,
} from '@/data/accountProductDetails';
import { getEvoDepositPresentation } from '@/features/products/evoHome';
import { EVO_SAVING_ACCOUNT_ANNUAL_RATE } from '@/app/config/evoCreditTerms';
import { formatEvo2027Amount } from '@/app/utils/evo2027Formatting';
import { maskAmountParts } from '@/app/utils/amountPrivacy';
import { Copy, Glyph, tokens, money } from './Primitives';
export default function BalanceCard({
  product,
  products,
  hidden,
  onCopy,
}: {
  product: Product;
  products: Product[];
  hidden: boolean;
  onCopy: () => void;
}) {
  const deposit =
      product.type === 'term_deposit'
        ? getTermDepositDetails(
            product,
            products.find(p => p.type === 'current_account')?.accountNumber ??
              '',
          )
        : undefined,
    loan =
      product.type === 'loan' || product.type === 'mortgage'
        ? getLoanDetails(product)
        : undefined;
  const amount = maskAmountParts(
      formatEvo2027Amount(
        loan?.ownedAmount ?? product.balance,
        product.currency,
      ),
      hidden,
    ),
    secondary =
      deposit?.maturityAmount ??
      loan?.nextInstallment ??
      product.balance * 0.92,
    progress = deposit?.progress ?? loan?.progress;
  const suffix =
    product.type === 'saving_account'
      ? ` · ${(EVO_SAVING_ACCOUNT_ANNUAL_RATE * 100).toFixed(1)}% p.a.`
      : product.type === 'term_deposit'
      ? ` · ${(getEvoDepositPresentation(product).annualRate * 100).toFixed(
          1,
        )}% p.a.`
      : '';
  const label =
    product.type === 'saving_account'
      ? 'Available funds'
      : product.type === 'term_deposit'
      ? 'Deposit amount'
      : loan
      ? 'Remaining loan amount'
      : 'Available balance';
  return (
    <View style={[b.card, Platform.OS !== 'android' && b.shadow]}>
      <SoftShadow
        width={311}
        height={197}
        radius={6}
        offsetY={16}
        blur={32}
        color="#000000"
        opacity={0.08}
      />
      <SoftShadow
        width={311}
        height={197}
        radius={6}
        offsetY={3}
        blur={10}
        color="#000000"
        opacity={0.05}
      />
      <View>
        <Text style={b.title}>
          {product.name}
          {suffix}
        </Text>
        <View style={b.identity}>
          <View style={b.number}>
            <Copy strong muted>
              {product.type === 'term_deposit'
                ? `Maturity date ${deposit?.maturityDate}`
                : product.accountNumber}
            </Copy>
          </View>
          {product.type !== 'term_deposit' && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Copy account number"
              onPress={event => {
                event.stopPropagation();
                onCopy();
              }}
              style={b.copy}
            >
              <Glyph name="copy-documents" />
            </Pressable>
          )}
        </View>
      </View>
      <View style={b.balance}>
        <View>
          <Copy strong muted size={14} lineHeight={15.5}>
            {label}
          </Copy>
          <Text style={b.amount}>
            {amount.integer}
            <Text style={b.decimals}>
              {amount.decimals} {amount.currency}
            </Text>
          </Text>
        </View>
        {progress !== undefined ? (
          <View
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: 100,
              now: Math.round(progress * 100),
            }}
            style={b.track}
          >
            <View
              style={[
                b.progress,
                {
                  width: `${progress * 100}%`,
                },
              ]}
            />
          </View>
        ) : (
          <View style={b.rule} />
        )}
        {product.type !== 'saving_account' && (
          <View style={b.secondary}>
            <Copy strong muted size={14}>
              {deposit
                ? 'Maturity amount'
                : loan
                ? 'Next installment'
                : 'Current balance'}
            </Copy>
            <Copy strong size={14}>
              {money(secondary, product.currency, hidden)}
            </Copy>
          </View>
        )}
      </View>
    </View>
  );
}
const b = StyleSheet.create({
  card: {
    width: 311,
    height: 197,
    padding: 16,
    borderRadius: 6,
    backgroundColor: tokens.surface,
    gap: 16,
  },
  shadow: {
    boxShadow: '0 16px 32px rgba(0,0,0,0.08), 0 3px 10px rgba(0,0,0,0.05)',
  },
  title: {
    fontFamily: tokens.strongFont,
    fontSize: 20,
    lineHeight: 22,
    color: tokens.accent,
  },
  identity: {
    marginTop: 8,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  number: {
    maxWidth: 235,
    flex: 1,
  },
  copy: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balance: {
    height: 80,
    gap: 8,
  },
  amount: {
    fontFamily: tokens.strongFont,
    fontSize: 30,
    lineHeight: 30,
    color: tokens.text,
  },
  decimals: {
    fontFamily: tokens.font,
    fontSize: 20,
  },
  rule: {
    width: 279,
    height: 1,
    backgroundColor: tokens.border,
  },
  track: {
    width: 279,
    height: 4,
    borderRadius: 2,
    backgroundColor: tokens.border,
    overflow: 'hidden',
  },
  progress: {
    height: 4,
    backgroundColor: tokens.accent,
    borderRadius: 2,
  },
  secondary: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
});
