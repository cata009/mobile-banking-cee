import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { STACKED_PRODUCT_SHADOW as state } from '@/app/components/contracts/stackedProductShadow';
import { sourceColor } from './sourceColor';
export function BaselineStackedProductShadow({
  dark = false,
}: {
  dark?: boolean;
}) {
  const outer = {
      height: state.height,
      width: '100%' as const,
      alignItems: 'center' as const,
    },
    inner = {
      height: state.height,
      width: `${state.widthPercent}%` as `${number}%`,
    };
  return (
    <View style={outer}>
      <View style={inner}>
        <Svg
          width="100%"
          height={state.height}
          viewBox={state.viewBox}
          preserveAspectRatio="none"
        >
          <Path
            d={state.path}
            fillRule="evenodd"
            clipRule="evenodd"
            fill={sourceColor(`var(${state.surfaceToken})`, dark)}
          />
          <Path
            d={state.linePath}
            opacity={state.lineOpacity}
            stroke={sourceColor(`var(${state.lineToken})`, dark)}
            strokeWidth="1"
          />
        </Svg>
      </View>
    </View>
  );
}
