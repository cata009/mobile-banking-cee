import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Text } from '../../../../../universal/Typography';
import { AssetGlyph } from '../../../../../universal/AssetGlyph';
import emagOfficial from '@/assets/ethoca/emag-official.svg';
import {
  resolveTransactionMerchant,
  isNonMerchantCounterparty,
  getMerchantRoundel,
  getMerchantMarkPath,
} from '@/data/merchantDirectory';
import {
  getPartyInitials,
  partyTint,
} from '@/features/accounts-payments/partyIdentity';
import type {
  AccountTransaction,
  TransactionEndpoint,
} from '@/data/accountDetails';
import { CategoryMark } from '../pfm/CategoryMark';
import { CurrencyMark } from '../home/CurrencyMark';
import { Glyph, tokens } from './Primitives';
const nativeColor = (value: string) =>
  value
    .replace(/var\(--uc-static-white\)/g, '#ffffff')
    .replace(/var\(--uc-static-black\)/g, '#262626');
/** Source TransactionAvatar composition; identity resolvers and artwork remain canonical. */
export default function MovementAvatar({
  transaction,
  size = 42,
}: {
  transaction: AccountTransaction;
  size?: number;
}) {
  const pair = transaction.transferPair;
  if (pair) {
    const disc = Math.round(size * 0.68),
      offset = size - disc;
    const endpoint = (value: TransactionEndpoint) =>
      value.kind === 'currency' ? (
        <CurrencyMark currency={value.currency} size={disc} />
      ) : (
        <View
          style={[
            extractedStyles.item0,
            [
              value.account === 'current'
                ? extractedStyles.item7
                : value.account === 'savings'
                ? extractedStyles.item8
                : extractedStyles.item9,
              {
                width: disc,
                height: disc,
                borderRadius: disc / 2,
              },
            ],
          ]}
        >
          <Glyph
            name={value.account === 'current' ? 'accounts-coins' : 'piggy-bank'}
            size={Math.round(disc * 0.58)}
            color="#ffffff"
          />
        </View>
      );
    return (
      <View
        style={{
          width: size,
          height: size,
        }}
      >
        <View style={extractedStyles.item1}>{endpoint(pair.from)}</View>
        <View
          style={[
            extractedStyles.item2,
            {
              left: offset,
              top: offset,
              borderColor: tokens.surface,
              borderRadius: disc / 2,
            },
          ]}
        >
          {endpoint(pair.to)}
        </View>
      </View>
    );
  }
  const merchant = resolveTransactionMerchant(transaction);
  if (merchant) {
    const roundel = getMerchantRoundel(merchant),
      path = getMerchantMarkPath(merchant);
    return (
      <View
        accessibilityRole="image"
        accessibilityLabel={`${merchant.name} merchant logo`}
        style={[
          extractedStyles.item3,
          [
            roundel.isLightFill
              ? extractedStyles.item10
              : extractedStyles.item11,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: nativeColor(roundel.background),
            },
          ],
        ]}
      >
        {path && (
          <Svg
            width={size * roundel.scale}
            height={size * roundel.scale}
            viewBox="0 0 24 24"
          >
            <Path d={path} fill={nativeColor(roundel.foreground)} />
          </Svg>
        )}
        {!path && merchant.asset === 'emag' && (
          <AssetGlyph asset={emagOfficial} size={size * 0.68} />
        )}
      </View>
    );
  }
  if (
    transaction.source !== 'card' &&
    !isNonMerchantCounterparty(transaction.label)
  ) {
    const badge = Math.round(size * 0.44),
      glyph = Math.round(badge * 0.66);
    return (
      <View
        accessibilityRole="image"
        accessibilityLabel={`${transaction.label}, ${
          transaction.type === 'credit'
            ? 'incoming payment'
            : 'outgoing payment'
        }`}
        style={[
          extractedStyles.item4,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: partyTint(transaction.label),
          },
        ]}
      >
        <Text
          style={[
            extractedStyles.item5,
            {
              fontFamily: tokens.strongFont,
              fontSize: Math.round(size * 0.36),
            },
          ]}
        >
          {getPartyInitials(transaction.label)}
        </Text>
        <View
          style={[
            extractedStyles.item6,
            {
              width: badge,
              height: badge,
              borderRadius: badge / 2,
              backgroundColor: tokens.text,
              borderColor: tokens.surface,
            },
          ]}
        >
          <Svg width={glyph} height={glyph} viewBox="0 0 12 12">
            <Path
              d={
                transaction.type === 'credit'
                  ? 'M6 1.5v9M1.5 6h9'
                  : 'M2 6h8M6.5 2.5 10 6l-3.5 3.5'
              }
              stroke="#ffffff"
              strokeWidth={1.8}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </View>
      </View>
    );
  }
  return <CategoryMark category={transaction.pfmCategory} size={size} />;
}
const extractedStyles = StyleSheet.create({
  item0: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  item1: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  item2: {
    position: 'absolute',
    borderWidth: 2,
  },
  item3: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  item4: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  item5: {
    color: '#ffffff',
  },
  item6: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item7: {
    backgroundColor: '#ccecea',
  },
  item8: {
    backgroundColor: '#007a91',
  },
  item9: {
    backgroundColor: '#52666d',
  },
  item10: {
    borderColor: '#e0e0e0',
  },
  item11: {
    borderColor: '#ffffff42',
  },
});
