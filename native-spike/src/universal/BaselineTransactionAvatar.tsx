import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import emag from '@/assets/ethoca/emag-official.svg';
import type {
  AccountTransaction,
  TransactionEndpoint,
} from '@/data/accountDetails';
import {
  getMerchantMarkPath,
  getMerchantRoundel,
} from '@/data/merchantDirectory';
import { getPfmCategory } from '@/data/pfmCategories';
import {
  getPartyInitials,
  partyTint,
} from '@/features/accounts-payments/partyIdentity';
import {
  resolveTransactionAvatarIdentity,
  type TransactionIdentityDescriptor,
  type TransactionIdentityPresentation,
  type TransactionCategoryPresentation,
} from '@/features/accounts-payments/transactionAvatarIdentity';
import {
  resolveTransactionAvatarFrame,
  PARTY_DIRECTION_PATHS,
  TRANSACTION_ENDPOINT_ICONS,
  TRANSACTION_ENDPOINT_STYLES,
  transactionEndpointLabel,
} from '@/app/components/contracts/transactionAvatar';
import {
  PFM_CATEGORY_ICONS,
  PFM_ICON_GLYPH_PATHS,
  PFM_ICON_OPTICAL_SIZES,
  PFM_ICON_VIEW_BOXES,
} from '../experiences/pi/current/banking/pfmGlyphs';
import { TransferFlag } from '../experiences/pi/current/banking/TransferFlag';
import { AssetGlyph } from './AssetGlyph';
import { SourceCustomIcon } from './SourceCustomIcon';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';
/** Selection comes from the pure feature; artwork comes from original Source vectors/assets. */
export function BaselineTransactionAvatar({
  transaction,
  identity,
  size = 32,
  presentation,
  pfmVariant,
  elevated = false,
  dark = false,
}: {
  transaction?: AccountTransaction;
  identity?: TransactionIdentityDescriptor;
  size?: number;
  presentation?: TransactionIdentityPresentation;
  pfmVariant?: TransactionCategoryPresentation;
  elevated?: boolean;
  dark?: boolean;
}) {
  const resolved =
      identity ??
      (transaction
        ? resolveTransactionAvatarIdentity(transaction, {
            presentation,
            pfmVariant,
          })
        : undefined),
    state = resolveTransactionAvatarFrame(size),
    color = (expression: string) => sourceColor(expression, dark),
    shell = {
      width: size,
      height: size,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    };
  if (!resolved) return null;
  if (resolved.kind === 'pair') {
    const renderEndpoint = (endpoint: TransactionEndpoint) => {
      const endpointCurrency =
        endpoint.kind === 'currency'
          ? endpoint.currency
          : endpoint.account === 'current'
            ? resolved.currency
            : undefined;
      if (endpointCurrency)
        return (
          <TransferFlag currency={endpointCurrency} size={state.discSize} />
        );
      if (endpoint.kind !== 'account') return null;
      const endpointStyle = TRANSACTION_ENDPOINT_STYLES[endpoint.account];
      const viewStyle1 = {
        width: state.discSize,
        height: state.discSize,
        borderRadius: state.discSize / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: color(endpointStyle.background),
      } as const;
      return (
        <View style={viewStyle1}>
          <SourceCustomIcon
            name={TRANSACTION_ENDPOINT_ICONS[endpoint.account]}
            size={Math.round(state.discSize * 0.58)}
            color={color('var(--uc-static-white)')}
          />
        </View>
      );
    };
    const viewStyle2 = { width: size, height: size } as const;
    const viewStyle3 = { position: 'absolute', top: 0, left: 0 } as const;
    const viewStyle4 = {
      position: 'absolute',
      top: state.pairOffset,
      left: state.pairOffset,
      borderRadius: state.discSize / 2,
      boxShadow: `0 0 0 2px ${color('var(--uc-surface)')}`,
    } as const;
    return (
      <View
        accessibilityRole="image"
        accessibilityLabel={`${transactionEndpointLabel(resolved.pair.from)} to ${transactionEndpointLabel(resolved.pair.to)}`}
        style={viewStyle2}
      >
        <View style={viewStyle3}>{renderEndpoint(resolved.pair.from)}</View>
        <View style={viewStyle4}>{renderEndpoint(resolved.pair.to)}</View>
      </View>
    );
  }
  if (resolved.kind === 'merchant') {
    const roundel = getMerchantRoundel(resolved.merchant),
      path = getMerchantMarkPath(resolved.merchant),
      style = {
        ...shell,
        borderRadius: size / 2,
        overflow: 'hidden' as const,
        backgroundColor: color(roundel.background),
        boxShadow: [
          {
            offsetX: 0,
            offsetY: 0,
            blurRadius: 0,
            spreadDistance: 1,
            inset: true,
            color: roundel.isLightFill
              ? 'rgba(0,0,0,.12)'
              : 'rgba(255,255,255,.26)',
          },
          ...(elevated
            ? [
                {
                  offsetX: 0,
                  offsetY: 5,
                  blurRadius: 14,
                  color: color('rgb(var(--uc-shadow-rgb)/.16)'),
                },
              ]
            : []),
        ],
      };
    return (
      <View
        accessibilityRole="image"
        accessibilityLabel={`${resolved.merchant.name} merchant logo`}
        style={style}
      >
        {path ? (
          <Svg
            width={size * roundel.scale}
            height={size * roundel.scale}
            viewBox="0 0 24 24"
          >
            <Path d={path} fill={color(roundel.foreground)} />
          </Svg>
        ) : resolved.merchant.asset === 'emag' ? (
          <AssetGlyph asset={emag} size={size * 0.68} />
        ) : null}
      </View>
    );
  }
  if (resolved.kind === 'party') {
    const style = {
        ...shell,
        borderRadius: size / 2,
        backgroundColor: partyTint(resolved.name),
      },
      badge = {
        position: 'absolute' as const,
        right: -1,
        bottom: -1,
        width: state.badgeSize,
        height: state.badgeSize,
        borderRadius: state.badgeSize / 2,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        backgroundColor: color('var(--uc-text)'),
        boxShadow: `0 0 0 2px ${color('var(--uc-surface)')}`,
      };
    const textStyle5 = {
      fontFamily: 'UniCredit-bold',
      fontSize: state.fontSize,
      lineHeight: state.fontSize,
      letterSpacing: state.fontSize * 0.01,
      color: color('var(--uc-static-white)'),
    } as const;
    return (
      <View
        accessibilityRole="image"
        accessibilityLabel={`${resolved.name}, ${resolved.direction === 'in' ? 'incoming payment' : 'outgoing payment'}`}
        style={style}
      >
        <Text style={textStyle5}>{getPartyInitials(resolved.name)}</Text>
        <View style={badge}>
          <Svg
            width={state.glyphSize}
            height={state.glyphSize}
            viewBox="0 0 12 12"
            fill="none"
          >
            {resolved.direction === 'in' ? (
              <Path
                d={PARTY_DIRECTION_PATHS.incoming}
                stroke={color('var(--uc-surface)')}
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            ) : (
              <>
                <Path
                  d={PARTY_DIRECTION_PATHS.outgoingLine}
                  stroke={color('var(--uc-surface)')}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <Path
                  d={PARTY_DIRECTION_PATHS.outgoingArrow}
                  stroke={color('var(--uc-surface)')}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}
          </Svg>
        </View>
      </View>
    );
  }
  const definition = getPfmCategory(resolved.category),
    circle = resolved.pfmVariant === 'category-circle',
    paths =
      (circle ? undefined : PFM_ICON_GLYPH_PATHS[definition.name]) ??
      PFM_CATEGORY_ICONS[definition.name],
    optical = PFM_ICON_OPTICAL_SIZES[definition.name] ?? 20,
    glyphSize = circle ? optical : Math.round((optical / 20) * size * 0.75),
    style = {
      ...shell,
      borderRadius: circle || !paths ? size / 2 : undefined,
      backgroundColor:
        circle || !paths ? color(`var(${definition.colorVar})`) : undefined,
    };
  const textStyle6 = {
    fontFamily: 'UniCredit-bold',
    fontSize: Math.max(18, Math.round(size * 0.56)),
    color: color('var(--uc-static-white)'),
  } as const;
  return (
    <View accessibilityLabel={`${definition.name} PFM category`} style={style}>
      {paths ? (
        <Svg
          width={glyphSize}
          height={glyphSize}
          viewBox={PFM_ICON_VIEW_BOXES[definition.name] ?? '0 0 20 20'}
          fill="none"
        >
          {paths.map((path, i) => (
            <Path
              key={i}
              {...path}
              fill={color(
                circle
                  ? 'var(--uc-static-white)'
                  : `var(${definition.colorVar})`,
              )}
            />
          ))}
        </Svg>
      ) : (
        <Text style={textStyle6}>{definition.fallbackInitial}</Text>
      )}
    </View>
  );
}
