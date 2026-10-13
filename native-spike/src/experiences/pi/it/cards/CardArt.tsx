import React, { useState, useId } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import type { ItalyCard } from '@/experiences/pi/it/mobile-first/cardsContent';
import { CARD_STATUS_LABELS } from '@/experiences/pi/it/mobile-first/cardsContent';
import { cardsAssets as a } from '@/experiences/pi/it/mobile-first/cardsAssets';
import { cardCapabilities } from '@/features/cards/mobileFirstCards';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { VectorArtworkLayer } from '../../../../universal/VectorArtworkLayer';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import AccountAmount from '../accounts/AccountAmount';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

function Artwork({ card }: { card: ItalyCard }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, ''),
    debit = card.kind === 'debit',
    prepaid = card.kind === 'prepaid';
  const gradient = (
    name: string,
    angle: number,
    start: number,
    end: number,
    color: string,
    opacity: number,
  ) => {
    const radians = (angle * Math.PI) / 180,
      dx = Math.sin(radians),
      dy = -Math.cos(radians),
      extent = (361 * Math.abs(dx) + 227 * Math.abs(dy)) / 2;
    return (
      <LinearGradient
        id={`${id}-${name}`}
        gradientUnits="userSpaceOnUse"
        x1={180.5 - dx * extent}
        y1={113.5 - dy * extent}
        x2={180.5 + dx * extent}
        y2={113.5 + dy * extent}
      >
        <Stop offset={`${start * 100}%`} stopColor={color} stopOpacity={0} />
        <Stop
          offset={`${Math.min(1, end) * 100}%`}
          stopColor={color}
          stopOpacity={
            end > 1 ? (opacity * (1 - start)) / (end - start) : opacity
          }
        />
      </LinearGradient>
    );
  };
  return (
    <>
      <VectorArtworkLayer
        asset={prepaid ? a.prepaidSkin : debit ? a.imgSkin1 : a.imgSkin}
        width={361}
        height={227}
      />
      {prepaid ? (
        <VectorArtworkLayer
          asset={a.prepaidPainting}
          width={362}
          height={227}
        />
      ) : (
        <>
          <VectorArtworkLayer
            asset={a.imgArrows1}
            x={-109.998}
            y={-136.115}
            width={643.939}
            height={622.738}
          />
          <VectorArtworkLayer
            asset={
              (card.settings?.image?.[0] ?? card.name) ===
              'UniCredit Flexia Etica'
                ? a.eticaArrow
                : debit
                ? a.imgArrow1
                : a.imgArrow
            }
            width={226.188}
            height={229.165}
            x={-50.855}
            y={-0.59}
            opacity={debit ? 0.8 : 1}
          />
        </>
      )}
      <Svg
        style={StyleSheet.absoluteFill}
        width={361}
        height={227}
        viewBox="0 0 361 227"
        preserveAspectRatio="none"
      >
        <Defs>
          {prepaid ? (
            <>
              {gradient('shade', 251.314, 0.50775, 1.204, '#262626', 0.7)}
              {gradient('shade2', 109.423, 0.64353, 1.0845, '#262626', 0.7)}
            </>
          ) : (
            gradient(
              'shade',
              debit ? 234.558 : 248.402,
              debit ? 0.23536 : 0.41581,
              debit ? 0.97055 : 0.97639,
              debit ? '#fff' : '#000',
              debit ? 0.7 : 0.5,
            )
          )}
        </Defs>
        <Rect x={0} y={0} width={361} height={227} fill={`url(#${id}-shade)`} />
        {prepaid && (
          <Rect
            x={0}
            y={0}
            width={361}
            height={227}
            fill={`url(#${id}-shade2)`}
          />
        )}
      </Svg>
    </>
  );
}

export default function CardArt({
  card,
  hidden,
  onOpen,
  onPin,
  mini = false,
}: {
  card: ItalyCard;
  hidden: boolean;
  onOpen?: () => void;
  onPin?: () => void;
  mini?: boolean;
}) {
  const [width, setWidth] = useState(361),
    scale = width / 361,
    debit = card.kind === 'debit',
    prepaid = card.kind === 'prepaid',
    color = debit ? '#262626' : '#fff';
  return (
    <View
      testID={`card-art-${card.id}`}
      onLayout={event =>
        setWidth(Math.max(0, event.nativeEvent.layout.width - (debit ? 2 : 0)))
      }
      style={[
        styles.art,
        debit ? styles.debit : prepaid ? styles.prepaid : styles.credit,
        mini && styles.mini,
      ]}
    >
      <View style={[styles.canvas, { transform: [{ scale }] }]}>
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Artwork card={card} />
        </View>
        {!mini && (
          <>
            <View style={styles.holder}>
              <Text style={[styles.holderName, { color }]}>
                {card.nickname ?? card.holder}
              </Text>
              <Text style={[styles.number, { color }]}>
                {hidden ? '•••• ••••' : `**** ${card.lastFour}`}
              </Text>
            </View>
            {card.status !== 'active' && (
              <Text style={styles.status}>
                {CARD_STATUS_LABELS[card.status]}
              </Text>
            )}
            <View style={styles.amounts}>
              <View>
                <AccountAmount
                  value={prepaid ? card.available : card.spending}
                  hidden={hidden}
                  cardMask
                  size={24}
                  decimalsSize={16}
                  color={color}
                />
                <Text style={[styles.small, { color }]}>
                  {prepaid ? 'Saldo disponibile' : 'Spese del mese'}
                </Text>
              </View>
              {!debit && (
                <View>
                  <AccountAmount
                    value={
                      prepaid ? card.balance ?? card.available : card.available
                    }
                    hidden={hidden}
                    cardMask
                    size={24}
                    decimalsSize={16}
                    color={color}
                  />
                  <Text style={[styles.small, { color }]}>
                    {prepaid ? 'Saldo contabile' : 'Disponibilità residua'}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
        <View style={styles.brand}>
          <AssetGlyph
            asset={debit ? a.imgUniCreditLogo1 : a.imgUniCreditLogo}
            width={70}
            height={13.5484}
          />
          <View style={styles.network}>
            <View style={styles.networkImage}>
              <AssetGlyph asset={a.imgGroup} width={88.4666} height={61.2499} />
            </View>
          </View>
          <Text style={[styles.small, { color }]}>
            {prepaid ? 'Prepaid' : debit ? 'Debit' : 'Credit'}
          </Text>
        </View>
        <Text
          style={[styles.name, { color }, card.premium && styles.premiumName]}
        >
          {card.premium ? 'Linea Premium\n' : ''}
          {card.name}
        </Text>
        {onOpen && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Apri carta ${card.name} ${
              hidden ? '•••• ••••' : card.lastFour
            }`}
            onPress={onOpen}
            style={StyleSheet.absoluteFill}
          />
        )}
        {!mini && onPin && cardCapabilities(card.kind, card.status).reveal && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`PIN ${card.name}`}
            onPress={onPin}
            style={styles.pin}
          >
            <Text
              style={[styles.small, { color, fontFamily: tokens.strongFont }]}
            >
              PIN
            </Text>
            <AssetGlyph
              asset={debit ? a.whiteEye : a.imgNavigationAndActionShowK10}
              size={16}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  debit: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5' },
  prepaid: { backgroundColor: '#262626' },
  credit: { backgroundColor: '#b90012' },
  premiumName: { top: 163 },
  art: {
    width: '100%',
    aspectRatio: 361 / 227,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mini: { width: 212 },
  canvas: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 361,
    height: 227,
    transformOrigin: 'top left',
  },
  network: { width: 70, height: 50.313, overflow: 'hidden', marginBottom: -4 },
  networkImage: { position: 'absolute', left: -9.128, top: -6.123 },
  holderName: { fontFamily: tokens.strongFont, fontSize: 14, lineHeight: 16 },
  holder: { position: 'absolute', top: 16, left: 16, gap: 2 },
  small: { fontFamily: tokens.font, fontSize: 14, lineHeight: 20 },
  number: { fontFamily: tokens.strongFont, fontSize: 16, lineHeight: 18 },
  status: {
    position: 'absolute',
    right: 16,
    top: 16,
    fontFamily: tokens.strongFont,
    fontSize: 12,
    color: '#262626',
    backgroundColor: '#e5e5e5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  amounts: {
    position: 'absolute',
    left: 16,
    top: 92,
    flexDirection: 'row',
    gap: 16,
  },
  brand: {
    position: 'absolute',
    right: 16,
    top: 59,
    alignItems: 'flex-end',
    gap: 4,
  },
  name: {
    position: 'absolute',
    top: 191,
    left: 16,
    fontFamily: tokens.strongFont,
    fontSize: 18,
    lineHeight: 24,
  },
  pin: {
    position: 'absolute',
    top: 191,
    right: 16,
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
