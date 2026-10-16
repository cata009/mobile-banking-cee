import React from 'react';
import { Pressable, View } from 'react-native';
import {
  resolveCardNavigationRow,
  type NavigationCardIdentity,
} from '@/app/components/contracts/cardNavigationRow';
import { BaselineCardArtwork } from './BaselineCardArtwork';
import { Text } from './Typography';
import { SourceCustomIcon } from './SourceCustomIcon';
import { sourceColor } from './sourceColor';

/** Original artwork is now shared with the isolated banking card renderer. */
function CardArtwork({
  card,
  dark,
}: {
  card?: NavigationCardIdentity | null;
  dark: boolean;
}) {
  const state = resolveCardNavigationRow(card);
  const shadowColor = sourceColor(
    'rgb(var(' + state.shadowToken + ')/' + state.shadowOpacity + ')',
    dark,
  );
  const shadowStyle = {
    width: state.width,
    height: state.height,
    boxShadow: [
      {
        offsetX: 0,
        offsetY: state.shadowOffsetY,
        blurRadius: state.shadowBlur,
        color: shadowColor,
      },
    ],
  };
  return (
    <View style={shadowStyle}>
      <BaselineCardArtwork
        variant={state.artVariant}
        size="figma"
        ariaLabel="Card"
        clipGeometry
      />
    </View>
  );
}
export function BaselineCardNavigationRow({
  card,
  label,
  maskedNumber,
  dark = false,
}: {
  card?: NavigationCardIdentity | null;
  label: string;
  maskedNumber?: string;
  dark?: boolean;
}) {
  const state = resolveCardNavigationRow(card);
  const number = maskedNumber ?? state.fallbackMaskedNumber;
  const color = (token: string) => sourceColor(`var(${token})`, dark);
  const pressableStyle3 = {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: state.gap,
    paddingVertical: state.paddingVertical,
  } as const;
  const viewStyle4 = { flex: 1, minWidth: 0 } as const;
  const textStyle5 = {
    fontFamily: 'UniCredit-bold',
    fontSize: state.titleFontSize,
    lineHeight: state.titleLineHeight,
    color: color(state.titleToken),
  } as const;
  const textStyle6 = {
    fontFamily: 'UniCredit-regular',
    fontSize: state.subtitleFontSize,
    lineHeight: state.subtitleLineHeight,
    marginTop: state.subtitleMarginTop,
    color: color(state.subtitleToken),
  } as const;
  const viewStyle7 = { width: state.trailingSlot } as const;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} ${number}`}
      style={pressableStyle3}
    >
      <CardArtwork card={card} dark={dark} />
      <View style={viewStyle4}>
        <Text style={textStyle5}>{label}</Text>
        <Text style={textStyle6}>{number}</Text>
      </View>
      <View style={viewStyle7}>
        <SourceCustomIcon
          name="chevron-link"
          size={32}
          color={color(state.titleToken)}
        />
      </View>
    </Pressable>
  );
}
