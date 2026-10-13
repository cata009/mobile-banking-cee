import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../../../../../universal/Typography';
import { AssetGlyph } from '../../../../../universal/AssetGlyph';
import { BANK_BADGES, type BankId } from '@/data/bankIdentity';
import { getBrandLogo } from '@/app/config/brandLogos';
import kb from '@/assets/bank-logos/kb.svg';
import moneta from '@/assets/bank-logos/moneta.svg';
import revolut from '@/assets/bank-logos/revolut.svg';
import raiffeisen from '@/assets/bank-logos/raiffeisen.svg';
import { tokens } from '../accounts/Primitives';
import {
  getPartyInitials,
  partyTint,
} from '@/features/accounts-payments/partyIdentity';
const artwork: Partial<Record<BankId, string>> = {
  kb,
  moneta,
  revolut,
  raiffeisen,
};
export default function BankAvatar({
  name,
  bank,
  size = 48,
}: {
  name: string;
  bank: BankId;
  size?: number;
}) {
  const badge = BANK_BADGES[bank],
    mark = artwork[bank];
  const brand = badge.brandLogoId ? getBrandLogo(badge.brandLogoId) : null;
  const initials = getPartyInitials(name),
    badgeSize = Math.round(size * 0.45);
  return (
    <View
      style={[
        extractedStyles.item0,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: partyTint(name),
        },
      ]}
    >
      <Text
        style={[
          extractedStyles.item1,
          {
            fontFamily: tokens.strongFont,
            fontSize: Math.round(size * 0.35),
          },
        ]}
      >
        {initials}
      </Text>
      <View
        style={[
          extractedStyles.item2,
          {
            width: badgeSize + 4,
            height: badgeSize + 4,
            borderRadius: (badgeSize + 4) / 2,
            borderColor: tokens.surface,
            backgroundColor: mark || brand ? tokens.surface : badge.color,
          },
        ]}
      >
        {brand ? (
          <AssetGlyph
            asset={`data:image/svg+xml;utf8,${encodeURIComponent(brand.svg)}`}
            size={badgeSize}
          />
        ) : mark ? (
          <AssetGlyph
            asset={mark}
            size={badgeSize * (1 - 2 * (badge.logoInset ?? 0.14))}
          />
        ) : (
          <Text
            style={[
              extractedStyles.item3,
              {
                color: badge.textColor,
                fontFamily: tokens.strongFont,
                fontSize: Math.round(
                  badgeSize * (badge.short.length > 1 ? 0.44 : 0.62),
                ),
              },
            ]}
          >
            {badge.short}
          </Text>
        )}
      </View>
    </View>
  );
}
const extractedStyles = StyleSheet.create({
  item0: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  item1: {
    color: '#ffffff',
  },
  item2: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    overflow: 'hidden',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item3: {
    fontSize: 8,
  },
});
