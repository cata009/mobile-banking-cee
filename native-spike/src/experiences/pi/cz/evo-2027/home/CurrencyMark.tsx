import React, { useId } from 'react';
import Svg, { Circle, ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
/** Exact Source CurrencyBadge vectors, with native SVG nodes. */
export function CurrencyMark({
  currency,
  size = 40,
}: {
  currency: string;
  size?: number;
}) {
  const id = useId();
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      accessibilityLabel={`${currency} currency`}
    >
      <Defs>
        <ClipPath id={id}>
          <Circle cx={20} cy={20} r={19} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${id})`}>
        {currency === 'CZK' && (
          <>
            <Rect width={40} height={20} fill="#fff" />
            <Rect y={20} width={40} height={20} fill="#d7141a" />
            <Path d="M0 0 25 20 0 40Z" fill="#11457e" />
          </>
        )}
        {currency === 'EUR' && (
          <>
            <Rect width={40} height={40} fill="#003399" />
            {Array.from({ length: 12 }, (_, i) => (
              <Circle
                key={i}
                cx={20 + Math.cos((i * Math.PI) / 6 - Math.PI / 2) * 11}
                cy={20 + Math.sin((i * Math.PI) / 6 - Math.PI / 2) * 11}
                r={1.35}
                fill="#ffcc00"
              />
            ))}
          </>
        )}
        {currency === 'USD' && (
          <>
            <Rect width={40} height={40} fill="#fff" />
            {Array.from({ length: 7 }, (_, i) => (
              <Rect key={i} y={i * 6} width={40} height={3.08} fill="#b22234" />
            ))}
            <Rect width={19} height={21} fill="#3c3b6e" />
            {Array.from({ length: 20 }, (_, i) => (
              <Circle
                key={i}
                cx={2.7 + (i % 5) * 3.45}
                cy={3 + Math.floor(i / 5) * 4.4}
                r={0.72}
                fill="#fff"
              />
            ))}
          </>
        )}
        {!['CZK', 'EUR', 'USD'].includes(currency) && (
          <Circle cx={20} cy={20} r={20} fill="#c8e8eb" />
        )}
      </G>
      <Circle
        cx={20}
        cy={20}
        r={19}
        fill="none"
        stroke="#2626262e"
        strokeWidth={1}
      />
    </Svg>
  );
}
