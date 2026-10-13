import React, { useId } from 'react';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text,
} from 'react-native-svg';
import logo from '@/imports/svg-pn3y56bdut';
import type { DebitCard, CreditCard } from '@/data/products';
/** Source Card.tsx original path geometry (Figma nodes 3039:30713/8064/12315/4161:9198). */
export default function CardArt({ card }: { card: DebitCard | CreditCard }) {
  const id = useId().replace(/:/g, '');
  const credit = card.type === 'credit_card',
    violet = !credit && card.currency === 'EUR',
    standard = !credit && (card.id.endsWith('-2') || card.id === 'card-3');
  const pattern = violet
      ? '#AD80B9'
      : credit || standard
      ? '#E30613'
      : '#B1A06F',
    label = credit || violet ? '#FFFFFF' : '#8E8E8E';
  const text = credit || violet ? '#FFFFFF' : '#111111';
  const brandPaths = [logo.p2cef6600, logo.p27e9da00],
    textPaths = [
      logo.p3d56e1f0,
      logo.p18a76220,
      logo.p2205fa00,
      logo.p4138200,
      logo.p120fd332,
      logo.p3558cb00,
      logo.p29646d00,
      logo.p3ed7ba20,
      logo.p4240280,
    ];
  return (
    <Svg
      width={219}
      height={138}
      viewBox="0 0 64 40"
      preserveAspectRatio="none"
    >
      <Defs>
        <LinearGradient id={`${id}bg`} x1="0" x2="64" y1="0" y2="40">
          <Stop offset="0" stopColor="#CF0612" />
          <Stop offset="1" stopColor="#7C0F0D" />
        </LinearGradient>
        <LinearGradient id={`${id}pattern`} x1="0" x2="32" y1="0" y2="40">
          <Stop offset="0" stopColor={pattern} />
          <Stop offset="1" stopColor={credit ? '#B80E19' : '#D9D1BD'} />
        </LinearGradient>
      </Defs>
      <Rect
        width="64"
        height="40"
        rx="1.656"
        fill={credit ? `url(#${id}bg)` : violet ? '#772B8B' : '#F9F9FA'}
      />
      <Path
        d="M-10 4 6.3 20-10 36v-9.8L-3.7 20-10 13.8V4Z"
        opacity={credit ? 0.96 : 1}
        fill={credit || (!standard && !violet) ? `url(#${id}pattern)` : pattern}
      />
      <Path
        d="M10.3 0 31.4 20 10.3 40c-2.4-2.7-3-6.2-1.6-9.7.45-1.1 1.2-2.05 2.05-2.9L18.6 20l-7.85-7.4C9.9 11.8 9.15 10.8 8.7 9.7 7.3 6.2 7.9 2.7 10.3 0Z"
        opacity={credit ? 0.88 : 1}
        fill={credit || (!standard && !violet) ? `url(#${id}pattern)` : pattern}
      />
      <Path
        d="M10.3 0 31.4 20 10.3 40"
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity={0.1}
        strokeWidth={0.4}
      />
      <G transform={`translate(42.15 2.05) scale(${19.55 / 139.508})`}>
        {brandPaths.map((d, i) => (
          <Path key={i} d={d} fill="#E30613" fillRule="evenodd" />
        ))}
        <Path d={logo.p2e662b0} fill="#FFFFFF" />
        {textPaths.map((d, i) => (
          <Path key={i} d={d} fill={text} />
        ))}
      </G>
      <G transform="translate(47.7 9.1)">
        <Circle
          cx="4.1"
          cy="4.1"
          r="4.05"
          fill="#EB001B"
          stroke={credit ? '#ffffff' : 'transparent'}
          strokeWidth={credit ? 0.42 : 0}
        />
        <Circle
          cx="9.1"
          cy="4.1"
          r="4.05"
          fill="#F79E1B"
          stroke={credit ? '#ffffff' : 'transparent'}
          strokeWidth={credit ? 0.42 : 0}
        />
        <Path
          d="M6.6.82a4.1 4.1 0 0 1 0 6.56 4.1 4.1 0 0 1 0-6.56Z"
          fill="#FF5F00"
          opacity=".92"
        />
      </G>
      <Text
        fill={label}
        fontFamily="Arial"
        fontSize="2.55"
        fontWeight="700"
        letterSpacing=".18"
        textAnchor="end"
        x="61.1"
        y="22.1"
      >
        {credit ? 'credit' : 'debit'}
      </Text>
    </Svg>
  );
}
