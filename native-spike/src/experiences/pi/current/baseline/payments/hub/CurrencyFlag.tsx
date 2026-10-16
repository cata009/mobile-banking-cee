import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import type { Currency } from '@/data/products';
interface CurrencyFlagProps {
  currency: Currency;
}
function FlagArtwork({ currency }: CurrencyFlagProps) {
  switch (currency) {
    case 'RON':
      return (
        <>
          <Rect width="12" height="24" fill="#002B7F" />
          <Rect x="12" width="12" height="24" fill="#FCD116" />
          <Rect x="24" width="12" height="24" fill="#CE1126" />
        </>
      );
    case 'EUR':
      return (
        <>
          <Rect width="36" height="24" fill="#003399" />
          {Array.from(
            {
              length: 12,
            },
            (_, index) => {
              const angle = (index * Math.PI) / 6;
              return (
                <Circle
                  key={index}
                  cx={18 + Math.sin(angle) * 7}
                  cy={12 - Math.cos(angle) * 7}
                  r="0.9"
                  fill="#FFCC00"
                />
              );
            },
          )}
        </>
      );
    case 'USD':
      return (
        <>
          <Rect width="36" height="24" fill="#FFF" />
          {Array.from(
            {
              length: 7,
            },
            (_, index) => (
              <Rect
                key={index}
                y={(index * 24) / 7}
                width="36"
                height={24 / 14}
                fill="#B22234"
              />
            ),
          )}
          <Rect width="16" height="13" fill="#3C3B6E" />
          {Array.from(
            {
              length: 12,
            },
            (_, index) => (
              <Circle
                key={index}
                cx={2.2 + (index % 4) * 3.6}
                cy={2.2 + Math.floor(index / 4) * 3.5}
                r="0.55"
                fill="#FFF"
              />
            ),
          )}
        </>
      );
    case 'GBP':
      return (
        <>
          <Rect width="36" height="24" fill="#012169" />
          <Path d="M0 0 36 24M36 0 0 24" stroke="#FFF" strokeWidth="6" />
          <Path d="M0 0 36 24M36 0 0 24" stroke="#C8102E" strokeWidth="2.5" />
          <Path d="M18 0v24M0 12h36" stroke="#FFF" strokeWidth="8" />
          <Path d="M18 0v24M0 12h36" stroke="#C8102E" strokeWidth="4" />
        </>
      );
    case 'CZK':
      return (
        <>
          <Rect width="36" height="12" fill="#FFF" />
          <Rect y="12" width="36" height="12" fill="#D7141A" />
          <Path d="M0 0 16 12 0 24Z" fill="#11457E" />
        </>
      );
    case 'HUF':
      return (
        <>
          <Rect width="36" height="8" fill="#CE2939" />
          <Rect y="8" width="36" height="8" fill="#FFF" />
          <Rect y="16" width="36" height="8" fill="#477050" />
        </>
      );
    case 'RSD':
      return (
        <>
          <Rect width="36" height="8" fill="#C6363C" />
          <Rect y="8" width="36" height="8" fill="#0C4076" />
          <Rect y="16" width="36" height="8" fill="#FFF" />
          <Path
            d="M9 5h6v10l-3 3-3-3Z"
            fill="#C6363C"
            stroke="#F4C430"
            strokeWidth="0.7"
          />
          <Path d="M10.5 9h3M12 7.5v4" stroke="#FFF" strokeWidth="0.8" />
        </>
      );
    case 'BAM':
      return (
        <>
          <Rect width="36" height="24" fill="#002395" />
          <Path d="M9 0h18v24Z" fill="#FECB00" />
          {Array.from(
            {
              length: 6,
            },
            (_, index) => (
              <Circle
                key={index}
                cx={7 + index * 4.6}
                cy={2 + index * 3.8}
                r="1.15"
                fill="#FFF"
              />
            ),
          )}
        </>
      );
  }
}

export function CurrencyFlag({ currency }: CurrencyFlagProps) {
  return (
    <View style={styles.frame}>
      <Svg
        width={36}
        height={24}
        viewBox="0 0 36 24"
        preserveAspectRatio="xMidYMid slice"
        accessible={false}
      >
        <FlagArtwork currency={currency} />
      </Svg>
    </View>
  );
}
const styles = StyleSheet.create({
  frame: {
    width: 36,
    height: 24,
    borderRadius: 2,
    overflow: 'hidden',
    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
  },
});
