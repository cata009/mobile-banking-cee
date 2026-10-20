import React from 'react';
import { Pressable, View } from 'react-native';
import type { AccountTransaction } from '@/data/accountDetails';
import { resolveTransactionRow } from '@/app/components/contracts/transactionRow';
import type {
  TransactionIdentityPresentation,
  TransactionCategoryPresentation,
} from '@/features/accounts-payments/transactionAvatarIdentity';
import { BaselineTransactionAvatar } from './BaselineTransactionAvatar';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';
export function BaselineTransactionRow({
  transaction,
  formattedAmount,
  currency,
  showDate = true,
  leadingVisual,
  displayLabel,
  detailsLabel,
  accountLabel,
  onPress,
  onCategoryPress,
  categoryIconVariant = 'glyph',
  avatarPresentation = 'identity',
  positiveAmountColor,
  evo2027 = false,
  showTransactionDate = false,
  compact = false,
  dark = false,
}: {
  transaction: AccountTransaction;
  formattedAmount: string;
  currency: string;
  showDate?: boolean;
  leadingVisual?: React.ReactNode;
  displayLabel?: string;
  detailsLabel?: string;
  accountLabel?: string;
  onPress?: (transaction: AccountTransaction) => void;
  onCategoryPress?: (transaction: AccountTransaction) => void;
  categoryIconVariant?: TransactionCategoryPresentation;
  avatarPresentation?: TransactionIdentityPresentation;
  positiveAmountColor?: string;
  evo2027?: boolean;
  showTransactionDate?: boolean;
  compact?: boolean;
  dark?: boolean;
}) {
  const RowElement = onPress ? Pressable : View;
  const state = resolveTransactionRow({
      pending: transaction.status === 'Pending',
      evo2027,
      compact,
      amount: transaction.amount,
      type: transaction.type,
      formattedAmount,
      hasLeading: Boolean(leadingVisual),
      avatarPresentation,
    }),
    color = (token: string) => sourceColor(`var(${token})`, dark),
    amountColor = state.pending
      ? color(state.mutedToken)
      : transaction.type === 'credit'
      ? positiveAmountColor ?? color('--uc-action')
      : color(state.textToken);
  const shell = {
    minHeight: state.evo2027 ? state.minHeight : state.height,
    width: '100%' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: state.evo2027 ? undefined : ('space-between' as const),
    gap: state.gap,
    paddingHorizontal: state.gutter,
    paddingVertical: state.paddingVertical,
    backgroundColor: state.evo2027 ? undefined : color('--uc-surface'),
  };
  const leading = state.showLeading
    ? leadingVisual ?? (
        <BaselineTransactionAvatar
          transaction={transaction}
          size={state.avatarSize}
          pfmVariant={categoryIconVariant}
          presentation={avatarPresentation}
          dark={dark}
        />
      )
    : null;
  const labelStyle = {
    fontFamily: state.evo2027 ? 'UniCredit-bold' : 'UniCredit-regular',
    fontSize: state.labelSize,
    lineHeight: state.labelLineHeight,
    color: state.pending ? color(state.mutedToken) : color(state.textToken),
    textAlign: state.evo2027 ? ('left' as const) : ('right' as const),
  };
  const muted = {
      fontFamily: 'UniCredit-regular',
      fontSize: 14,
      lineHeight: 18,
      color: color(state.mutedToken),
    },
    integerStyle = {
      fontFamily: 'UniCredit-bold',
      fontSize: state.amountSize,
      lineHeight: state.amountLineHeight,
      color: amountColor,
    },
    decimalsStyle = {
      fontFamily: state.evo2027 ? 'UniCredit-regular' : 'UniCredit-bold',
      fontSize: state.decimalsSize,
      lineHeight: state.evo2027 ? undefined : 15,
      letterSpacing: state.evo2027 ? 0.3 : 0,
      textTransform: 'uppercase' as const,
    };
  const evoDateStyle = { ...muted, lineHeight: undefined };
  const amount = (
    <Text style={integerStyle}>
      {state.sign}
      {state.parts.integer}
      {state.evo2027 ? '' : state.parts.separator}
      <Text style={decimalsStyle}>
        {state.evo2027 ? state.parts.separator : ''}
        {state.parts.decimals} {currency}
      </Text>
    </Text>
  );
  const viewStyle1 = { alignItems: 'center', gap: 2 } as const;
  const textStyle2 = {
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
    lineHeight: 20,
    color: color(state.textToken),
  } as const;
  const textStyle3 = {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 15,
    color: color(state.textToken),
  } as const;
  const date =
    showDate && !state.evo2027 ? (
      <View style={viewStyle1}>
        <Text style={textStyle2}>{transaction.day}</Text>
        <Text style={textStyle3}>{transaction.month}</Text>
      </View>
    ) : null;
  const viewStyle4 = { flex: 1, minWidth: 0, gap: 2 } as const;
  const viewStyle5 = {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-end',
    gap: state.contentGap,
  } as const;
  const viewStyle6 = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: state.pendingStatusHeight,
  } as const;
  const viewStyle7 = {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color(state.pendingDotToken),
  } as const;
  const textStyle8 = {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: state.statusLineHeight,
    textTransform: 'uppercase',
    color: color(state.mutedToken),
  } as const;
  const details = state.evo2027 ? (
    <View style={viewStyle4}>
      <Text numberOfLines={1} style={labelStyle}>
        {displayLabel ?? transaction.label}
      </Text>
      {detailsLabel ?? transaction.details ? (
        <Text numberOfLines={1} style={muted}>
          {detailsLabel ?? transaction.details}
        </Text>
      ) : null}
      {accountLabel ? (
        <Text numberOfLines={1} style={muted}>
          {accountLabel}
        </Text>
      ) : null}
      {showTransactionDate ? (
        <Text style={evoDateStyle}>
          {transaction.day} {transaction.month}
        </Text>
      ) : null}
    </View>
  ) : (
    <View style={viewStyle5}>
      <Text style={labelStyle}>{displayLabel ?? transaction.label}</Text>
      {amount}
      {state.pending ? (
        <View style={viewStyle6}>
          <View style={viewStyle7} />
          <Text style={textStyle8}>Pending</Text>
        </View>
      ) : null}
    </View>
  );
  const pressableStyle9 = {
    width: state.avatarSize,
    height: state.avatarSize,
    alignItems: 'center',
    justifyContent: 'center',
  } as const;
  const categoryControl = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Change category for ${transaction.label}`}
      onPress={() => onCategoryPress?.(transaction)}
      style={pressableStyle9}
    >
      {leading}
    </Pressable>
  );
  const viewStyle10 = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  } as const;
  const pressableStyle11 = {
    flex: 1,
    minWidth: 0,
    flexDirection: state.evo2027 ? 'row' : 'column',
    alignItems: state.evo2027 ? 'center' : 'stretch',
    gap: state.gap,
  } as const;
  if (onCategoryPress)
    return (
      <View style={shell}>
        <View style={viewStyle10}>
          {date}
          {state.evo2027 || state.showLeading ? categoryControl : null}
        </View>
        <RowElement
          accessibilityRole={onPress ? 'button' : undefined}
          accessibilityLabel={
            onPress ? `Open transaction ${transaction.label}` : undefined
          }
          onPress={onPress ? () => onPress(transaction) : undefined}
          style={pressableStyle11}
        >
          {details}
          {state.evo2027 ? amount : null}
        </RowElement>
      </View>
    );
  const viewStyle12 = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  } as const;
  const viewStyle13 = {
    width: state.avatarSize,
    height: state.avatarSize,
    alignItems: 'center',
    justifyContent: 'center',
  } as const;
  return (
    <RowElement
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress ? () => onPress(transaction) : undefined}
      style={shell}
    >
      <View style={viewStyle12}>
        {date}
        {state.evo2027 ? <View style={viewStyle13}>{leading}</View> : leading}
      </View>
      {details}
      {state.evo2027 ? amount : null}
    </RowElement>
  );
}
